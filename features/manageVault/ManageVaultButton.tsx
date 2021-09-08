import { trackingEvents } from 'analytics/analytics'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Divider, Flex, Spinner, Text } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import { ManageVaultState } from './manageVault'

function manageVaultButtonText(state: ManageVaultState): string {
  const { t } = useTranslation()

  switch (state.stage) {
    case 'daiEditing':
    case 'collateralEditing':
      return state.inputAmountsEmpty
        ? t('enter-an-amount')
        : !state.proxyAddress
        ? t('setup-proxy')
        : state.insufficientCollateralAllowance
        ? t('set-token-allowance', { token: state.vault.token })
        : state.insufficientDaiAllowance
        ? t('set-token-allowance', { token: 'DAI' })
        : t('confirm')

    case 'proxySuccess':
      return state.insufficientCollateralAllowance
        ? t('set-token-allowance', { token: state.vault.token })
        : state.insufficientDaiAllowance
        ? t('set-token-allowance', { token: 'DAI' })
        : t('continue')

    case 'collateralAllowanceSuccess':
      return state.insufficientDaiAllowance
        ? t('set-token-allowance', { token: 'DAI' })
        : t('continue')

    case 'daiAllowanceSuccess':
      return t('continue')

    case 'proxyFailure':
      return t('retry-create-proxy')

    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')

    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')

    case 'collateralAllowanceWaitingForConfirmation':
      return state.customCollateralAllowanceAmountEmpty
        ? t('enter-allowance-amount')
        : t('set-token-allowance', { token: state.vault.token })

    case 'daiAllowanceWaitingForConfirmation':
      return state.customDaiAllowanceAmountEmpty
        ? t('enter-allowance-amount')
        : t('set-token-allowance', { token: 'DAI' })

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
      return t('ok')

    case 'manageWaitingForApproval':
    case 'manageInProgress':
      return t('changing-vault')

    case 'multiplyTransitionEditing':
      return 'Multiply this Vault'

    case 'multiplyTransitionWaitingForConfirmation':
      return 'Take me to the Multiply interface'

    case 'multiplyTransitionInProgress':
      return 'Transition in progress...'

    case 'multiplyTransitionFailure':
      return 'Something went wrong, try again'

    case 'multiplyTransitionSuccess':
      return 'Transition completed, refreshing...'

    default:
      throw new UnreachableCaseError(state.stage)
  }
}

function manageVaultSecondaryButtonText(state: ManageVaultState): string {
  const {
    isCollateralAllowanceStage,
    vault: { token },
  } = state
  const { t } = useTranslation()

  switch (state.stage) {
    case 'daiAllowanceFailure':
    case 'collateralAllowanceFailure':
      return t('edit-token-allowance', { token: isCollateralAllowanceStage ? token : 'DAI' })
    case 'multiplyTransitionEditing':
    case 'multiplyTransitionWaitingForConfirmation':
    case 'multiplyTransitionFailure':
      return 'Decide later'
    default:
      return t('edit-vault-details')
  }
}
export function ManageVaultButton(props: ManageVaultState) {
  const {
    progress,
    stage,
    isLoadingStage,
    canProgress,
    canRegress,
    regress,
    depositAmount,
    generateAmount,
    paybackAmount,
    withdrawAmount,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  function handleRegress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    regress!()
  }

  const buttonText = manageVaultButtonText(props)
  const secondaryButtonText = manageVaultSecondaryButtonText(props)

  function trackEvents() {
    if (stage === 'daiEditing' && generateAmount && generateAmount.gt(0)) {
      trackingEvents.manageDaiGenerateConfirm()
    }
    if (stage === 'daiEditing' && paybackAmount && paybackAmount.gt(0)) {
      trackingEvents.manageDaiPaybackConfirm()
    }
    if (stage === 'collateralEditing' && depositAmount && depositAmount.gt(0)) {
      trackingEvents.manageCollateralDepositConfirm()
    }
    if (stage === 'collateralEditing' && withdrawAmount && withdrawAmount.gt(0)) {
      trackingEvents.manageCollateralWithdrawConfirm()
    }
    if (stage === 'collateralAllowanceWaitingForConfirmation') {
      trackingEvents.manageCollateralApproveAllowance()
    }
    if (stage === 'daiAllowanceWaitingForConfirmation') {
      trackingEvents.manageDaiApproveAllowance()
    }
  }

  if (stage === 'manageInProgress') {
    return null
  }

  return (
    <>
      <Button
        onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
          trackEvents()
          handleProgress(e)
        }}
        disabled={!canProgress}
      >
        {isLoadingStage ? (
          <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text sx={{ position: 'relative' }} pl={2}>
              <Spinner
                size={25}
                color="surface"
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translate(-105%, -50%)',
                }}
              />
              {buttonText}
            </Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {canRegress && (
        <>
          <Divider variant="styles.hrVaultFormBottom" />
          <Button
            variant="textualSmall"
            onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
              if (
                stage !== 'daiAllowanceFailure' &&
                stage !== 'collateralAllowanceFailure' &&
                stage !== 'multiplyTransitionEditing' &&
                stage !== 'multiplyTransitionWaitingForConfirmation' &&
                stage !== 'multiplyTransitionFailure'
              ) {
                trackingEvents.manageVaultConfirmVaultEdit()
              }

              handleRegress(e)
            }}
          >
            {secondaryButtonText}
          </Button>
        </>
      )}
    </>
  )
}
