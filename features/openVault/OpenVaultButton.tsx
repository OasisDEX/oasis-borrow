import BigNumber from 'bignumber.js'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'

import { OpenVaultStage, OpenVaultState } from './openVault'

function openVaultButtonText({ stage, id }: OpenVaultState) {
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

export function OpenVaultButton(props: OpenVaultState) {
  const { replace } = useRedirect()
  const { stage, progress, id, flowProgressionDisabled, isLoadingStage } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (stage === 'openSuccess') {
      replace(`/${id}`)
    }
    progress!()
  }

  const buttonText = openVaultButtonText(props)

  return (
    <Button disabled={flowProgressionDisabled} onClick={handleProgress}>
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
