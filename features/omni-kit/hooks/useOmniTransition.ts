import BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import {
  OmniBorrowFormAction,
  type OmniFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
} from 'features/omni-kit/types'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TransitionProps {
  tokenPair: string
  action?: OmniFormAction
  positionId?: string
  productType?: OmniProductType
  protocol?: LendingProtocol
}

export function useOmniProductTypeTransition({
  action,
  positionId,
  productType,
  protocol,
  tokenPair,
}: TransitionProps) {
  const { reload } = useRouter()
  const { chainId, walletAddress } = useAccount()
  const [isTransitionWaitingForApproval, setisTransitionWaitingForApproval] =
    useState<boolean>(false)
  const [isTransitionInProgress, setIsTransitionInProgress] = useState<boolean>(false)
  const vaultType =
    productType === OmniProductType.Borrow
      ? VaultType.Multiply
      : productType === OmniProductType.Multiply
        ? VaultType.Borrow
        : undefined

  const transitionHandler = () => {
    if (positionId && chainId && protocol && vaultType && walletAddress) {
      setIsTransitionInProgress(true)
      saveVaultUsingApi$(
        new BigNumber(positionId),
        vaultType,
        chainId,
        protocol.toLowerCase(),
        walletAddress,
        tokenPair.toUpperCase(),
      ).subscribe(reload)
    } else throw new Error(`Not enough position data provided`)
  }

  return {
    isTransitionAction:
      action === OmniBorrowFormAction.SwitchBorrow ||
      action === OmniMultiplyFormAction.SwitchMultiply,
    isTransitionInProgress,
    isTransitionWaitingForApproval,
    setisTransitionWaitingForApproval,
    transitionHandler,
  }
}
