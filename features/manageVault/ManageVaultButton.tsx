import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import { ManageVaultStage, ManageVaultState } from './manageVault'

function manageVaultButtonText(stage: ManageVaultStage): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'daiEditing':
    case 'collateralEditing':
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
    case 'manageWaitingForConfirmation':
      return t('change-your-vault')
    case 'manageFailure':
      return t('retry')
    case 'manageSuccess':
      return t('back-to-editing')
    case 'manageWaitingForApproval':
    case 'manageInProgress':
      return t('creating-vault')
    default:
      throw new UnreachableCaseError(stage)
  }
}

export function ManageVaultButton({ progress, errorMessages, stage }: ManageVaultState) {
  const isLoading = ([
    'proxyInProgress',
    'proxyInProgress',
    'proxyWaitingForApproval',
    'collateralAllowanceWaitingForApproval',
    'collateralAllowanceInProgress',
    'daiAllowanceWaitingForApproval',
    'daiAllowanceInProgress',
    'manageInProgress',
    'manageWaitingForApproval',
  ] as ManageVaultStage[]).some((s) => s === stage)

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }
  const errorString = errorMessages.join(',\n')
  const hasError = !!errorString

  const buttonText = manageVaultButtonText(stage)

  return (
    <Button onClick={handleProgress} disabled={hasError}>
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
