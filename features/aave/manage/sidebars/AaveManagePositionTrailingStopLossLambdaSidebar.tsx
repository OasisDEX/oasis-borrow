import BigNumber from 'bignumber.js'
import { estimateGas } from 'blockchain/better-calls/dpm-account'
import { getOverrides } from 'blockchain/better-calls/utils/get-overrides'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { ActionPills } from 'components/ActionPills'
import { useProductContext } from 'components/context/ProductContextProvider'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { ethers } from 'ethers'
import { ConnectedSidebarSection } from 'features/aave/components'
// import { OpenAaveStopLossInformationLambda } from 'features/aave/components/order-information/OpenAaveStopLossInformationLambda'
import type { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getAaveLikeTrailingStopLossParams } from 'features/aave/open/helpers/get-aave-like-trailing-stop-loss-params'
import { useLambdaDebouncedTrailingStopLoss } from 'features/aave/open/helpers/use-lambda-debounced-trailing-stop-loss'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TriggerAction } from 'helpers/triggers'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

type TrailingStopLossSidebarStates =
  | 'prepare'
  | 'preparedAdd'
  | 'preparedUpdate'
  | 'preparedRemove'
  | 'addInProgress'
  | 'updateInProgress'
  | 'removeInProgress'
  | 'finished'

