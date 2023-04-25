import BigNumber from 'bignumber.js'
import { AjnaFormAction } from 'features/ajna/common/types'
import { VaultType } from 'features/generalManageVault/vaultType'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocol } from 'lendingProtocols'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TransitionProps {
  action?: AjnaFormAction
  positionId?: string
  product?: VaultType
  protocol?: LendingProtocol
}

export function useTransition({ action, positionId, product, protocol }: TransitionProps) {
  const { reload } = useRouter()
  const { chainId, walletAddress } = useAccount()
  const [isTransitionWairingForApproval, setIsTransitionWairingForApproval] =
    useState<boolean>(false)
  const [isTransitionInProgress, setIsTransitionInProgress] = useState<boolean>(false)

  const transitionHandler = () => {
    const jwtToken = jwtAuthGetToken(walletAddress as string)

    if (jwtToken && positionId && product && chainId && protocol) {
      setIsTransitionInProgress(true)
      saveVaultUsingApi$(
        new BigNumber(positionId),
        jwtToken,
        product,
        chainId,
        protocol.toLowerCase(),
      ).subscribe(reload)
    } else throw new Error(`Not enough position data provided`)
  }

  return {
    isTransitionAction: action === 'switch-borrow' || action === 'switch-multiply',
    isTransitionInProgress,
    isTransitionWairingForApproval,
    setIsTransitionWairingForApproval,
    transitionHandler,
  }
}
