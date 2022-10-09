import { RiskRatio } from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
import { BigNumber } from 'bignumber.js'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Link, Text } from 'theme-ui'
import { Sender } from 'xstate'

import { SliderValuePicker } from '../../../../../components/dumb/SliderValuePicker'
import { MessageCard } from '../../../../../components/MessageCard'
import { SidebarResetButton } from '../../../../../components/vault/sidebar/SidebarResetButton'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatPercent } from '../../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { one, zero } from '../../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { ProxyView } from '../../../../proxyNew'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { OpenAaveEvent, OpenAaveStateMachine, OpenAaveStateMachineState } from '../state/'
import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

interface OpenAaveStateProps {
  readonly state: OpenAaveStateMachineState
  readonly send: Sender<OpenAaveEvent>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OpenAaveInformationContainer({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
    </VaultChangesInformationContainer>
  )
}

function OpenAaveTransactionInProgressStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [3, state.context.totalSteps!],
      isLoading: true,
      disabled: true,
      label: t('open-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveReviewingStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [3, state.context.totalSteps!],
      isLoading: false,
      disabled: !state.can('NEXT_STEP'),
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('NEXT_STEP'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveFailureStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: t('open-earn.aave.vault-form.retry-btn'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveEditingStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const hasProxy = state.context.proxyAddress !== undefined
  const isProxyCreationDisabled = useFeatureToggle('ProxyCreationDisabled')

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SidebarOpenAaveVaultEditingState state={state} send={send} />
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: !state.can('NEXT_STEP') || (!hasProxy && isProxyCreationDisabled),
      label: hasProxy ? t('open-earn.aave.vault-form.open-btn') : t('create-proxy-btn'),
      action: () => send('NEXT_STEP'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveSuccessStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      label: t('open-earn.aave.vault-form.go-to-position'),
      url: `/earn/${state.context.strategyName}/${state.context.proxyAddress}`,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function SettingMultipleView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const maxRisk = state.context.transactionParameters?.simulation.position.category.maxLoanToValue

  const minRisk =
    state.context.transactionParameters?.simulation.minConfigurableRiskRatio ||
    new RiskRatio(zero, RiskRatio.TYPE.LTV)

  const liquidationPrice =
    state.context.transactionParameters?.simulation.position.liquidationPrice || zero

  const oracleAssetPrice = state.context.strategyInfo?.oracleAssetPrice || zero

  enum RiskLevel {
    OK = 'OK',
    AT_RISK = 'AT_RISK',
  }

  const healthFactor = state.context.transactionParameters?.simulation.position.healthFactor

  const warningHealthFactor = new BigNumber('1.25')

  const riskTrafficLight = healthFactor?.gt(warningHealthFactor) ? RiskLevel.OK : RiskLevel.AT_RISK

  const collateralToken = state.context.strategyInfo?.collateralToken

  const debtToken = state.context.token

  const priceMovementUntilLiquidation = one.minus(one.div(healthFactor || zero)).times(100)

  const priceMovementWarningThreshold = new BigNumber(20)

  const priceMovementToDisplay = formatPercent(
    BigNumber.min(priceMovementUntilLiquidation, priceMovementWarningThreshold),
    { precision: 2 },
  )

  const isWarning = priceMovementUntilLiquidation.lte(priceMovementWarningThreshold)

  console.log(
    `state.context.strategyInfo?.liquidationBonus ${state.context.strategyInfo?.liquidationBonus}`,
  )

  const liquidationPenalty = formatPercent(
    (state.context.strategyInfo?.liquidationBonus || zero).times(100),
    {
      precision: 2,
    },
  )

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SliderValuePicker
          sliderPercentageFill={new BigNumber(0)}
          leftBoundry={liquidationPrice}
          leftBoundryFormatter={(value) => value.toFixed(2)}
          rightBoundry={oracleAssetPrice}
          rightBoundryFormatter={(value) => `Current: ${value.toFixed(2)}`}
          rightBoundryStyling={{
            color: riskTrafficLight === RiskLevel.OK ? 'success100' : 'warning100',
          }}
          onChange={(ltv) => {
            send({ type: 'SET_RISK_RATIO', riskRatio: new RiskRatio(ltv, RiskRatio.TYPE.LTV) })
          }}
          minBoundry={minRisk.loanToValue || zero}
          maxBoundry={maxRisk || zero}
          lastValue={state.context.riskRatio.loanToValue}
          disabled={false}
          step={0.01}
          leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price', {
            collateralToken,
            debtToken,
          })}
          rightLabel={
            <Link target="_blank" href="https://dune.com/dataalways/stETH-De-Peg">
              <Text variant="paragraph4" color="interactive100">
                {t('open-earn.aave.vault-form.configure-multiple.historical-ratio', {
                  collateralToken,
                  debtToken,
                })}{' '}
                &gt;
              </Text>
            </Link>
          }
        />
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            color: 'neutral80',
          }}
        >
          <Text as="span">{t('open-earn.aave.vault-form.configure-multiple.increase-risk')}</Text>
          <Text as="span">{t('open-earn.aave.vault-form.configure-multiple.decrease-risk')}</Text>
        </Flex>
        <OpenAaveInformationContainer state={state} send={send} />
        <MessageCard
          messages={[
            isWarning
              ? t('open-earn.aave.vault-form.configure-multiple.vault-message-warning', {
                  collateralToken,
                  priceMovement: priceMovementToDisplay,
                  debtToken,
                  liquidationPenalty,
                })
              : t('open-earn.aave.vault-form.configure-multiple.vault-message-ok', {
                  collateralToken,
                  priceMovement: priceMovementToDisplay,
                  debtToken,
                  liquidationPenalty,
                }),
          ]}
          type={isWarning ? 'warning' : 'ok'}
        />
        <SidebarResetButton
          clear={() => {
            send({ type: 'SET_RISK_RATIO', riskRatio: minRisk })
          }}
        />
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [2, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: t('open-earn.aave.vault-form.open-btn'),
      action: () => send('NEXT_STEP'),
    },
    textButton: {
      label: 'Back to enter ETH',
      action: () => send('BACK_TO_EDITING'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarOpenAaveVault() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  switch (true) {
    case state.matches('editing'):
      return <OpenAaveEditingStateView state={state} send={send} />
    case state.matches('proxyCreating'):
      return <ProxyView proxyMachine={state.context.refProxyMachine!} />
    case state.matches('settingMultiple'):
      return <SettingMultipleView state={state} send={send} />
    case state.matches('reviewing'):
      return <OpenAaveReviewingStateView state={state} send={send} />
    case state.matches('txInProgress'):
      return <OpenAaveTransactionInProgressStateView state={state} send={send} />
    case state.matches('txFailure'):
      return <OpenAaveFailureStateView state={state} send={send} />
    case state.matches('txSuccess'):
      return <OpenAaveSuccessStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
