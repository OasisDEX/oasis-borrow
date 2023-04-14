import { BigNumber } from 'bignumber.js'
import { claimAjnaRewards } from 'blockchain/calls/ajnaRewardsClaimer'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { useAppContext } from 'components/AppContextProvider'
import {
  AjnaUserNftsResponse,
  getAjnaUserNfts,
} from 'features/ajna/rewards/helpers/getAjnaUserNfts'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { handleTransaction, TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { one, zero } from 'helpers/zero'
import { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

interface AjnaUserNfts {
  isLoading: boolean
  rewards: {
    tokens: BigNumber
    usd: BigNumber
    numberOfPositions: number
  }
  handler?: () => void
  txDetails?: TxDetails
}

export const useAjnaUserNfts = (): AjnaUserNfts => {
  const { walletAddress } = useAccount()
  const { txHelpers$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [nfts, setNfts] = useState<AjnaUserNftsResponse[]>()
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    if (walletAddress) {
      void getAjnaUserNfts(walletAddress)
        .then((data) => {
          setIsLoading(false)
          setNfts(data)
        })
        .catch((error) => {
          console.error(error)
          setIsLoading(false)
        })
    }
  }, [walletAddress, txDetails?.txStatus])

  if (!nfts?.length) {
    return {
      isLoading,
      rewards: {
        tokens: zero,
        usd: zero,
        numberOfPositions: 0,
      },
      txDetails: undefined,
      handler: undefined,
    }
  }

  const tokenRewards = nfts.reduce((acc, curr) => acc.plus(curr.currentReward), zero)

  return {
    isLoading,
    rewards: {
      tokens: tokenRewards,
      // TODO times ajna price
      usd: tokenRewards.times(one),
      numberOfPositions: nfts.length,
    },
    txDetails,
    handler: () =>
      txHelpers
        ?.sendWithGasEstimation(claimAjnaRewards, {
          kind: TxMetaKind.claimAjnaRewards,
          nftIds: nfts.map((nft) => nft.id),
        })
        .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
        .subscribe((txState) => {
          handleTransaction({
            txState,
            ethPrice: zero,
            setTxDetails,
          })
        }),
  }
}
