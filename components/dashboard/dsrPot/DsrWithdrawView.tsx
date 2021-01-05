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
import { ModalProps } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { roundHalfUp } from 'helpers/rounding'
import { useTranslation } from 'i18n'
import React, { useEffect } from 'react'
import { Box, Grid, Heading, Text } from 'theme-ui'

import { trackingEvents } from '../../analytics/analytics'
import { DsrWithdrawStage, ManualChange } from './dsrWithdraw'

function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    change({
      kind: 'amount',
      amount: value === '' ? undefined : new BigNumber(value),
    })
  }
}

export function DsrWithdrawView(modal: ModalProps) {
  const { t } = useTranslation('common')
  const { dsrWithdraw$ } = useAppContext()
  const dsrWithdraw = useObservable(dsrWithdraw$)

  useEffect(() => {
    if (dsrWithdraw?.stage === 'withdrawSuccess') {
      close()
    }
  }, [dsrWithdraw])

  if (!dsrWithdraw) {
    return null
  }

  const {
    stage,
    messages,
    withdraw,
    proceed,
    daiDeposit,
    amount,
    change,
    back,
    gasEstimationStatus,
    gasEstimationDai,
    gasEstimationEth,
  } = dsrWithdraw

  function close() {
    if (dsrWithdraw?.reset) {
      dsrWithdraw.reset()
    }
    modal.close()
  }

  function handleSetMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'amount', amount: roundHalfUp(daiDeposit, 'DAI') })
    }
  }

  function getModalTitle(stage: DsrWithdrawStage) {
    switch (stage) {
      case 'editing':
        return t('withdraw')
      case 'withdrawWaiting4Confirmation':
      case 'withdrawWaiting4Approval':
      case 'withdrawInProgress':
      case 'withdrawSuccess':
        return t('confirm')
      case 'withdrawFiasco':
        return t('transaction-failed')
      default:
        return t('withdraw')
    }
  }

  const errorString = messages
    .map((message) => {
      switch (message.kind) {
        case 'amountBiggerThanDeposit':
          return t('dsr-withdraw-error-greater-than-deposit')
        default:
          return null
      }
    })
    .filter((x) => x)
    .join(',')

  const hasError = !!errorString

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
            <CardBalance
              customText={t('dsr-available-withdraw')}
              icon="dai"
              balance={roundHalfUp(daiDeposit, 'DAI')}
            />
          </>
        )}
        {(stage === 'withdrawWaiting4Confirmation' ||
          stage === 'withdrawWaiting4Approval' ||
          stage === 'withdrawInProgress') && (
          <Box>
            <Heading
              variant="smallHeading"
              sx={{ fontWeight: 'normal', textAlign: 'center', mt: 5, mb: 3 }}
            >
              You are withdrawing
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
              from Dai Savings Rate
            </Heading>
          </Box>
        )}
        {stage === 'withdrawFiasco' && (
          <ModalErrorMessage message={'dsr-withdraw-error-withdrawal'} />
        )}
        {(stage === 'withdrawWaiting4Confirmation' || stage === 'withdrawWaiting4Approval') && (
          <Box sx={{ mb: 3 }}>
            <GasCost {...{ gasEstimationStatus, gasEstimationDai, gasEstimationEth }} />
          </Box>
        )}
      </Grid>
      {stage === 'withdrawWaiting4Confirmation' ? (
        <ModalButton onClick={withdraw} disabled={!withdraw}>
          {t('withdraw')}
        </ModalButton>
      ) : (
        <ModalButton
          onClick={() => {
            proceed && proceed()
            trackingEvents.dsrWithdrawProceed()
          }}
          disabled={!proceed}
        >
          {t('proceed')}
        </ModalButton>
      )}
    </ModalBottom>
  )
}
