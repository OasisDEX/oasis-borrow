import { trackingEvents } from 'analytics/analytics'
import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault'
import { useObservable } from 'helpers/observableHook'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Divider, Flex, Spinner, Text } from 'theme-ui'

function multiplyVaultPrimaryButtonText({
  stage,
  id,
  token,
  proxyAddress,
  insufficientAllowance,
  inputAmountsEmpty,
  customAllowanceAmountEmpty,
}: OpenMultiplyVaultButtonProps) {
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

    case 'txFailure':
      return t('retry')
    case 'txInProgress':
      return t('creating-vault')
    case 'txSuccess':
      return t('go-to-vault', { id })
    case 'txWaitingForApproval':
    case 'txWaitingForConfirmation':
      return t('create-vault')
    default:
      throw new UnreachableCaseError(stage)
  }
}

export interface OpenMultiplyVaultButtonProps {
  stage: OpenMultiplyVaultStage
  progress?: () => void
  regress?: () => void
  canRegress: boolean
  id?: BigNumber
  canProgress: boolean
  isLoadingStage: boolean
  token: string
  depositAmount?: BigNumber
  proxyAddress?: string
  insufficientAllowance: boolean
  inputAmountsEmpty: boolean
  customAllowanceAmountEmpty: boolean
}

export function OpenMultiplyVaultButton(props: OpenMultiplyVaultButtonProps) {
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)
  const { t } = useTranslation()
  const { replace } = useRedirect()
  const {
    stage,
    progress,
    regress,
    canRegress,
    id,
    canProgress,
    isLoadingStage,
    token,
    depositAmount,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (stage === 'txSuccess') {
      replace(`/${id}`)

      return
    }
    progress!()
  }

  function handleRegress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    regress!()
  }

  const primaryButtonText = multiplyVaultPrimaryButtonText(props)
  const secondaryButtonText =
    stage === 'allowanceFailure' ? t('edit-token-allowance', { token }) : t('edit-vault-details')

  const firstCDP = accountData?.numberOfVaults ? accountData.numberOfVaults === 0 : undefined
  let trackingEvent: () => void | null

  if (primaryButtonText === t('setup-proxy'))
    trackingEvent = () =>
      trackingEvents.createVaultSetupProxy(firstCDP, depositAmount?.toString() || '0', '0')
  if (primaryButtonText === t('confirm'))
    trackingEvent = () => trackingEvents.createVaultConfirm(firstCDP)
  if (primaryButtonText === t('create-proxy-btn'))
    trackingEvent = () => trackingEvents.createProxy(firstCDP)
  if (stage === 'editing' && primaryButtonText === t('set-token-allowance', { token })) {
    trackingEvent = () => trackingEvents.setTokenAllowance(firstCDP)
  }
  if (
    (stage === 'allowanceWaitingForConfirmation' &&
      primaryButtonText === t('set-token-allowance', { token })) ||
    primaryButtonText === t('retry-allowance-approval')
  ) {
    trackingEvent = () => trackingEvents.approveAllowance(firstCDP)
  }

  if (stage === 'txInProgress') {
    return null
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
                color="neutral10"
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
                trackingEvents.confirmVaultEdit(firstCDP)
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
