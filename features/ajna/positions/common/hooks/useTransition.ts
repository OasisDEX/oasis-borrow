import BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import type { ProtocolFormAction } from 'features/unifiedProtocol/types'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TransitionProps {
  action?: ProtocolFormAction
  positionId?: string
  product?: string
  protocol?: LendingProtocol
}

export function useProductTypeTransition({
  action,
  positionId,
  product,
  protocol,
}: TransitionProps) {
  const { reload } = useRouter()
  const { chainId, walletAddress } = useAccount()
  const [isTransitionWaitingForApproval, setisTransitionWaitingForApproval] =
    useState<boolean>(false)
  const [isTransitionInProgress, setIsTransitionInProgress] = useState<boolean>(false)
  const vaultType =
    product === 'borrow'
      ? VaultType.Multiply
      : product === 'multiply'
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
    isTransitionAction: action === 'switch-borrow' || action === 'switch-multiply',
    isTransitionInProgress,
    isTransitionWaitingForApproval,
    setisTransitionWaitingForApproval,
    transitionHandler,
  }
}
