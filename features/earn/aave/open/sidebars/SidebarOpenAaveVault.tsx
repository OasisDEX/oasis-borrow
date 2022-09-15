import { useActor } from '@xstate/react'
import { BigNumber } from 'bignumber.js'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import { amountFromWei } from '../../../../../blockchain/utils'
import { WAD } from '../../../../../components/constants'
import { SliderValuePicker } from '../../../../../components/dumb/SliderValuePicker'
import { SidebarResetButton } from '../../../../../components/vault/sidebar/SidebarResetButton'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { LOAN_FEE, OAZO_FEE } from '../../../../../helpers/multiply/calculations'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { one, zero } from '../../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { ProxyView } from '../../../../proxyNew'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { calculatePosition, IPosition } from '../services/tmpMaths'
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
  function convertMultipleToColRatio(multiple: BigNumber): BigNumber {
    return one.div(multiple.minus(one)).plus(one)
  }

  function convertColRatioToMultiple(colRatio: BigNumber): BigNumber {
    return convertMultipleToColRatio(colRatio)
  }
  const marketStEthEthPrice = amountFromWei(new BigNumber('968102393798180700'), 'ETH')
  const minColRatio = new BigNumber(5)
  const minRisk = convertColRatioToMultiple(minColRatio)
  const maxRisk = state.context.strategyInfo ? state.context.strategyInfo.maxMultiple : zero

  const currentPosition: IPosition = {
    collateral: zero,
    collateralPriceInUSD: new BigNumber(1),
    debt: zero,
    debtPriceInUSD: new BigNumber('968102393798180700').div(WAD),
    collateralRatio: zero,
    liquidationRatio: one.div(state.context.strategyInfo?.liquidationThreshold || one),
    multiple: zero,
  }

  const endState = calculatePosition({
    currentPosition,
    addedByUser: {
      collateral: state.context.amount,
    },
    targetCollateralRatio: convertMultipleToColRatio(state.context.multiply || minRisk),
    fees: {
      oazo: OAZO_FEE,
      flashLoan: LOAN_FEE,
    },
    prices: {
      oracle: one.div(marketStEthEthPrice),
      market: marketStEthEthPrice,
    },
    slippage: new BigNumber('0.005'),
  })

  let liquidationPriceRatio = one

  if (
    state.context.amount &&
    state.context.strategyInfo?.liquidationThreshold &&
    endState.debtDelta
  ) {
    liquidationPriceRatio = one.div(
      state.context.amount
        .times(state.context.strategyInfo?.liquidationThreshold)
        .div(endState.debtDelta),
    )
  }

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SliderValuePicker
          sliderPercentageFill={new BigNumber(0)}
          leftBoundry={liquidationPriceRatio}
          leftBoundryFormatter={(value) => value.toFixed(2)}
          rightBoundry={marketStEthEthPrice}
          rightBoundryFormatter={(value) => `Current: ${value.toFixed(2)}`}
          onChange={(value) => {
            send({ type: 'SET_MULTIPLE', multiple: value })
          }}
          minBoundry={minRisk}
          maxBoundry={maxRisk}
          lastValue={state.context.multiply!}
          disabled={false}
          leftBoundryStyling={{ fontWeight: 'semiBold', textAlign: 'right' }}
          rightBoundryStyling={{
            fontWeight: 'semiBold',
            textAlign: 'right',
            color: 'primary100',
          }}
          step={0.01}
          leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price')}
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
        <SidebarResetButton
          clear={() => {
            send({ type: 'SET_MULTIPLE', multiple: minRisk })
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
