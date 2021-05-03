import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'

import { OpenVaultStage, OpenVaultState } from './openVault'

function openVaultButtonText(stage: OpenVaultStage, id?: BigNumber) {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      return t('confirm')
    case 'allowanceSuccess':
    case 'proxySuccess':
      return t('continue')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'allowanceWaitingForConfirmation':
      return t('approve-allowance')
    case 'allowanceFailure':
      return t('retry-allowance-approval')
    case 'allowanceInProgress':
    case 'allowanceWaitingForApproval':
      return t('approving-allowance')
    case 'openFailure':
      return t('retry')
    case 'openSuccess':
      return t('go-to-vault', { id })
    case 'openWaitingForApproval':
    case 'openInProgress':
      return t('creating-vault')
    case 'openWaitingForConfirmation':
      return t('create-vault')
    default:
      throw new UnreachableCaseError(stage)
  }
}

export function OpenVaultButton({ stage, errorMessages, progress, id }: OpenVaultState) {
  const { t } = useTranslation()
  const { replace } = useRedirect()
  const isLoading = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'allowanceInProgress',
    'allowanceWaitingForApproval',
    'openInProgress',
    'openWaitingForApproval',
  ] as OpenVaultStage[]).some((s) => s === stage)

  const hasError = !!errorMessages.length
  const isDisabled = hasError || isLoading

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (!isDisabled) {
      if (stage === 'openSuccess') {
        replace(`/${id}`)
      }
      progress && progress!()
    }
  }

  const buttonText = openVaultButtonText(stage, id)

  let trackingEvent: () => void | null
  if (buttonText === t('confirm')) trackingEvent = trackingEvents.createVaultConfirm
  if (buttonText === t('create-vault')) trackingEvent = trackingEvents.confirmVaultConfirm
  if (buttonText === t('create-proxy-btn')) trackingEvent = trackingEvents.createProxy
  if (buttonText === t('approve-allowance')) trackingEvent = trackingEvents.approveAllowance

  return (
    <Button
      disabled={isDisabled}
      onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
        trackingEvent && trackingEvent()
        handleProgress(e)
      }}
    >
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
