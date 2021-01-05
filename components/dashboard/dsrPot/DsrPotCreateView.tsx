// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getToken } from 'components/blockchain/config'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { InputWithMax } from 'helpers/input'
import { AppSpinner } from 'helpers/loadingIndicator/LoadingIndicator'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'i18n'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { DsrCreationState, ManualChange } from './dsrPotCreate'

interface PotCreateWrapperProps extends WithChildren {
  title: string
  step: number
  steps: number
}

interface AlertInProgressProps {
  proxyConfirmations?: number
  safeConfirmations?: number
}

const stylesCircle = {
  width: '29px',
  height: '29px',
  border: 'light',
  borderColor: 'primary',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  mr: 3,
  fontSize: 2,
  fontWeight: 'bold',
}

function AlertCompleted() {
  const { t } = useTranslation('common')

  return (
    <Alert
      variant="success"
      sx={{
        justifyContent: ['flex-start', 'flex-start'],
        display: 'inline-flex',
        width: 'auto',
      }}
    >
      <Icon name="checkmark" size={17} sx={{ mr: 2 }} />
      {t('completed')}
    </Alert>
  )
}

function AlertFailed({ tryAgain, txError }: { tryAgain?: () => void; txError: any }) {
  const { t } = useTranslation('common')
  const { tooltipOpen, setTooltipOpen } = useTooltip()

  return (
    <Flex>
      <Alert
        variant="error"
        sx={{
          justifyContent: ['space-between', 'space-between'],
          mr: 2,
          flex: 1,
          position: 'relative',
        }}
      >
        <Flex sx={{ alignItems: 'center ' }}>
          <Icon name="close" size={17} sx={{ mr: 2 }} />
          {t('failed')}
        </Flex>
        {txError && (
          <Flex
            sx={{
              ...stylesCircle,
              width: '27px',
              height: '27px',
              borderColor: 'onError',
              mr: 0,
              borderWidth: '2px',
              cursor: 'pointer',
            }}
            onClick={() => setTooltipOpen(true)}
          >
            <Icon name="question_mark" size={17} />
          </Flex>
        )}
        {txError && tooltipOpen && (
          <Tooltip sx={{ left: 0, right: 'auto' }}>
            <Text sx={{ fontWeight: 'normal' }}>{txError.message}</Text>
          </Tooltip>
        )}
      </Alert>
      <Button variant="small" sx={{ ml: 1 }} onClick={tryAgain}>
        {t('try-again')}
      </Button>
    </Flex>
  )
}

function AlertWaitingApproval() {
  const { t } = useTranslation('common')

  return (
    <Alert variant="warning" sx={{ justifyContent: ['flex-start', 'flex-start'] }}>
      <AppSpinner
        variant="styles.spinner.large"
        sx={{
          color: 'spinnerWarning',
          mr: 2,
        }}
      />
      {t('waiting-approval')}
    </Alert>
  )
}

function AlertInProgress({ proxyConfirmations, safeConfirmations }: AlertInProgressProps) {
  const { t } = useTranslation('common')

  return (
    <Alert variant="warning" sx={{ justifyContent: ['flex-start', 'flex-start'] }}>
      <AppSpinner
        variant="styles.spinner.large"
        sx={{
          color: 'spinnerWarning',
          mr: 2,
        }}
      />
      {proxyConfirmations !== undefined && (
        <Text>
          {proxyConfirmations} {t('of')} {safeConfirmations}
        </Text>
      )}
      {proxyConfirmations !== undefined
        ? `: ${t('waiting-proxy-deployment')}`
        : t('waiting-confirmation')}
    </Alert>
  )
}

function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    change({
      kind: 'amount',
      amount: value === '' ? undefined : new BigNumber(value),
    })
  }
}

