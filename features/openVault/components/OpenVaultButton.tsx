import { trackingEvents } from 'analytics/analytics'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Divider, Flex, Spinner, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'

function openVaultPrimaryButtonText({
  stage,
  id,
  token,
  proxyAddress,
  insufficientAllowance,
  inputAmountsEmpty,
  customAllowanceAmountEmpty,
}: OpenVaultState) {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      return inputAmountsEmpty
        ? t('enter-an-amount')
        : !proxyAddress
        ? t('setup-proxy')
        : insufficientAllowance
        ? t('set-token-allowance', { token })
        : t('confirm')

    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxySuccess':
      return insufficientAllowance ? t('set-token-allowance', { token }) : t('continue')

    case 'allowanceWaitingForConfirmation':
      return customAllowanceAmountEmpty
        ? t('enter-allowance-amount')
        : t('set-token-allowance', { token: token })

    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
      return t('approving-allowance')
    case 'allowanceFailure':
      return t('retry-allowance-approval')
    case 'allowanceSuccess':
      return t('continue')

    case 'openFailure':
      return t('retry')
    case 'openInProgress':
      return t('creating-vault')
    case 'openSuccess':
      return t('go-to-vault', { id })
    case 'openWaitingForApproval':
    case 'openWaitingForConfirmation':
      return t('create-vault')
    default:
      throw new UnreachableCaseError(stage)
  }
}

export function OpenVaultButton(props: OpenVaultState) {
  const { t } = useTranslation()
  const { replace } = useRedirect()
  const { stage, progress, regress, canRegress, id, canProgress, isLoadingStage, token } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (stage === 'openSuccess') {
      replace(`/${id}`)

      return
    }
    progress!()
  }

  function handleRegress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    regress!()
  }

  const primaryButtonText = openVaultPrimaryButtonText(props)
  const secondaryButtonText =
    stage === 'allowanceFailure' ? t('edit-token-allowance', { token }) : t('edit-vault-details')

  let trackingEvent: () => void | null

  if (primaryButtonText === t('setup-proxy')) trackingEvent = trackingEvents.createVaultSetupProxy
  if (primaryButtonText === t('confirm')) trackingEvent = trackingEvents.createVaultConfirm
  if (primaryButtonText === t('create-vault')) trackingEvent = trackingEvents.confirmVaultConfirm
  if (primaryButtonText === t('create-proxy-btn')) trackingEvent = trackingEvents.createProxy
  if (stage === 'editing' && primaryButtonText === t('set-token-allowance', { token })) {
    trackingEvent = trackingEvents.setTokenAllowance
  }
  if (
    (stage === 'allowanceWaitingForConfirmation' &&
      primaryButtonText === t('set-token-allowance', { token })) ||
    primaryButtonText === t('retry-allowance-approval')
  ) {
    trackingEvent = trackingEvents.approveAllowance
  }

  return (
    <>
      <Button
        disabled={!canProgress}
        onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
          trackingEvent && trackingEvent()
          handleProgress(e)
        }}
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
              {primaryButtonText}
            </Text>
          </Flex>
        ) : (
          <Text>{primaryButtonText}</Text>
        )}
      </Button>
      {canRegress && (
        <>
          <Divider variant="styles.hrVaultFormBottom" />
          <Button
            variant="textualSmall"
            onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
              if (stage !== 'allowanceFailure') {
                trackingEvents.confirmVaultEdit()
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
