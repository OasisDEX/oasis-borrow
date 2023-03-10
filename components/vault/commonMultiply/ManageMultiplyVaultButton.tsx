import { trackingEvents } from 'analytics/analytics'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Divider, Flex, Spinner, Text } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import { ManageMultiplyVaultState } from '../../../features/multiply/manage/pipes/manageMultiplyVault'

function manageMultiplyVaultButtonText(state: ManageMultiplyVaultState): string {
  const { t } = useTranslation()

  switch (state.stage) {
    case 'adjustPosition':
    case 'otherActions':
      return state.inputAmountsEmpty
        ? state.stage === 'adjustPosition'
          ? t('adjust-your-position')
          : t('enter-an-amount')
        : !state.proxyAddress
        ? t('setup-proxy')
        : state.insufficientCollateralAllowance
        ? t('set-token-allowance', { token: state.vault.token })
        : state.insufficientDaiAllowance
        ? t('set-token-allowance', { token: 'DAI' })
        : state.originalEditingStage === 'otherActions' && state.otherAction === 'closeVault'
        ? t('close-vault')
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
    case 'borrowTransitionEditing':
      return t('multiply-to-borrow.button-start')
    case 'borrowTransitionWaitingForConfirmation':
      return t('multiply-to-borrow.button-confirm')
    case 'borrowTransitionInProgress':
      return t('multiply-to-borrow.button-progress')
    case 'borrowTransitionFailure':
      return t('multiply-to-borrow.button-failure')
    case 'borrowTransitionSuccess':
      return t('multiply-to-borrow.button-success')
    default:
      throw new UnreachableCaseError(state.stage)
  }
}

export function ManageMultiplyVaultButton(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    progress,
    stage,
    isLoadingStage,
    canProgress,
    canRegress,
    regress,
    vault: { token },
    // depositAmount,
    // generateAmount,
    // paybackAmount,
    // withdrawAmount,
    isCollateralAllowanceStage,
    isEditingStage,
    otherAction,
    toggle,
    setOtherAction,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  function handleRegress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    regress!()
  }

  function handleClose() {
    if (stage !== 'otherActions') {
      toggle!('otherActions')
    }

    setOtherAction!('closeVault')
  }

  const buttonText = manageMultiplyVaultButtonText(props)
  const secondaryButtonText = (() => {
    switch (stage) {
      case 'daiAllowanceFailure':
      case 'collateralAllowanceFailure':
        return t('edit-token-allowance', { token: isCollateralAllowanceStage ? token : 'DAI' })
      case 'borrowTransitionEditing':
      case 'borrowTransitionWaitingForConfirmation':
      case 'borrowTransitionFailure':
        return t('decide-later')
      default:
        return t('edit-vault-details')
    }
  })()

  function trackEvents() {
    // if (stage === 'daiEditing' && generateAmount && generateAmount.gt(0)) {
    //   trackingEvents.manageDaiGenerateConfirm()
    // }
    // if (stage === 'daiEditing' && paybackAmount && paybackAmount.gt(0)) {
    //   trackingEvents.manageDaiPaybackConfirm()
    // }
    // if (stage === 'collateralEditing' && depositAmount && depositAmount.gt(0)) {
    //   trackingEvents.manageCollateralDepositConfirm()
    // }
    // if (stage === 'collateralEditing' && withdrawAmount && withdrawAmount.gt(0)) {
    //   trackingEvents.manageCollateralWithdrawConfirm()
    // }
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
                color="neutral10"
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
              if (stage !== 'daiAllowanceFailure' && stage !== 'collateralAllowanceFailure') {
                trackingEvents.manageVaultConfirmVaultEdit()
              }

              handleRegress(e)
            }}
          >
            {secondaryButtonText}
          </Button>
        </>
      )}
      {isEditingStage &&
        (stage === 'adjustPosition' ||
          (stage === 'otherActions' && otherAction !== 'closeVault')) && (
          <>
            <Divider variant="styles.hrVaultFormBottom" />
            <Button onClick={handleClose} sx={{ cursor: 'pointer' }} variant="textualSmall">
              Close this vault
            </Button>
          </>
        )}
    </>
  )
}
