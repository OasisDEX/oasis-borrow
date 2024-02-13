import { AjnaRewardsSource } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import { getAjnaRewards } from 'features/ajna/rewards/helpers'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import type { getAjnaRewardsData } from 'handlers/ajna-rewards/getAjnaRewardsData'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface AjnaRewardsParamsState {
  isError: boolean
  isLoading: boolean
  rewards: AjnaRewards
  successfullyFetched: boolean
  refetch(): void
}

const defaultRewards: AjnaRewards = {
  bonus: zero,
  claimable: zero,
  claimableBonus: zero,
  regular: zero,
  total: zero,
  totalUsd: zero,
  lastDayRewardsUsd: zero,
  ajnaPrice: zero,
  currentPeriodPositionEarned: zero,
  currentPeriodTotalEarned: zero,
  totalClaimableAndTotalCurrentPeriodEarned: zero,
  totalEarnedToDate: zero,
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
  successfullyFetched: false,
  isLoading: false,
}

export const useAjnaRewards = (
  address?: string,
  poolAddress?: string,
  type?: 'borrow' | 'earn',
): AjnaRewardsParamsState => {
  const { walletAddress } = useAccount()
  const { chainId } = useWalletManagement()
  const resolvedAddress = useMemo(() => address || walletAddress, [address, walletAddress])
  const [state, setState] = useState<AjnaRewardsParamsState>({
    rewards: defaultRewards,
    isError: false,
    isLoading: true,
    successfullyFetched: false,
    refetch: () => {},
  })
  const { tokenPriceUSD$ } = useProductContext()
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['AJNA']), [])

  const [tokenPrices] = useObservable(_tokenPriceUSD$)

  const fetchData = useCallback(
    async (forceFetch: boolean): Promise<void> => {
      if (state.successfullyFetched && !forceFetch) {
        return
      }

      setState({
        ...state,
        isLoading: true,
      })

      if (resolvedAddress && tokenPrices) {
        try {
          const subgraphResponse = await getAjnaRewards(resolvedAddress)

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

          const poolAddressQuery = poolAddress ? `&poolAddress=${poolAddress.toLowerCase()}` : ''

          const typeQuery = type ? `&type=${type.toLowerCase()}` : ''

          const apiResponse = await fetch(
            `/api/ajna-rewards?address=${resolvedAddress.toLocaleLowerCase()}&networkId=${chainId}${bonusWeeksQuery}${regularWeeksQuery}${poolAddressQuery}${typeQuery}`,
          )

          const parseApiResponse = (await apiResponse.json()) as Awaited<
            ReturnType<typeof getAjnaRewardsData>
          >

          if (parseApiResponse.bonusAmount) {
            const bonus = new BigNumber(parseApiResponse.bonusAmount)
            const regular = new BigNumber(parseApiResponse.coreAmount)
            const claimable = new BigNumber(parseApiResponse.claimableToday)
            const claimableBonus = new BigNumber(parseApiResponse.claimableBonusToday)
            const lastDayRewards = new BigNumber(parseApiResponse.lastDayRewards)
            const total = bonus.plus(regular)
            const currentPeriodPositionEarned = new BigNumber(
              parseApiResponse.currentPeriodPositionEarned,
            )
            const currentPeriodTotalEarned = new BigNumber(
              parseApiResponse.currentPeriodTotalEarned,
            )
            const totalClaimableAndTotalCurrentPeriodEarned = new BigNumber(
              parseApiResponse.totalClaimableAndTotalCurrentPeriodEarned,
            )
            const totalEarnedToDate = new BigNumber(parseApiResponse.totalEarnedToDate)

            const payload = parseApiResponse.payload

            setState({
              ...state,
              rewards: {
                total,
                totalUsd: total.times(tokenPrices.AJNA),
                bonus,
                regular,
                claimable,
                payload,
                claimableBonus,
                currentPeriodPositionEarned,
                currentPeriodTotalEarned,
                totalClaimableAndTotalCurrentPeriodEarned,
                totalEarnedToDate,
                lastDayRewardsUsd: lastDayRewards.times(tokenPrices.AJNA),
                ajnaPrice: tokenPrices.AJNA,
              },
              isError: false,
              isLoading: false,
              successfullyFetched: true,
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
    },
    [resolvedAddress, tokenPrices],
  )

  useEffect(() => void fetchData(false), [fetchData])

  return {
    ...state,
    refetch: () => {
      return fetchData(true)
    },
  }
}
