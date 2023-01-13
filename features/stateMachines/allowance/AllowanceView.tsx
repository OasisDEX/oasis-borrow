import { useActor } from '@xstate/react'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Grid, Text } from 'theme-ui'
import { ActorRefFrom, Sender, StateFrom } from 'xstate'

import { getToken } from '../../../blockchain/tokensMetadata'
import { Radio } from '../../../components/forms/Radio'
import { SidebarSection, SidebarSectionProps } from '../../../components/sidebar/SidebarSection'
import { TxStatusCardProgress, TxStatusCardSuccess } from '../../../components/vault/TxStatusCard'
import { BigNumberInput } from '../../../helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from '../../../helpers/formatters/format'
import { handleNumericInput } from '../../../helpers/input'
import {
  AllowanceStateMachine,
  AllowanceStateMachineEvent,
} from './state/createAllowanceStateMachine'

interface AllowanceViewProps {
  allowanceMachine: ActorRefFrom<AllowanceStateMachine>
  steps: [number, number]
}

interface AllowanceViewStateProps {
  state: StateFrom<AllowanceStateMachine>
  send: Sender<AllowanceStateMachineEvent>
  steps: [number, number]
}

function AllowanceInfoStateViewContent({
  state,
  send,
}: Pick<AllowanceViewStateProps, 'state' | 'send'>) {
  const { t } = useTranslation()
  const { token, minimumAmount, allowanceType, amount } = state.context

  const isUnlimited = allowanceType === 'unlimited'
  const isMinimum = allowanceType === 'minimum'
  const isCustom = allowanceType === 'custom'
  return (
    <Grid gap={3}>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {t('vault-form.subtext.commonAllowance', { token })}
      </Text>
      <Radio
        onChange={() => send({ type: 'SET_ALLOWANCE', allowanceType: 'unlimited' })}
        name="allowance-open-form"
        checked={isUnlimited}
      >
        <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
          {t('unlimited-allowance')}
        </Text>
      </Radio>

      <Radio
        onChange={() => send({ type: 'SET_ALLOWANCE', allowanceType: 'minimum' })}
        name="allowance-open-form"
        checked={isMinimum}
      >
        <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
          {t('token-depositing', { token, amount: formatCryptoBalance(minimumAmount!) })}
        </Text>
      </Radio>
      <Radio
        onChange={() => send({ type: 'SET_ALLOWANCE', allowanceType: 'custom' })}
        name="allowance-open-form"
        checked={isCustom}
      >
        <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center', my: 2 }}>
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
            {t('custom')}
          </Text>
          <BigNumberInput
            sx={{
              p: 1,
              borderRadius: 'small',
              borderColor: 'secondary100',
              width: '100px',
              fontSize: 1,
              px: 3,
              py: '12px',
            }}
            disabled={!isCustom}
            value={amount && isCustom ? formatAmount(amount, token) : undefined}
            mask={createNumberMask({
              allowDecimal: true,
              decimalLimit: getToken(token).digits,
              prefix: '',
            })}
            onChange={handleNumericInput((value) =>
              send({ type: 'SET_ALLOWANCE', amount: value, allowanceType: 'custom' }),
            )}
          />
          <Text sx={{ fontSize: 1 }}>{token}</Text>
        </Grid>
      </Radio>
    </Grid>
  )
}

function AllowanceInfoStateView({ state, send, steps }: AllowanceViewStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: <AllowanceInfoStateViewContent state={state} send={send} />,
    primaryButton: {
      steps: steps,
      isLoading: false,
      disabled: !state.can('NEXT_STEP'),
      label: t('approve-allowance'),
      action: () => send('NEXT_STEP'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}

function AllowanceInProgressStateViewContent({ state }: Pick<AllowanceViewStateProps, 'state'>) {
  const { t } = useTranslation()
  const [transactionState] = useActor(state.context.refTransactionMachine!)
  const { token } = state.context
  const { txHash, etherscanUrl } = transactionState.context
  return (
    <Grid gap={3}>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {t('vault-form.subtext.commonAllowance', { token })}
      </Text>
      <TxStatusCardProgress
        text={t('setting-allowance-for', { token })}
        txHash={txHash!}
        etherscan={etherscanUrl || ''}
      />
    </Grid>
  )
}

function AllowanceInProgressStateView({ state, steps }: AllowanceViewStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: <AllowanceInProgressStateViewContent state={state} />,
    primaryButton: {
      steps: steps,
      isLoading: true,
      disabled: true,
      label: t('approving-allowance'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}

function AllowanceSuccessStateView({ state, send, steps }: AllowanceViewStateProps) {
  const { t } = useTranslation()
  const [transactionState] = useActor(state.context.refTransactionMachine!)
  const { token } = state.context
  const { txHash, etherscanUrl } = transactionState.context

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: (
      <Grid gap={3}>
        <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
          {t('vault-form.subtext.commonAllowance', { token })}
        </Text>
        <TxStatusCardSuccess
          text={t('setting-allowance-for', { token })}
          txHash={txHash!}
          etherscan={etherscanUrl || ''}
        />
      </Grid>
    ),
    primaryButton: {
      steps: steps,
      isLoading: false,
      disabled: false,
      label: t('continue'),
      action: () => send('CONTINUE'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}

function AllowanceRetryStateView({ state, send }: AllowanceViewStateProps) {
  const { t } = useTranslation()
  const { token } = state.context

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: (
      <Grid gap={3}>
        <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
          {t('vault-form.subtext.commonAllowance', { token })}
        </Text>
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('retry-allowance-approval'),
      action: () => send('RETRY'),
    },
    textButton: {
      label: t('edit-token-allowance', { token }),
      action: () => send('BACK'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}

export function AllowanceView({ allowanceMachine, steps }: AllowanceViewProps) {
  const [state, send] = useActor(allowanceMachine)

  switch (true) {
    case state.matches('idle'):
      return <AllowanceInfoStateView state={state} send={send} steps={steps} />
    case state.matches('txFailure'):
      return <AllowanceRetryStateView state={state} send={send} steps={steps} />
    case state.matches('txInProgress'):
      return <AllowanceInProgressStateView state={state} send={send} steps={steps} />
    case state.matches('txSuccess'):
      return <AllowanceSuccessStateView state={state} send={send} steps={steps} />
    default:
      return <></>
  }
}
