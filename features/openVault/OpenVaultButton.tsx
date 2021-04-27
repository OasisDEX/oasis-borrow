import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'

function openVaultButtonText({
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
