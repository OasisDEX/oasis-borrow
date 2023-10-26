import BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import {
  type OmniFormAction,
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
} from 'features/omni-kit/types'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TransitionProps {
  action?: OmniFormAction
  positionId?: string
  productType?: string
  protocol?: LendingProtocol
}

export function useOmniProductTypeTransition({
  action,
  positionId,
  productType,
  protocol,
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
    const jwtToken = jwtAuthGetToken(walletAddress || '')

    if (jwtToken && positionId && chainId && protocol && vaultType) {
      setIsTransitionInProgress(true)
      saveVaultUsingApi$(
        new BigNumber(positionId),
        jwtToken,
        vaultType,
        chainId,
        protocol.toLowerCase(),
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