export function AaveManagePositionTrailingStopLossLambdaSidebar({
  state,
  send,
  dropdown,
  stopLossLambdaData,
  trailingStopLossLambdaData,
  trailingStopLossToken,
  setTrailingStopLossToken,
  reserveConfigurationData,
  onTxFinished,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  stopLossLambdaData: ReturnType<typeof mapStopLossFromLambda>
  trailingStopLossLambdaData: ReturnType<typeof mapTrailingStopLossFromLambda>
  trailingStopLossToken: 'debt' | 'collateral'
  setTrailingStopLossToken: (token: 'debt' | 'collateral') => void
  reserveConfigurationData: AaveLikeReserveConfigurationData
  onTxFinished: () => void
}) {
  const { t } = useTranslation()
  const [transactionStep, setTransactionStep] = useState<TrailingStopLossSidebarStates>('prepare')
  const isRegularStopLossEnabled = stopLossLambdaData.stopLossLevel !== undefined
  const isTrailingStopLossEnabled = trailingStopLossLambdaData.trailingDistance !== undefined
  const { strategyConfig } = state.context
  const {
    trailingDistance,
    sliderMin,
    sliderMax,
    sliderPercentageFill,
    liquidationPrice,
    collateralTokenPrice,
    sliderStep,
    // ...stopLossParamsRest
  } = getAaveLikeTrailingStopLossParams.manage({ state })
  const { tokenPriceUSD$ } = useProductContext()
  const action = useMemo(() => {
    const anyStopLoss = isTrailingStopLossEnabled || isRegularStopLossEnabled
    if (transactionStep === 'preparedRemove') {
      return TriggerAction.Remove
    }
    return anyStopLoss ? TriggerAction.Update : TriggerAction.Add
  }, [transactionStep, isTrailingStopLossEnabled, isRegularStopLossEnabled])
  console.log(
    'params',
    JSON.stringify(
      {
        trailingDistance: trailingDistance.toString(),
        sliderMin: sliderMin.toString(),
        sliderMax: sliderMax.toString(),
        collateralTokenPrice: collateralTokenPrice.toString(),
        sliderPercentageFill: sliderPercentageFill.toString(),
      },
      null,
      2,
    ),
  )
  const _tokenPriceUSD$ = useMemo(
    () =>
      tokenPriceUSD$([
        'ETH',
        trailingStopLossToken === 'debt'
          ? strategyConfig.tokens.debt
          : strategyConfig.tokens.collateral,
      ]),
    [
      trailingStopLossToken,
      strategyConfig.tokens.collateral,
      strategyConfig.tokens.debt,
      tokenPriceUSD$,
    ],
  )
  // const [tokensPriceData] = useObservable(_tokenPriceUSD$)
  const { trailingStopLossTxCancelablePromise, isGettingTrailingStopLossTx } =
    useLambdaDebouncedTrailingStopLoss({
      state,
      trailingDistance,
      trailingStopLossToken,
      send,
      action,
    })

  const preparedState = {
    [TriggerAction.Add]: 'preparedAdd',
    [TriggerAction.Update]: 'preparedUpdate',
    [TriggerAction.Remove]: 'preparedRemove',
  }[action] as TrailingStopLossSidebarStates
  const inProgressState = {
    [TriggerAction.Add]: 'addInProgress',
    [TriggerAction.Update]: 'updateInProgress',
    [TriggerAction.Remove]: 'removeInProgress',
  }[action] as TrailingStopLossSidebarStates

  const trailingStopLossConfigChanged = useMemo(() => {
    if (action === TriggerAction.Remove) return true
    const trailingStopLossDifferentThanLambda =
      trailingStopLossLambdaData.trailingDistance &&
      (!trailingDistance.eq(trailingStopLossLambdaData.trailingDistance) ||
        trailingStopLossLambdaData.trailingStopLossToken !== trailingStopLossToken)
    return trailingStopLossLambdaData.trailingDistance ? trailingStopLossDifferentThanLambda : true
  }, [trailingStopLossLambdaData, trailingDistance, trailingStopLossToken, action])

  useEffect(() => {
    if (trailingStopLossLambdaData.trailingDistance) {
      send({
        type: 'SET_STOP_LOSS_LEVEL',
        stopLossLevel: trailingStopLossLambdaData.trailingDistance,
      })
    } else {
      send({
        type: 'SET_STOP_LOSS_LEVEL',
        stopLossLevel: reserveConfigurationData.liquidationThreshold
          .minus(aaveOffsets.manage.max)
          .times(100),
      })
    }
  }, [])

  const stopLossTranslationParams = {
    feature: t(sidebarAutomationFeatureCopyMap['stopLoss']),
    featureName: t(sidebarAutomationFeatureCopyMap['stopLoss']), // the same param, two different names
  }

  const executeCall = async () => {
    const { stopLossTxDataLambda, strategyConfig, web3Context } = state.context
    if (stopLossTxDataLambda) {
      const proxyAddress = stopLossTxDataLambda.to
      const networkId = strategyConfig.networkId
      const contracts = getNetworkContracts(networkId, web3Context?.chainId)
      ensureContractsExist(networkId, contracts, ['automationBotV2'])
      const signer = (web3Context as ContextConnected)?.transactionProvider
      const bnValue = new BigNumber(0)
      const data = stopLossTxDataLambda.data
      const value = ethers.utils.parseEther(bnValue.toString()).toHexString()
      const gasLimit = await estimateGas({
        networkId,
        proxyAddress,
        signer,
        value: bnValue,
        to: proxyAddress,
        data,
      })
      return signer.sendTransaction({
        ...(await getOverrides(signer)),
        to: proxyAddress,
        data,
        value,
        gasLimit: gasLimit ?? undefined,
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
            action: () => setTrailingStopLossToken('debt'),
          },
          {
            id: 'collateral',
            label: t('close-to', { token: strategyConfig.tokens.collateral }),
            action: () => setTrailingStopLossToken('collateral'),
          },
        ]}
        active={trailingStopLossToken}
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="protection.set-distance-protection-desc"
          values={{
            distance: t('protection.trailing-stop-loss-price-distance'),
          }}
          components={{
            1: <AppLink href={'#'} sx={{ fontSize: 2 }} />,
          }}
        />
      </Text>
      <SliderValuePicker
        disabled={false}
        step={sliderStep}
        leftBoundryFormatter={(x: BigNumber) =>
          x.isZero()
            ? '-'
            : `${formatAmount(sliderMax.minus(x), strategyConfig.tokens.debt)} ${
                strategyConfig.tokens.debt
              }/${strategyConfig.tokens.collateral}`
        }
        rightBoundryFormatter={(x: BigNumber) => (x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD'))}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={trailingDistance}
        minBoundry={sliderMin}
        maxBoundry={sliderMax.minus(sliderStep)}
        rightBoundry={collateralTokenPrice}
        leftBoundry={trailingDistance}
        onChange={(trailingDistance) => {
          send({
            type: 'SET_TRAILING_STOP_LOSS_LEVEL',
            trailingDistance,
          })
          trailingStopLossTxCancelablePromise?.cancel()
        }}
        useRcSlider
        leftLabel={t('protection.trailing-distance')}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
      {/* {!!state.context.strategyInfo && (
        <OpenAaveStopLossInformationLambda
          stopLossParams={{
            stopLossLevel,
            dynamicStopLossPrice,
            sliderMin,
            sliderMax,
            sliderPercentageFill,
            liquidationPrice,
            ...stopLossParamsRest,
          }}
          tokensPriceData={tokensPriceData}
          strategyInfo={state.context.strategyInfo}
          collateralActive={trailingStopLossToken === 'collateral'}
        />
      )} */}
      <Text as="p" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {t('protection.not-guaranteed')}
      </Text>
      <Text as="p" variant="paragraph3">
        {t('protection.guarantee-factors')}{' '}
        <AppLink href={EXTERNAL_LINKS.KB.AUTOMATION} sx={{ fontWeight: 'body' }}>
          {t('protection.learn-more-about-automation')}
        </AppLink>
      </Text>
    </Grid>
  )

  const sidebarPreparedContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.confirmation-text', stopLossTranslationParams)}
      </Text>
      {/* <OpenAaveStopLossInformationLambda
        stopLossParams={{
          stopLossLevel,
          dynamicStopLossPrice,
          sliderMin,
          sliderMax,
          sliderPercentageFill,
          liquidationPrice,
          ...stopLossParamsRest,
        }}
        tokensPriceData={tokensPriceData}
        strategyInfo={state.context.strategyInfo}
        collateralActive={trailingStopLossToken === 'collateral'}
      /> */}
    </Grid>
  ) : (
    <></>
  )

  const sidebarInProgressContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      {/* <OpenAaveStopLossInformationLambda
        stopLossParams={{
          stopLossLevel,
          dynamicStopLossPrice,
          sliderMin,
          sliderMax,
          sliderPercentageFill,
          liquidationPrice,
          ...stopLossParamsRest,
        }}
        tokensPriceData={tokensPriceData}
        strategyInfo={state.context.strategyInfo}
        collateralActive={trailingStopLossToken === 'collateral'}
      /> */}
    </Grid>
  ) : (
    <></>
  )

  const sidebarRemoveTriggerContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', stopLossTranslationParams)}
      </Text>
      <VaultChangesInformationContainer title={t('cancel-stoploss.summary-header')}>
        {!liquidationPrice.isZero() && (
          <VaultChangesInformationItem
            label={`${t('cancel-stoploss.liquidation')}`}
            value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
          />
        )}
        <VaultChangesInformationItem
          label={`${t('cancel-stoploss.stop-loss-coll-ratio')}`}
          value={
            <Flex>
              {formatPercent(trailingDistance)}
              <VaultChangesInformationArrow />
              n/a
            </Flex>
          }
        />
      </VaultChangesInformationContainer>
      <MessageCard
        messages={[
          <>
            <strong>{t(`notice`)}</strong>:{' '}
            {t('protection.cancel-notice', { ratioParam: t('system.loan-to-value') })}
          </>,
        ]}
        type="warning"
        withBullet={false}
      />
    </Grid>
  ) : (
    <></>
  )

  const sidebarFinishedContent: SidebarSectionProps['content'] = (
    <Grid gap={3}>
      <Box>
        <Flex sx={{ justifyContent: 'center', mb: 4 }}>
          <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
        </Flex>
      </Box>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {action === TriggerAction.Add && (
          <>
            {t('automation-creation.add-complete-content', stopLossTranslationParams)}{' '}
            <AppLink
              href={`https://docs.summer.fi/products/${sidebarAutomationLinkMap['stopLoss']}`}
              sx={{ fontSize: 2 }}
            >
              {t('here')}.
            </AppLink>
          </>
        )}
        {action === TriggerAction.Remove &&
          t('automation-creation.remove-complete-content', stopLossTranslationParams)}
      </Text>
      <Box>
        <VaultChangesWithADelayCard />
      </Box>
    </Grid>
  )

  const executionAction = () => {
    void executeCall()
      .then(() => {
        setTransactionStep('finished')
      })
      .catch((error) => {
        console.error('error', error)
        setTransactionStep(preparedState)
      })
  }

  const isDisabled = useMemo(() => {
    if (
      isGettingTrailingStopLossTx ||
      ['addInProgress', 'updateInProgress', 'removeInProgress'].includes(transactionStep)
    ) {
      return true
    }
    if (transactionStep === 'finished') {
      return false
    }
    return !trailingStopLossConfigChanged
  }, [isGettingTrailingStopLossTx, trailingStopLossConfigChanged, transactionStep])

  const primaryButtonAction = () => {
    if (transactionStep === 'prepare') {
      setTransactionStep(preparedState)
    }
    if (['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)) {
      setTransactionStep(inProgressState)
      trailingStopLossTxCancelablePromise?.cancel()
      executionAction()
    }
    if (transactionStep === 'finished') {
      onTxFinished()
      setTransactionStep('prepare')
    }
  }

  const primaryButtonLabel = () => {
    const primaryButtonMap = {
      prepare: {
        [TriggerAction.Add]: t('automation.add-trigger', stopLossTranslationParams),
        [TriggerAction.Update]: t('automation.update-trigger', stopLossTranslationParams),
        [TriggerAction.Remove]: t('automation.cancel-trigger', stopLossTranslationParams),
      }[action],
      preparedAdd: t('protection.confirm'),
      preparedUpdate: t('protection.confirm'),
      preparedRemove: t('protection.confirm'),
      addInProgress: t('automation.setting', stopLossTranslationParams),
      removeInProgress: t('automation.cancelling', stopLossTranslationParams),
      updateInProgress: t('automation.updating', stopLossTranslationParams),
      finished: t('open-earn.aave.vault-form.back-to-editing'),
    } as Record<TrailingStopLossSidebarStates, string>
    return primaryButtonMap[transactionStep]
  }

  const showSecondaryButton =
    (transactionStep === 'prepare' &&
      isTrailingStopLossEnabled &&
      action !== TriggerAction.Remove) ||
    (action === TriggerAction.Remove && transactionStep !== 'finished')

  const secondaryButtonLabel = () => {
    if (transactionStep === 'prepare' && isTrailingStopLossEnabled) {
      return t('system.remove-trigger')
    }
    if (action === TriggerAction.Remove) {
      return t('go-back')
    }
    return ''
  }
  const secondaryButtonAction = () => {
    if (transactionStep === 'prepare' && isTrailingStopLossEnabled) {
      setTransactionStep('preparedRemove')
    }
    if (transactionStep === 'preparedRemove') {
      setTransactionStep('prepare')
    }
  }

  const getCurrectStep: () => [number, number] = () => {
    switch (transactionStep) {
      case 'prepare':
        return [1, 3]
      case 'preparedAdd':
      case 'preparedUpdate':
      case 'preparedRemove':
      case 'addInProgress':
      case 'updateInProgress':
      case 'removeInProgress':
        return [2, 3]
      case 'finished':
        return [3, 3]
      default:
        return [1, 3]
    }
  }

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('system.trailing-stop-loss'),
    dropdown,
    content: {
      prepare: sidebarPreparingContent,
      preparedAdd: sidebarPreparedContent,
      preparedUpdate: sidebarPreparedContent,
      preparedRemove: sidebarRemoveTriggerContent,
      addInProgress: sidebarInProgressContent,
      updateInProgress: sidebarInProgressContent,
      removeInProgress: sidebarRemoveTriggerContent,
      finished: sidebarFinishedContent,
    }[transactionStep],
    primaryButton: {
      isLoading: isGettingTrailingStopLossTx,
      disabled: isDisabled,
      label: primaryButtonLabel(),
      action: primaryButtonAction,
      steps: getCurrectStep(),
    },
    textButton: showSecondaryButton
      ? {
          label: secondaryButtonLabel(),
          action: secondaryButtonAction,
        }
      : undefined,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
