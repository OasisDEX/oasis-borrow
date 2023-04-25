import BigNumber from 'bignumber.js'
import { AjnaFormAction } from 'features/ajna/common/types'
import { VaultType } from 'features/generalManageVault/vaultType'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocol } from 'lendingProtocols'
import { useState } from 'react'

interface TransitionProps {
  action?: AjnaFormAction
  positionId?: string
  product?: VaultType
  protocol?: LendingProtocol
}

export function useTransition({ action, positionId, product, protocol }: TransitionProps) {
  const { chainId, walletAddress } = useAccount()
  const [isTransitionWairingForApproval, setIsTransitionWairingForApproval] =
    useState<boolean>(false)
  const [isTransitionInProgress, setIsTransitionInProgress] = useState<boolean>(false)

  const transitionHandler = () => {
    if (positionId && walletAddress && product && chainId && protocol) {
      setIsTransitionInProgress(true)
      saveVaultUsingApi$(
        new BigNumber(positionId),
        walletAddress,
        product,
        chainId,
        protocol,
      ).subscribe()
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
