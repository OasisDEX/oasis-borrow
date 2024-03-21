import type { VaultApyResponse } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { getOmniDepositAmountFromPullToken } from 'features/omni-kit/helpers'
import {
  getErc4626Apy,
  getErc4626ApyParameters,
} from 'features/omni-kit/protocols/erc-4626/helpers'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useMemo, useState } from 'react'

interface Erc4626ApySimulationParams {
  rewardTokenPrice?: BigNumber
  vaultAddress: string
}

interface Erc4626ApySimulationDetails<T> {
  per1d: T
  per30d: T
  per365d: T
}

type Erc4626ApySimulationApy = {
  rewardsApy: Erc4626ApySimulationDetails<
    {
      per1kUsd?: BigNumber
      token: string
      value: BigNumber
    }[]
  >
  vaultApy: Erc4626ApySimulationDetails<BigNumber>
}
type Erc4626ApySimulationEarnings = Erc4626ApySimulationDetails<BigNumber>
type Erc4626ApySimulationNetValue = Erc4626ApySimulationDetails<BigNumber>

interface Erc4626ApySimulationResponse {
  apy?: Erc4626ApySimulationApy
  earnings?: Erc4626ApySimulationEarnings
  isLoading: boolean
  netValue?: Erc4626ApySimulationNetValue
}

export function useErc4626ApySimulation({
  vaultAddress,
  rewardTokenPrice,
}: Erc4626ApySimulationParams): Erc4626ApySimulationResponse {
  const {
    environment: { productType, protocolPrices, quotePrice },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { depositAmount, pullToken },
    },
  } = useOmniProductContext(productType)

  const [cancelablePromise, setCancelablePromise] = useState<CancelablePromise<VaultApyResponse>>()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [apy, setApy] = useState<Erc4626ApySimulationApy>()
  const [earnings, setEarnings] = useState<Erc4626ApySimulationEarnings>()
  const [netValue, setNetValue] = useState<Erc4626ApySimulationNetValue>()

  const resolvedDepositAmount = useMemo(
    () =>
      getOmniDepositAmountFromPullToken({
        quotePrice,
        depositAmount,
        pullToken,
      }),
    [depositAmount, pullToken, quotePrice],
  )

  useEffect(() => {
    setIsLoading(true)
    cancelablePromise?.cancel()
  }, [resolvedDepositAmount, rewardTokenPrice])

  useDebouncedEffect(
    () => {
      const promise = cancelable(
        getErc4626ApyParameters({ rewardTokenPrice, prices: protocolPrices })(vaultAddress),
      )

      setCancelablePromise(promise)

      void promise.then(({ vault, apyFromRewards }) => {
        if (apyFromRewards) {
          const rewardsApy = apyFromRewards.map(({ per1kUsd, token, value }) => ({
            token,
            value: new BigNumber(value),
            ...(per1kUsd && { per1kUsd: new BigNumber(per1kUsd) }),
          }))
          const vaultApy = new BigNumber(vault.apy)
          const totalApy = getErc4626Apy({
            rewardsApy,
            vaultApy,
          })

          setApy({
            rewardsApy: {
              per1d: rewardsApy.map(({ per1kUsd, token, value }) => ({
                token,
                value: value.div(365),
                ...(per1kUsd && { per1kUsd: per1kUsd.div(365) }),
              })),
              per30d: rewardsApy.map(({ per1kUsd, token, value }) => ({
                token,
                value: value.div(12),
                ...(per1kUsd && { per1kUsd: per1kUsd.div(12) }),
              })),
              per365d: rewardsApy,
            },
            vaultApy: {
              per1d: vaultApy.div(365),
              per30d: vaultApy.div(12),
              per365d: vaultApy,
            },
          })
          setEarnings({
            per1d: resolvedDepositAmount.times(totalApy.div(365)),
            per30d: resolvedDepositAmount.times(totalApy.div(12)),
            per365d: resolvedDepositAmount.times(totalApy),
          })
          setNetValue({
            per1d: resolvedDepositAmount.plus(resolvedDepositAmount.times(totalApy.div(365))),
            per30d: resolvedDepositAmount.plus(resolvedDepositAmount.times(totalApy.div(12))),
            per365d: resolvedDepositAmount.plus(resolvedDepositAmount.times(totalApy)),
          })
        }

        setIsLoading(false)
      })
    },
    [resolvedDepositAmount, rewardTokenPrice, vaultAddress],
    250,
  )

  return {
    apy,
    earnings,
    isLoading,
    netValue,
  }
}
