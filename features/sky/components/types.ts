import type BigNumber from 'bignumber.js'
import type { ethers } from 'ethers'
import type { ResolvedDepositParamsType } from 'features/sky/hooks/useSkyTokenSwap'

export type SkyTokensSwapType = {
  primaryToken: 'DAI' | 'MKR' | 'USDS'
  secondaryToken: 'USDS' | 'SKY' | 'SUSDS'
  primaryTokenBalance: BigNumber
  primaryTokenAllowance: BigNumber
  secondaryTokenBalance: BigNumber
  secondaryTokenAllowance: BigNumber
  walletAddress?: string
  setIsLoadingAllowance: (isLoading: boolean) => void
  isLoadingAllowance: boolean
  depositAction: (params: {
    isTokenSwapped: boolean
    resolvedPrimaryTokenData: ResolvedDepositParamsType
    amount: BigNumber
    signer: ethers.Signer
  }) => () => void
}
