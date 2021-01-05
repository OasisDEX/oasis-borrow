// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getToken } from 'components/blockchain/config'
import { CardBalance } from 'components/Cards'
import { GasCost } from 'components/GasCost'
import { ModalBackIcon, ModalBottom, ModalButton, ModalErrorMessage } from 'components/Modal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { InputWithMax } from 'helpers/input'
import { AppSpinner } from 'helpers/loadingIndicator/LoadingIndicator'
import { ModalProps } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'i18n'
import React, { useEffect } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { trackingEvents } from '../../analytics/analytics'
import { DsrDepositStage, ManualChange } from './dsrDeposit'

function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')

    change({
      kind: 'amount',
      amount: value === '' ? undefined : new BigNumber(value),
    })
  }
}

export function DsrDepositView(modal: ModalProps) {
  const { t } = useTranslation('common')
  const { dsrDeposit$ } = useAppContext()
  const dsrDeposit = useObservable(dsrDeposit$)

  useEffect(() => {
    if (dsrDeposit?.stage === 'depositSuccess') {
      close()
    }
  }, [dsrDeposit])

  if (!dsrDeposit) {
    return null
  }

  const {
    stage,
    messages,
    amount,
    daiBalance,
    change,
    setAllowance,
    proceed,
    deposit,
    back,
    gasEstimationStatus,
    gasEstimationDai,
    gasEstimationEth,
  } = dsrDeposit

  function close() {
    if (dsrDeposit?.reset) {
      dsrDeposit.reset()
    }
    modal.close()
  }

  function handleSetMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'amount', amount: daiBalance })
    }
  }

  function getModalTitle(stage: DsrDepositStage) {
    switch (stage) {
      case 'allowanceWaiting4Confirmation':
      case 'allowanceWaiting4Approval':
      case 'allowanceInProgress':
        return t('permissions')
      case 'editing':
        return t('deposit')
      case 'depositWaiting4Confirmation':
      case 'depositWaiting4Approval':
      case 'depositInProgress':
      case 'depositSuccess':
        return t('confirm')
      case 'allowanceFiasco':
      case 'depositFiasco':
        return t('transaction-failed')
      default:
        return t('deposit')
    }
  }

  const errorString = messages
    .map((message) => {
      switch (message.kind) {
        case 'amountBiggerThanBalance':
          return t('dsr-withdraw-error-greater-than-deposit')
        default:
          return null
      }
    })
    .filter((x) => x)
    .join(',')

  const hasError = !!errorString
  const isAllowanceStage =
    stage === 'allowanceWaiting4Confirmation' ||
    stage === 'allowanceWaiting4Approval' ||
    stage === 'allowanceInProgress'

  return (
    <ModalBottom {...{ close }}>
      {back && <ModalBackIcon {...{ back }} />}
      <Grid gap={4}>
        <Heading sx={{ textAlign: 'center' }}>{getModalTitle(stage)}</Heading>
        {stage === 'editing' && (
          <>
            <Box>
              <InputWithMax
                {...{
                  amount,
                  token: getToken('DAI'),
                  disabled: stage !== 'editing',
                  hasError,
                  onChange: handleAmountChange(change!),
                  onSetMax: handleSetMax(change!),
                }}
              />
              {hasError ? (
                <Text variant="error" my={3}>
                  {errorString}
                </Text>
              ) : null}
            </Box>
            <CardBalance token="DAI" icon="dai" balance={daiBalance} />
          </>
        )}
        {(stage === 'depositWaiting4Confirmation' ||
          stage === 'depositWaiting4Approval' ||
          stage === 'depositInProgress') && (
          <Box>
            <Heading
              variant="smallHeading"
              sx={{ fontWeight: 'normal', textAlign: 'center', mt: 5, mb: 3 }}
            >
              {t('dsr-deposit-depositing')}
            </Heading>
            <Heading
              variant="largeHeading"
              sx={{ fontWeight: 'normal', fontSize: 8, textAlign: 'center', mt: 3, mb: 3 }}
            >
              <Icon name="dai" size={48} sx={{ position: 'relative', top: 2 }} />
              {formatCryptoBalance(amount!)}
            </Heading>
            <Heading
              variant="smallHeading"
              sx={{ fontWeight: 'normal', textAlign: 'center', my: 3 }}
            >
              {t('dsr-deposit-depositing-to')}
            </Heading>
          </Box>
        )}
        {isAllowanceStage && (
          <Flex
            sx={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Heading
                variant="smallHeading"
                sx={{
                  fontWeight: 'normal',
                  textAlign: 'center',
                  my: 5,
                  mx: 'auto',
                  maxWidth: '17em',
                }}
              >
                {t('dsr-deposit-permissions')}
              </Heading>
            </Box>
          </Flex>
        )}
        {(stage === 'depositFiasco' || stage === 'allowanceFiasco') && (
          <ModalErrorMessage
            message={
              stage === 'depositFiasco'
                ? 'dsr-deposit-error-deposit'
                : 'dsr-deposit-error-allowance'
            }
          />
        )}
        {(stage === 'depositWaiting4Confirmation' || stage === 'depositWaiting4Approval') && (
          <Box sx={{ mb: 3 }}>
            <GasCost {...{ gasEstimationStatus, gasEstimationDai, gasEstimationEth }} />
          </Box>
        )}
      </Grid>
      {stage === 'depositWaiting4Confirmation' ? (
        <ModalButton onClick={deposit} disabled={!deposit}>
          {t('deposit')}
        </ModalButton>
      ) : stage === 'depositFiasco' ? (
        <ModalButton onClick={close}>{t('close')}</ModalButton>
      ) : isAllowanceStage ? (
        <ModalButton onClick={setAllowance} disabled={!setAllowance}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {t('permissions')}
            {(stage === 'allowanceWaiting4Approval' || stage === 'allowanceInProgress') && (
              <AppSpinner size={22} sx={{ ml: 2 }} />
            )}
          </Flex>
        </ModalButton>
      ) : (
        <ModalButton
          onClick={() => {
            proceed && proceed()
            trackingEvents.dsrDepositProceed()
          }}
          disabled={!proceed}
        >
          {t('proceed')}
        </ModalButton>
      )}
    </ModalBottom>
  )
}