function PotCreateWrapper({ children, title, step, steps }: PotCreateWrapperProps) {
  return (
    <Box sx={{ mt: 4, mx: 'auto', width: '100%' }}>
      <Grid gap={4}>
        <Grid columns={steps} sx={{ width: `calc(${steps} * 80px)`, mx: 'auto' }}>
          {[...Array(steps).keys()].map((i) => (
            <Box
              key={i}
              sx={{
                bg: (steps === 3 ? step === i : step - 1 === i) ? 'primary' : 'muted',
                height: 1,
                borderRadius: 'small',
              }}
            />
          ))}
        </Grid>
        <Heading variant="mediumHeading" as="h2" sx={{ textAlign: 'center' }}>
          {title}
        </Heading>
        {children}
      </Grid>
    </Box>
  )
}

function SetupWallet(props: DsrCreationState & { steps: number }) {
  const { t } = useTranslation('common')
  const {
    stage,
    createProxy,
    setAllowance,
    proxyAddress,
    proxyConfirmations,
    continue2Editing,
    tryAgain,
    safeConfirmations,
    steps,
    txError,
  } = props

  return (
    <PotCreateWrapper title={t('setup-wallet')} step={0} steps={steps}>
      <Card px={4}>
        <Grid gap={4} my={2}>
          <Grid>
            <Flex sx={{ alignItems: 'center' }}>
              <Flex sx={stylesCircle}>1</Flex>
              <Heading variant="smallHeading">{t('create-proxy')}</Heading>
            </Flex>
            <Text sx={{ mb: 2 }}>{t('create-proxy-desc')}</Text>
            <Box>
              {createProxy && <Button onClick={createProxy}>{t('create-proxy')}</Button>}
              {stage === 'proxyWaiting4Approval' && <AlertWaitingApproval />}
              {stage === 'proxyInProgress' && (
                <AlertInProgress {...{ proxyConfirmations, safeConfirmations }} />
              )}
              {stage === 'proxyFiasco' && <AlertFailed {...{ tryAgain, txError }} />}
              {proxyAddress && <AlertCompleted />}
            </Box>
          </Grid>
          <Grid>
            <Flex sx={{ alignItems: 'center' }}>
              <Flex sx={stylesCircle}>2</Flex>
              <Heading variant="smallHeading">{t('permissions')}</Heading>
            </Flex>
            <Text sx={{ mb: 2 }}>{t('permissions-desc')}</Text>
            <Box>
              {(!proxyAddress || setAllowance) && (
                <Button disabled={!setAllowance} onClick={setAllowance}>
                  {t('permissions-btn')}
                </Button>
              )}
              {stage === 'allowanceWaiting4Approval' && <AlertWaitingApproval />}
              {stage === 'allowanceInProgress' && <AlertInProgress />}
              {stage === 'allowanceFiasco' && <AlertFailed {...{ tryAgain, txError }} />}
              {stage === 'editingWaiting4Continue' && <AlertCompleted />}
            </Box>
          </Grid>
        </Grid>
      </Card>
      {continue2Editing && (
        <Button variant="primarySquare" onClick={continue2Editing}>
          {t('continue')}
        </Button>
      )}
    </PotCreateWrapper>
  )
}

function DepositDai(props: DsrCreationState & { steps: number }) {
  const { t } = useTranslation('common')
  const { continue2ConfirmDeposit, change, amount, daiBalance, messages, steps } = props
  const balanceInsufficient = messages.some((message) => message.kind === 'amountBiggerThanBalance')

  function handleSetMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'amount', amount: daiBalance })
    }
  }

  return (
    <PotCreateWrapper title={`${t('deposit')} Dai`} step={1} steps={steps}>
      <Card px={4}>
        <Grid gap={4} my={2}>
          <Box>
            <InputWithMax
              {...{
                amount,
                token: getToken('DAI'),
                hasError: balanceInsufficient,
                onChange: handleAmountChange(change!),
                onSetMax: handleSetMax(change!),
              }}
            />
            {balanceInsufficient && (
              <Text variant="error" sx={{ mt: 3 }}>
                {t('balance-insufficient')}
              </Text>
            )}
          </Box>
          <Box>
            <Card variant="secondary" sx={{ bg: 'background' }}>
              <Heading variant="smallHeading">DAI {t('balance')}</Heading>
              <Text variant="surfaceText" sx={{ fontSize: 5, mt: 2 }}>
                {formatCryptoBalance(daiBalance)}
              </Text>
            </Card>
          </Box>
        </Grid>
      </Card>
      <Button
        variant="primarySquare"
        disabled={!continue2ConfirmDeposit}
        onClick={continue2ConfirmDeposit}
      >
        {t('continue')}
      </Button>
    </PotCreateWrapper>
  )
}

