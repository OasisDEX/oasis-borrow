import BigNumber from 'bignumber.js'
import { useCustomNetworkParameter } from 'blockchain/networks'
import { Rewards } from 'features/ajna/common/components/AjnaRewardCard'
import { getAjnaRewards } from 'features/ajna/positions/common/helpers/getAjnaRewards'
import { getAjnaRewardsData } from 'handlers/ajna-rewards/getAjnaRewardsData'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface AjnaRewardsParamsState {
  rewards: Rewards
  isError: boolean
  isLoading: boolean
  refetch(): void
}

const defaultRewards = {
  tokens: zero,
  usd: zero,
}
const errorState = {
  rewards: defaultRewards,
  isError: true,
  isLoading: false,
}

export const useAjnaRewards = (address?: string): AjnaRewardsParamsState => {
  const { walletAddress } = useAccount()
  const [networkParameter] = useCustomNetworkParameter()
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

    if (resolvedAddress && networkParameter) {
      Promise.all([
        fetch(
          `/api/ajna-rewards?address=${resolvedAddress.toLocaleLowerCase()}&networkId=${
            networkParameter.id
          }`,
        ),
        getAjnaRewards(resolvedAddress),
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
                tokens: new BigNumber(parseApiResponse.amount).minus(claimed),
                // TODO: recalculate when Ajna Token value is available
                usd: zero,
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
  }, [resolvedAddress, networkParameter?.id])

  useEffect(() => void fetchData(), [fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}
