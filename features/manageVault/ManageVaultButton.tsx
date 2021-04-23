import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import { ManageVaultStage, ManageVaultState } from './manageVault'

function manageVaultButtonEditingText({ editingButtonDisabled }: ManageVaultState): string {
  const { t } = useTranslation()
  return editingButtonDisabled ? t('enter-an-amount') : t('confirm')
}

function manageVaultButtonText(state: ManageVaultState): string {
  const { t } = useTranslation()

  switch (state.stage) {
    case 'daiEditing':
    case 'collateralEditing':
      return manageVaultButtonEditingText(state)
    case 'manageWaitingForConfirmation':
      return t('confirm')
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
  const { progress, errorMessages, stage, editingButtonDisabled } = props

  const isLoading = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'collateralAllowanceWaitingForApproval',
    'collateralAllowanceInProgress',
    'daiAllowanceWaitingForApproval',
    'daiAllowanceInProgress',
    'manageInProgress',
    'manageWaitingForApproval',
  ] as ManageVaultStage[]).some((s) => s === stage)

  const hasError = !!errorMessages.length

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  const buttonText = manageVaultButtonText(props)

  return (
    <Button onClick={handleProgress} disabled={editingButtonDisabled || hasError}>
      {isLoading ? (
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