export function ConfirmDeposit(props: DsrCreationState & { steps: number }) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const {
    query: { address, network },
  } = router
  const { deposit, stage, amount, tryAgain, close, steps, txError } = props

  function closeCreation() {
    const networkQueryParam = network ? `?network=${network}` : ''
    /* eslint-disable-next-line */
    router
      .push(`/[address]/pots/[pot]${networkQueryParam}`, `/${address}/pots/dsr${networkQueryParam}`)
      .then(() => {
        close!()
      })
  }

  return (
    <PotCreateWrapper title={t('confirm')} step={2} steps={steps}>
      <Grid gap={4} my={2}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', my: -2 }}>
          <Icon name="dai" size={55} />
          {amount && <Text sx={{ fontSize: 8, ml: 2 }}>{formatCryptoBalance(amount)}</Text>}
        </Flex>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="dai_circle_color" size={33} sx={{ mr: 1 }} />
          <Text variant="surfaceText" sx={{ fontSize: 5, textAlign: 'center', ml: 2 }}>
            {t('dai-savings-rate')}
          </Text>
        </Flex>
      </Grid>
      <Box>
        {stage === 'depositWaiting4Approval' && <AlertWaitingApproval />}
        {stage === 'depositInProgress' && <AlertInProgress />}
        {stage === 'depositFiasco' && <AlertFailed {...{ tryAgain, txError }} />}
        {stage === 'depositSuccess' && <AlertCompleted />}
      </Box>
      {stage === 'depositWaiting4Confirmation' && (
        <Button variant="primarySquare" disabled={!deposit} onClick={deposit}>
          {t('create-dai-savings')}
        </Button>
      )}
      {stage === 'depositSuccess' && (
        <Button variant="primarySquare" sx={{ width: '100%' }} onClick={closeCreation}>
          {t('close')}
        </Button>
      )}
    </PotCreateWrapper>
  )
}

export function DsrPotCreateView() {
  const { dsrCreation$ } = useAppContext()
  const dsrCreation = useObservable(dsrCreation$)
  const [steps, setSteps] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (dsrCreation && !steps) {
      const flowSteps = dsrCreation.stage === 'editing' ? 2 : 3
      setSteps(flowSteps)
    }
  }, [dsrCreation])

  if (!dsrCreation || !steps) {
    return null
  }

  switch (dsrCreation.stage) {
    case 'proxyWaiting4Confirmation':
    case 'proxyWaiting4Approval':
    case 'proxyInProgress':
    case 'proxyFiasco':
    case 'allowanceWaiting4Confirmation':
    case 'allowanceWaiting4Approval':
    case 'allowanceInProgress':
    case 'allowanceFiasco':
    case 'editingWaiting4Continue':
      return <SetupWallet {...{ ...dsrCreation, steps }} />
    case 'editing':
      return <DepositDai {...{ ...dsrCreation, steps }} />
    case 'depositWaiting4Confirmation':
    case 'depositWaiting4Approval':
    case 'depositInProgress':
    case 'depositFiasco':
    case 'depositSuccess':
      return <ConfirmDeposit {...{ ...dsrCreation, steps }} />
    default:
      return <Text>{dsrCreation.stage}</Text>
  }
}
