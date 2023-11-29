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
  regular: zero,
  total: zero,
  totalUsd: zero,
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
      Promise.all([
        fetch(
          `/api/ajna-rewards?address=${resolvedAddress.toLocaleLowerCase()}&networkId=${chainId}`,
        ),
        getAjnaRewards(resolvedAddress, chainId),
      ])
        .then(async ([apiResponse, subgraphResponse]) => {
          const parseApiResponse = (await apiResponse.json()) as Awaited<
            ReturnType<typeof getAjnaRewardsData>
          >
          const claimed = subgraphResponse.reduce((total, current) => total + current.amount, 0)

          if (parseApiResponse.amount) {
            setState({
              ...state,
              rewards: {
                total: new BigNumber(parseApiResponse.amount).minus(claimed),
                // TODO: recalculate when Ajna Token value is available
                totalUsd: zero,
                bonus: zero,
                regular: zero,
                claimable: zero,
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
        })
        .catch(() => {
          setState({
            ...state,
            ...errorState,
          })
        })
    }
  }, [resolvedAddress])

  useEffect(() => void fetchData(), [fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}
