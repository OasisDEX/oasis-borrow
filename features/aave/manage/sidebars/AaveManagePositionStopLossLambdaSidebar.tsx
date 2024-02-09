import type BigNumber from 'bignumber.js'
import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { ActionPills } from 'components/ActionPills'
import { useProductContext } from 'components/context/ProductContextProvider'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ConnectedSidebarSection, StrategyInformationContainer } from 'features/aave/components'
import { OpenAaveStopLossInformationLambda } from 'features/aave/components/order-information/OpenAaveStopLossInformationLambda'
import type { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getAaveLikeStopLossParams } from 'features/aave/open/helpers'
import { useLambdaDebouncedStopLoss } from 'features/aave/open/helpers/use-lambda-debounced-stop-loss'
import { StopLossTxCompleteBanner } from 'features/aave/open/sidebars/components/StopLossTxCompleteBanner'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { TriggerAction } from 'helpers/triggers'
import { zero } from 'helpers/zero'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddingStopLossAnimation } from 'theme/animations'
import { Grid, Text } from 'theme-ui'

const aaveLambdaStopLossConfig = {
  translationRatioParam: 'vault-changes.loan-to-value',
  sliderStep: 1,
  sliderDirection: 'ltr' as const,
}

export function AaveManagePositionStopLossLambdaSidebar({
  state,
  send,
  dropdown,
  stopLossLambdaData,
  stopLossToken,
  setStopLossToken,
  debtTokenReserveConfigurationData,
  onTxFinished,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  stopLossLambdaData: ReturnType<typeof mapStopLossFromLambda>
  stopLossToken: 'debt' | 'collateral'
  setStopLossToken: (token: 'debt' | 'collateral') => void
  debtTokenReserveConfigurationData: AaveLikeReserveConfigurationData
  onTxFinished: () => void
}) {
  const { t } = useTranslation()
  const [transactionStep, setTransactionStep] = useState<
    'prepare' | 'inProgress' | 'error' | 'finished'
  >('prepare')
  const isStopLossEnabled = stopLossLambdaData.stopLossLevel !== undefined
  const { strategyConfig } = state.context
  const {
    stopLossLevel,
    dynamicStopLossPrice,
    sliderMin,
    sliderMax,
    sliderPercentageFill,
    ...stopLossParamsRest
  } = getAaveLikeStopLossParams.manage({ state })
  const { tokenPriceUSD$ } = useProductContext()
  const _tokenPriceUSD$ = useMemo(
    () =>
      tokenPriceUSD$([
        'ETH',
        stopLossToken === 'debt' ? strategyConfig.tokens.debt : strategyConfig.tokens.collateral,
      ]),
    [stopLossToken, strategyConfig.tokens.collateral, strategyConfig.tokens.debt, tokenPriceUSD$],
  )
  const [tokensPriceData] = useObservable(_tokenPriceUSD$)
  const { stopLossTxCancelablePromise, isGettingStopLossTx } = useLambdaDebouncedStopLoss({
    state,
    stopLossLevel,
    stopLossToken,
    send,
    action: isStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  })

  const stopLossConfigChanged = useMemo(() => {
    return stopLossLambdaData.stopLossLevel
      ? stopLossLambdaData.stopLossLevel &&
          (!stopLossLevel.eq(stopLossLambdaData.stopLossLevel) ||
            stopLossLambdaData.stopLossToken !== stopLossToken)
      : true
  }, [stopLossLambdaData, stopLossLevel, stopLossToken])

  useEffect(() => {
    if (stopLossLambdaData.stopLossLevel) {
      send({
        type: 'SET_STOP_LOSS_LEVEL',
        stopLossLevel: stopLossLambdaData.stopLossLevel,
      })
    } else {
      send({
        type: 'SET_STOP_LOSS_LEVEL',
        stopLossLevel: debtTokenReserveConfigurationData.liquidationThreshold
          .minus(aaveOffsets.open.max)
          .times(100),
      })
    }
  }, [])

  const executeCall = async () => {
    const { stopLossTxDataLambda, strategyConfig, web3Context } = state.context
    if (stopLossTxDataLambda) {
      const proxyAddress = stopLossTxDataLambda.to
      const networkId = strategyConfig.networkId
      const contracts = getNetworkContracts(networkId, web3Context?.chainId)
      ensureContractsExist(networkId, contracts, ['automationBotV2'])
      const signer = (web3Context as ContextConnected)?.transactionProvider
      const { dpm } = await validateParameters({
        signer,
        networkId: networkId,
        proxyAddress,
      })
      return dpm.execute(contracts.automationBotV2.address, stopLossTxDataLambda.triggerTxData, {
        value: zero.toString(),
      })
    }
    return null
  }

  const sidebarPreparingContent: SidebarSectionProps['content'] = (
    <Grid gap={3}>
      <ActionPills
        items={[
          {
            id: 'debt',
            label: t('close-to', { token: strategyConfig.tokens.debt }),
            action: () => setStopLossToken('debt'),
          },
          {
            id: 'collateral',
            label: t('close-to', { token: strategyConfig.tokens.collateral }),
            action: () => setStopLossToken('collateral'),
          },
        ]}
        active={stopLossToken}
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.set-downside-protection-desc', {
          ratioParam: t(aaveLambdaStopLossConfig.translationRatioParam),
        })}{' '}
        <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>
      <SliderValuePicker
        disabled={false}
        step={aaveLambdaStopLossConfig.sliderStep}
        leftBoundryFormatter={(x: BigNumber) => (x.isZero() ? '-' : formatPercent(x))}
        rightBoundryFormatter={(x: BigNumber) => (x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD'))}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={stopLossLevel}
        maxBoundry={sliderMax}
        minBoundry={sliderMin}
        rightBoundry={dynamicStopLossPrice}
        leftBoundry={stopLossLevel}
        onChange={(slLevel) => {
          send({
            type: 'SET_STOP_LOSS_LEVEL',
            stopLossLevel: slLevel,
          })
          stopLossTxCancelablePromise?.cancel()
        }}
        useRcSlider
        leftLabel={t('protection.stop-loss-something', {
          value: t(aaveLambdaStopLossConfig.translationRatioParam),
        })}
        rightLabel={t('slider.set-stoploss.right-label')}
        direction={aaveLambdaStopLossConfig.sliderDirection}
      />
      {!!state.context.strategyInfo && (
        <OpenAaveStopLossInformationLambda
          stopLossParams={{
            stopLossLevel,
            dynamicStopLossPrice,
            sliderMin,
            sliderMax,
            sliderPercentageFill,
            ...stopLossParamsRest,
          }}
          tokensPriceData={tokensPriceData}
          strategyInfo={state.context.strategyInfo}
          collateralActive={stopLossToken === 'collateral'}
        />
      )}
    </Grid>
  )

  const sidebarInProgressContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      <OpenAaveStopLossInformationLambda
        stopLossParams={{
          stopLossLevel,
          dynamicStopLossPrice,
          sliderMin,
          sliderMax,
          sliderPercentageFill,
          ...stopLossParamsRest,
        }}
        tokensPriceData={tokensPriceData}
        strategyInfo={state.context.strategyInfo}
        collateralActive={stopLossToken === 'collateral'}
      />
    </Grid>
  ) : (
    <></>
  )

  const sidebarFinishedContent: SidebarSectionProps['content'] = (
    <Grid gap={3}>
      <StopLossTxCompleteBanner />
      <StrategyInformationContainer
        state={state}
        changeSlippageSource={(from) => {
          send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
        }}
      />
    </Grid>
  )

  const actionLabel = {
    prepare: t(isStopLossEnabled ? 'update-stop-loss' : 'add-stop-loss'),
    inProgress: t('set-up-stop-loss-tx'),
    error: t('retry'),
    finished: t('open-earn.aave.vault-form.back-to-editing'),
  }[transactionStep]

  const executionAction = () => {
    void executeCall()
      .then(() => {
        setTransactionStep('finished')
      })
      .catch(() => {
        setTransactionStep('error')
      })
  }

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('system.stop-loss'),
    dropdown,
    content: {
      prepare: sidebarPreparingContent,
      error: sidebarPreparingContent,
      inProgress: sidebarInProgressContent,
      finished: sidebarFinishedContent,
    }[transactionStep],
    primaryButton: {
      isLoading: isGettingStopLossTx,
      disabled:
        ((isGettingStopLossTx || !stopLossConfigChanged) && transactionStep !== 'finished') ||
        transactionStep === 'inProgress',
      label: actionLabel,
      action: () => {
        if (transactionStep === 'prepare') {
          setTransactionStep('inProgress')
          stopLossTxCancelablePromise?.cancel()
          executionAction()
        }
        if (transactionStep === 'finished') {
          onTxFinished()
          setTransactionStep('prepare')
        }
        if (transactionStep === 'error') {
          executionAction()
          setTransactionStep('inProgress')
        }
      },
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
