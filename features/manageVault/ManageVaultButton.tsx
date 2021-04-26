import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import { ManageVaultStage, ManageVaultState } from './manageVault'

function manageVaultButtonText(state: ManageVaultState): string {
  const { t } = useTranslation()

  switch (state.stage) {
    case 'daiEditing':
    case 'collateralEditing':
      return state.inputAmountsEmpty ? t('enter-an-amount') : t('confirm')
    case 'proxySuccess':
    case 'daiAllowanceSuccess':
    case 'collateralAllowanceSuccess':
      return t('continue')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'collateralAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForConfirmation':
      return t('approve-allowance')
    case 'collateralAllowanceFailure':
    case 'daiAllowanceFailure':
      return t('retry-allowance-approval')
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceWaitingForApproval':
      return t('approving-allowance')
    case 'manageWaitingForConfirmation':
      return t('confirm')
    case 'manageFailure':
      return t('retry')
    case 'manageSuccess':
      return t('back-to-editing')
    case 'manageWaitingForApproval':
    case 'manageInProgress':
      return t('changing-vault')
    default:
      throw new UnreachableCaseError(state.stage)
  }
}

export function ManageVaultButton(props: ManageVaultState) {
  const { progress, isLoadingStage, editingButtonDisabled } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  const buttonText = manageVaultButtonText(props)

  return (
    <Button onClick={handleProgress} disabled={editingButtonDisabled}>
      {isLoadingStage ? (
        <Flex sx={{ justifyContent: 'center' }}>
          <Spinner size={25} color="surface" />
          <Text pl={2}>{buttonText}</Text>
        </Flex>
      ) : (
        <Text>{buttonText}</Text>
      )}
    </Button>
  )
}
