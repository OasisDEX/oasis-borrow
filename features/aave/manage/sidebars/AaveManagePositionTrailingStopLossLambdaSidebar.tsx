import type BigNumber from 'bignumber.js'
import { executeTransaction } from 'blockchain/better-calls/dpm-account'
import { ActionPills } from 'components/ActionPills'
import { DimmedList } from 'components/DImmedList'
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
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ConnectedSidebarSection } from 'features/aave/components'
import {
  getDenominations,
  mapErrorsToErrorVaults,
  mapWarningsToWarningVaults,
} from 'features/aave/helpers'
import { useGasEstimation } from 'features/aave/hooks/useGasEstimation'
import { useTransactionCostWithLoading } from 'features/aave/hooks/useTransactionCostWithLoading'
import type { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { TriggersAaveEvent } from 'features/aave/manage/state'
import { getAaveLikeTrailingStopLossParams } from 'features/aave/open/helpers/get-aave-like-trailing-stop-loss-params'
import { useLambdaDebouncedTrailingStopLoss } from 'features/aave/open/helpers/use-lambda-debounced-trailing-stop-loss'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TriggerAction } from 'helpers/triggers'
import { one } from 'helpers/zero'
import React, { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { useInterval } from 'usehooks-ts'
import type { Sender } from 'xstate'

type TrailingStopLossSidebarStates =
  | 'prepare'
  | 'preparedAdd'
  | 'preparedUpdate'
  | 'preparedRemove'
  | 'addInProgress'
  | 'updateInProgress'
  | 'removeInProgress'
  | 'finished'

const refreshDataTime = 10 * 1000

const getFormatters = (trailingDistance: BigNumber, strategyConfig: IStrategyConfig) => {
  const { denomination, denominationToken } = getDenominations(strategyConfig)
  const firstFormatter = (x: BigNumber) =>
    x.isZero() ? '-' : `${formatAmount(trailingDistance, denominationToken)} ${denomination}`
  const secondFormatter = (x: BigNumber) =>
    x.isZero() ? '-' : `${formatAmount(x, denominationToken)} ${denomination}`

  return [firstFormatter, secondFormatter]
}

export function AaveManagePositionTrailingStopLossLambdaSidebar({
  state,
  send,
  dropdown,
  stopLossLambdaData,
  trailingStopLossLambdaData,
  trailingStopLossToken,
  setTrailingStopLossToken,
  onTxFinished,
  sendTriggerEvent,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  stopLossLambdaData: ReturnType<typeof mapStopLossFromLambda>
  trailingStopLossLambdaData: ReturnType<typeof mapTrailingStopLossFromLambda>
  trailingStopLossToken: 'debt' | 'collateral'
  setTrailingStopLossToken: (token: 'debt' | 'collateral') => void
  onTxFinished: () => void
  sendTriggerEvent: Sender<TriggersAaveEvent>
}) {
  const { t } = useTranslation()
  const [refreshingTriggerData, setRefreshingTriggerData] = useState(false)
  const { signer } = useWalletManagement()

  const [triggerId, setTriggerId] = useState<string>(trailingStopLossLambdaData.triggerId ?? '0')
  const [transactionStep, setTransactionStep] = useState<TrailingStopLossSidebarStates>('prepare')
  const isRegularStopLossEnabled = stopLossLambdaData.stopLossLevel !== undefined
  const isTrailingStopLossEnabled = trailingStopLossLambdaData.trailingDistance !== undefined
  const { strategyConfig, strategyInfo, trailingStopLossTxDataLambda } = state.context
  const gasEstimation = useGasEstimation({
    transaction: trailingStopLossTxDataLambda,
    networkId: strategyConfig.networkId,
    signer,
  })
  const TransactionCost = useTransactionCostWithLoading({
    transactionCost: gasEstimation,
    isLoading: refreshingTriggerData,
  })

  const {
    trailingDistance,
    trailingDistanceValue,
    sliderMin,
    sliderMax,
    sliderPercentageFill,
    liquidationPrice,
    sliderStep,
    trailingDistanceLambdaValue,
    dynamicStopPriceChange,
    estimatedTokenOnSLTriggerChange,
    savingCompareToLiquidation,
    priceRatio,
  } = getAaveLikeTrailingStopLossParams.manage({
    state,
    trailingStopLossLambdaData,
    trailingStopLossToken,
  })
  const action = useMemo(() => {
    const anyStopLoss = isTrailingStopLossEnabled || isRegularStopLossEnabled
    if (transactionStep === 'preparedRemove') {
      return TriggerAction.Remove
    }
    return anyStopLoss ? TriggerAction.Update : TriggerAction.Add
  }, [transactionStep, isTrailingStopLossEnabled, isRegularStopLossEnabled])
  const selectedTokenLabel = strategyConfig.tokens[trailingStopLossToken]

  const calculatedTrailingDistanceValue = useMemo(() => {
    if (strategyConfig.strategyType === StrategyType.Short) {
      const current = one.div(priceRatio)
      const dynamic = one.div(priceRatio.plus(trailingDistanceValue))
      return current.minus(dynamic)
    }
    return trailingDistanceValue
  }, [trailingDistanceValue, priceRatio, strategyConfig.strategyType])

  const { trailingStopLossTxCancelablePromise, isGettingTrailingStopLossTx, errors, warnings } =
    useLambdaDebouncedTrailingStopLoss({
      state,
      trailingDistance,
      trailingDistanceValue: calculatedTrailingDistanceValue,
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
        type: 'SET_TRAILING_STOP_LOSS_LEVEL',
        trailingDistance: trailingDistanceLambdaValue,
      })
    } else {
      send({
        type: 'SET_TRAILING_STOP_LOSS_LEVEL',
        trailingDistance: sliderMax.minus(sliderStep),
      })
    }
  }, []) // should remain empty

  useInterval(onTxFinished, refreshingTriggerData ? refreshDataTime : null)

  useEffect(() => {
    if (stopLossLambdaData.triggerId !== triggerId) {
      setTriggerId(stopLossLambdaData.triggerId ?? '0')
      setRefreshingTriggerData(false)
    }
  }, [stopLossLambdaData.triggerId, triggerId])

  const stopLossTranslationParams = {
    feature: t(sidebarAutomationFeatureCopyMap['stopLoss']),
    featureName: t(sidebarAutomationFeatureCopyMap['stopLoss']), // the same param, two different names
  }

  const [leftFormatter, rightFormatter] = getFormatters(trailingDistanceValue, strategyConfig)

  const executeCall = async () => {
    if (trailingStopLossTxDataLambda && signer) {
      return await executeTransaction({
        data: trailingStopLossTxDataLambda.data,
        to: trailingStopLossTxDataLambda.to,
        signer: signer,
        networkId: strategyConfig.networkId,
      })
    }
    return null
  }
  const frontendErrors = useMemo(() => {
    const validationDisabled = getLocalAppConfig('features').AaveV3LambdaSuppressValidation
    return [
      validationDisabled && 'Validation is disabled, you are proceeding on your own risk.',
    ].filter(Boolean) as string[]
  }, [])

  const stopLossInformationPanel = (
    <DimmedList>
      <VaultChangesInformationItem
        label={`${t('protection.estimated-to-receive')}`}
        value={
          <Flex>
            {t('protection.up-to')}{' '}
            {`${formatAmount(
              estimatedTokenOnSLTriggerChange,
              selectedTokenLabel,
            )} ${selectedTokenLabel}`}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.saving-comp-to-liquidation')}`}
        value={
          <Flex>
            {t('protection.up-to')}{' '}
            {`${formatAmount(
              savingCompareToLiquidation,
              selectedTokenLabel,
            )} ${selectedTokenLabel}`}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.estimated-fees-on-trigger', {
          token: selectedTokenLabel,
        })}`}
        value={TransactionCost}
      />
    </DimmedList>
  )

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
            1: (
              <AppLink href={EXTERNAL_LINKS.KB.HOW_TRAILING_STOP_LOSS_WORKS} sx={{ fontSize: 2 }} />
            ),
          }}
        />
      </Text>
      <SliderValuePicker
        disabled={false}
        step={sliderStep}
        leftBoundryFormatter={leftFormatter}
        rightBoundryFormatter={rightFormatter}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={trailingDistance}
        minBoundry={sliderMin}
        maxBoundry={sliderMax.minus(sliderStep)}
        rightBoundry={dynamicStopPriceChange}
        leftBoundry={trailingDistance}
        onChange={(trailingDistanceChanged) => {
          send({
            type: 'SET_TRAILING_STOP_LOSS_LEVEL',
            trailingDistance: trailingDistanceChanged,
          })
          trailingStopLossTxCancelablePromise?.cancel()
        }}
        useRcSlider
        leftLabel={t('protection.trailing-distance')}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
      <>
        <MessageCard
          type="error"
          messages={frontendErrors}
          withBullet={frontendErrors.length > 1}
        />
        <VaultErrors errorMessages={mapErrorsToErrorVaults(errors)} autoType="Stop-Loss" />
        <VaultWarnings warningMessages={mapWarningsToWarningVaults(warnings)} />
      </>
      {!!stopLossLambdaData.stopLossLevel && (
        <MessageCard
          messages={[
            t('protection.current-stop-loss-overwrite', {
              addingStopLossType: t('protection.trailing-stop-loss'),
              currentStopLossType: t('protection.regular-stop-loss'),
            }),
            <Trans
              i18nKey="protection.current-stop-loss-overwrite-click-here"
              values={{
                currentStopLossType: t('protection.regular-stop-loss'),
              }}
              components={{
                1: (
                  <Text
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                    onClick={() => {
                      sendTriggerEvent({
                        type: 'CHANGE_PROTECTION_VIEW',
                        view: 'stop-loss',
                      })
                    }}
                  />
                ),
              }}
            />,
          ]}
          type="warning"
          withBullet={false}
        />
      )}
      {stopLossInformationPanel}
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

  const sidebarPreparedContent: SidebarSectionProps['content'] = strategyInfo ? (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.confirmation-text', stopLossTranslationParams)}
      </Text>
      {stopLossInformationPanel}
    </Grid>
  ) : (
    <></>
  )

  const sidebarInProgressContent: SidebarSectionProps['content'] = strategyInfo ? (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      {stopLossInformationPanel}
    </Grid>
  ) : (
    <></>
  )

  const sidebarRemoveTriggerContent: SidebarSectionProps['content'] = strategyInfo ? (
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
        if (action === TriggerAction.Remove) {
          setTimeout(() => {
            setTransactionStep('finished')
          }, refreshDataTime)
        } else {
          setRefreshingTriggerData(true)
          setTransactionStep('finished')
        }
      })
      .catch((error) => {
        console.error('error', error)
        setTransactionStep(preparedState)
      })
  }

  const isDisabled = useMemo(() => {
    const validationDisabled = getLocalAppConfig('features').AaveV3LambdaSuppressValidation
    if (
      (isGettingTrailingStopLossTx ||
        ['addInProgress', 'updateInProgress', 'removeInProgress'].includes(transactionStep) ||
        errors.length) &&
      !validationDisabled
    ) {
      return true
    }
    if (transactionStep === 'finished') {
      return false
    }
    if (trailingStopLossTxDataLambda === undefined) {
      return true
    }
    return !trailingStopLossConfigChanged && !errors.length
  }, [
    isGettingTrailingStopLossTx,
    trailingStopLossConfigChanged,
    transactionStep,
    trailingStopLossTxDataLambda,
    errors.length,
  ])

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
      isLoading: isGettingTrailingStopLossTx || refreshingTriggerData,
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
