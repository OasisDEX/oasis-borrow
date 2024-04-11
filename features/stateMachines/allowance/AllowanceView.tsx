import { useActor } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { Radio } from 'components/Radio'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Grid, Text } from 'theme-ui'
import type { ActorRefFrom, Sender, StateFrom } from 'xstate'

import type {
  AllowanceStateMachine,
  AllowanceStateMachineEvent,
} from './state/createAllowanceStateMachine'

interface AllowanceViewProps {
  allowanceMachine: ActorRefFrom<AllowanceStateMachine>
  steps?: [number, number]
  isLoading?: boolean
  backButtonOnFirstStep?: boolean | string
}

interface AllowanceViewStateProps {
  state: StateFrom<AllowanceStateMachine>
  send: Sender<AllowanceStateMachineEvent>
  steps?: [number, number]
  isLoading?: boolean
  backButtonOnFirstStep?: boolean | string
}

function AllowanceInfoStateViewContent({
  state,
  send,
}: Pick<AllowanceViewStateProps, 'state' | 'send'>) {
  const { t } = useTranslation()
  const { token, minimumAmount, allowanceType, amount, customDecimals } = state.context

  const isUnlimited = allowanceType === 'unlimited'
  const isMinimum = allowanceType === 'minimum'
  const isCustom = allowanceType === 'custom'

  const humanReadableMinimumAmount = customDecimals
    ? minimumAmount.div(new BigNumber(10).pow(customDecimals))
    : minimumAmount

  const allowanceAmountInfo = isUnlimited
    ? t('unlimited-allowance')
    : `${formatCryptoBalance(isMinimum ? humanReadableMinimumAmount : amount || zero)} ${token}`

  return (
    <Grid gap={3}>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {t('vault-form.subtext.commonAllowance', { allowanceAmountInfo })}
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
          {t('token-depositing', {
            token,
            amount: formatCryptoBalance(humanReadableMinimumAmount),
          })}
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
              decimalLimit: getTokenGuarded(token)?.digits || DEFAULT_TOKEN_DIGITS,
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

function AllowanceInfoStateView({
  state,
  send,
  steps,
  isLoading,
  backButtonOnFirstStep,
}: AllowanceViewStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: <AllowanceInfoStateViewContent state={state} send={send} />,
    primaryButton: {
      steps: steps,
      isLoading,
      disabled: isLoading || !state.can('NEXT_STEP'),
      label: t('approve-allowance'),
      action: () => send('NEXT_STEP'),
    },
    textButton: backButtonOnFirstStep
      ? {
          action: () => {
            send('BACK')
          },
          label: t(typeof backButtonOnFirstStep === 'string' ? backButtonOnFirstStep : 'go-back'),
        }
      : undefined,
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function AllowanceInProgressStateViewContent({ state }: Pick<AllowanceViewStateProps, 'state'>) {
  const { t } = useTranslation()
  const { token, minimumAmount, allowanceType, amount, customDecimals } = state.context

  const isUnlimited = allowanceType === 'unlimited'
  const isMinimum = allowanceType === 'minimum'

  const humanReadableMinimumAmount = customDecimals
    ? minimumAmount.div(new BigNumber(10).pow(customDecimals))
    : minimumAmount

  const allowanceAmountInfo = isUnlimited
    ? t('unlimited-allowance')
    : `${formatCryptoBalance(isMinimum ? humanReadableMinimumAmount : amount || zero)} ${token}`

  return (
    <Grid gap={3}>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {t('vault-form.subtext.commonAllowance', { allowanceAmountInfo })}
      </Text>
    </Grid>
  )
}

function AllowanceInProgressStateView({ state, steps }: AllowanceViewStateProps) {
  const { t } = useTranslation()
  const { token } = state.context
  const [transactionState] = useActor(state.context.refTransactionMachine!)
  const { txHash, etherscanUrl } = transactionState.context

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: <AllowanceInProgressStateViewContent state={state} />,
    primaryButton: {
      steps: steps,
      isLoading: true,
      disabled: true,
      label: t('approving-allowance'),
    },
    status: [
      {
        type: 'progress',
        text: t('setting-allowance-for', { token }),
        etherscan: etherscanUrl || '',
        txHash: txHash!,
      },
    ],
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function AllowanceSuccessStateView({ state, send, steps }: AllowanceViewStateProps) {
  const { t } = useTranslation()
  const [transactionState] = useActor(state.context.refTransactionMachine!)
  const { token, minimumAmount, allowanceType, amount, customDecimals } = state.context
  const { txHash, etherscanUrl } = transactionState.context

  const humanReadableMinimumAmount = customDecimals
    ? minimumAmount.div(new BigNumber(10).pow(customDecimals))
    : minimumAmount

  const isUnlimited = allowanceType === 'unlimited'
  const isMinimum = allowanceType === 'minimum'

  const allowanceAmountInfo = isUnlimited
    ? t('unlimited-allowance')
    : `${formatCryptoBalance(isMinimum ? humanReadableMinimumAmount : amount || zero)} ${token}`

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: (
      <Grid gap={3}>
        <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
          {t('vault-form.subtext.commonAllowance', { allowanceAmountInfo })}
        </Text>
      </Grid>
    ),
    primaryButton: {
      steps: steps,
      isLoading: false,
      disabled: false,
      label: t('continue'),
      action: () => send('CONTINUE'),
    },
    status: [
      {
        type: 'success',
        text: t('setting-allowance-for', { token }),
        etherscan: etherscanUrl || '',
        txHash: txHash!,
      },
    ],
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function AllowanceRetryStateView({ state, send, backButtonOnFirstStep }: AllowanceViewStateProps) {
  const { t } = useTranslation()
  const { token, minimumAmount, allowanceType, amount, customDecimals } = state.context

  const isUnlimited = allowanceType === 'unlimited'
  const isMinimum = allowanceType === 'minimum'

  const humanReadableMinimumAmount = customDecimals
    ? minimumAmount.div(new BigNumber(10).pow(customDecimals))
    : minimumAmount

  const allowanceAmountInfo = isUnlimited
    ? t('unlimited-allowance')
    : `${formatCryptoBalance(isMinimum ? humanReadableMinimumAmount : amount || zero)} ${token}`

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.allowance', { token: state.context.token }),
    content: (
      <Grid gap={3}>
        <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
          {t('vault-form.subtext.commonAllowance', { allowanceAmountInfo })}
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
      label: t(typeof backButtonOnFirstStep === 'string' ? backButtonOnFirstStep : 'go-back'),
      action: () => send('BACK'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function AllowanceView({
  allowanceMachine,
  steps,
  isLoading,
  backButtonOnFirstStep,
}: AllowanceViewProps) {
  const [state, send] = useActor(allowanceMachine)

  switch (true) {
    case state.matches('idle'):
      return (
        <AllowanceInfoStateView
          state={state}
          send={send}
          steps={steps}
          isLoading={isLoading}
          backButtonOnFirstStep={backButtonOnFirstStep}
        />
      )
    case state.matches('txFailure'):
      return (
        <AllowanceRetryStateView
          state={state}
          send={send}
          steps={steps}
          backButtonOnFirstStep={backButtonOnFirstStep}
        />
      )
    case state.matches('txInProgress'):
    case state.matches('txInProgressEthers'):
      return <AllowanceInProgressStateView state={state} send={send} steps={steps} />
    case state.matches('txSuccess'):
      return <AllowanceSuccessStateView state={state} send={send} steps={steps} />
    default:
      return <></>
  }
}
