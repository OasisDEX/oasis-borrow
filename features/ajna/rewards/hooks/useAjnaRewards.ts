import { AjnaRewardsSource } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getAjnaRewards } from 'features/ajna/rewards/helpers'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import type { getAjnaRewardsData } from 'handlers/ajna-rewards/getAjnaRewardsData'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface AjnaRewardsParamsState {
  isError: boolean
  isLoading: boolean
  rewards: AjnaRewards
  refetch(): void
}

const defaultRewards: AjnaRewards = {
  bonus: zero,
  claimable: zero,
  claimableBonus: zero,
  regular: zero,
  total: zero,
  totalUsd: zero,
  payload: {
    bonus: {
      weeks: [],
      amounts: [],
      proofs: [],
    },
    core: {
      weeks: [],
      amounts: [],
      proofs: [],
    },
  },
}
const errorState = {
  rewards: defaultRewards,
  isError: true,
  isLoading: false,
}

export const useAjnaRewards = (address?: string): AjnaRewardsParamsState => {
  const { walletAddress } = useAccount()
  const { chainId } = useWalletManagement()
  const resolvedAddress = useMemo(() => address || walletAddress, [address, walletAddress])
  const [state, setState] = useState<AjnaRewardsParamsState>({
    rewards: defaultRewards,
    isError: false,
    isLoading: true,
    refetch: () => {},
  })

  const fetchData = useCallback(async (): Promise<void> => {
    setState({
      ...state,
      isLoading: true,
    })

    if (resolvedAddress) {
      try {
        const subgraphResponse = await getAjnaRewards(resolvedAddress, chainId)

        const claimedBonusWeeks = subgraphResponse
          .filter((item) => item.type === AjnaRewardsSource.bonus)
          .map((item) => item.week)

        const claimedCoreWeeks = subgraphResponse
          .filter((item) => item.type === AjnaRewardsSource.core)
          .map((item) => item.week)

        const bonusWeeksQuery = claimedBonusWeeks.length
          ? `&claimedBonusWeeks=${claimedBonusWeeks}`
          : ''
        const regularWeeksQuery = claimedCoreWeeks.length
          ? `&claimedCoreWeeks=${claimedCoreWeeks}`
          : ''

        const apiResponse = await fetch(
          `/api/ajna-rewards?address=${resolvedAddress.toLocaleLowerCase()}&networkId=${chainId}${bonusWeeksQuery}${regularWeeksQuery}`,
        )

        const parseApiResponse = (await apiResponse.json()) as Awaited<
          ReturnType<typeof getAjnaRewardsData>
        >

        if (parseApiResponse.bonusAmount) {
          const bonus = new BigNumber(parseApiResponse.bonusAmount)
          const regular = new BigNumber(parseApiResponse.coreAmount)
          const claimable = new BigNumber(parseApiResponse.claimableToday)
          const claimableBonus = new BigNumber(parseApiResponse.claimableBonusToday)
          const total = bonus.plus(regular)

          const payload = parseApiResponse.payload

          setState({
            ...state,
            rewards: {
              total,
              totalUsd: zero,
              bonus,
              regular,
              claimable,
              payload,
              claimableBonus,
            },
            isError: false,
            isLoading: false,
          })
        }
        if (parseApiResponse.error) {
          setState({
            ...state,
            ...errorState,
          })
        }
      } catch (e) {
        console.warn('Failed to fetch Ajna rewards data', e)
        setState({
          ...state,
          ...errorState,
        })
      }
    }
  }, [resolvedAddress])

  useEffect(() => void fetchData(), [fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}
