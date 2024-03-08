import { executeTransaction } from 'blockchain/better-calls/dpm-account'
import { DimmedList } from 'components/DImmedList'
import { InfoSection } from 'components/infoSection/InfoSection'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { ConnectedSidebarSection } from 'features/aave/components'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { useGasEstimation } from 'features/aave/hooks/useGasEstimation'
import { useTransactionCostWithLoading } from 'features/aave/hooks/useTransactionCostWithLoading'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import { PreparingPartialTakeProfitSidebarContent } from 'features/aave/manage/sidebars/partial-take-profit-components/PreparingPartialTakeProfitSidebarContent'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import { useLambdaDebouncedPartialTakeProfit } from 'features/aave/open/helpers/use-lambda-debounced-partial-take-profit'
import { StopLossTxCompleteBanner } from 'features/aave/open/sidebars/components/StopLossTxCompleteBanner'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAmount } from 'helpers/formatters/format'
import { TriggerAction } from 'helpers/triggers'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { useInterval } from 'usehooks-ts'

type PartialTakeProfitSidebarStates =
  | 'prepare'
  | 'preparedRemove'
  | 'addInProgress'
  | 'updateInProgress'
  | 'removeInProgress'
  | 'finished'

const refreshDataTime = 10 * 1000

export function AaveManagePositionPartialTakeProfitLambdaSidebar({
  state,
  send,
  dropdown,
  aaveLikePartialTakeProfitParams,
  aaveLikePartialTakeProfitLambdaData,
  onTxFinished,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
  aaveLikePartialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
  onTxFinished: () => void
}) {
  const { t } = useTranslation()
  const partialTakeProfitTranslationParams = {
    feature: t(sidebarAutomationFeatureCopyMap['partialTakeProfit']),
    featureName: t(sidebarAutomationFeatureCopyMap['partialTakeProfit']), // the same param, two different names
  }
  const [refreshingTriggerData, setRefreshingTriggerData] = useState(false)
  const { strategyConfig, strategyInfo, partialTakeProfitTxDataLambda } = state.context
  const { signer } = useWalletManagement()
  const gasEstimation = useGasEstimation({
    transaction: partialTakeProfitTxDataLambda,
    networkId: strategyConfig.networkId,
    signer,
  })
  const TransactionCost = useTransactionCostWithLoading({ transactionCost: gasEstimation })
  const [triggerId, setTriggerId] = useState<string>(
    aaveLikePartialTakeProfitLambdaData.triggerId ?? '0',
  )
  const [transactionStep, setTransactionStep] = useState<PartialTakeProfitSidebarStates>('prepare')
  const {
    triggerLtv,
    withdrawalLtv,
    startingTakeProfitPrice,
    partialTakeProfitToken,
    partialTakeProfitProfits,
    partialTakeProfitTokenData,
    priceFormat,
    withdrawalLtvSliderConfig,
    triggerLtvSliderConfig,
    positionPriceRatio,
    newStopLossLtv,
    currentLtv,
  } = aaveLikePartialTakeProfitParams
  const {
    startingTakeProfitPrice: lambdaStartingTakeProfitPrice,
    currentStopLossLevel,
    triggerLtv: lambdaTriggerLtv,
  } = aaveLikePartialTakeProfitLambdaData
  const action = useMemo(() => {
    const anyPartialTakeProfit = aaveLikePartialTakeProfitLambdaData.triggerLtv
    if (transactionStep === 'preparedRemove') {
      return TriggerAction.Remove
    }
    return anyPartialTakeProfit ? TriggerAction.Update : TriggerAction.Add
  }, [aaveLikePartialTakeProfitLambdaData.triggerLtv, transactionStep])
  const inProgressState = {
    [TriggerAction.Add]: 'addInProgress',
    [TriggerAction.Update]: 'updateInProgress',
    [TriggerAction.Remove]: 'removeInProgress',
  }[action] as PartialTakeProfitSidebarStates
  const { errors, warnings, isGettingPartialTakeProfitTx, partialTakeProfitTxCancelablePromise } =
    useLambdaDebouncedPartialTakeProfit({
      state,
      send,
      triggerLtv,
      withdrawalLtv,
      startingTakeProfitPrice,
      partialTakeProfitToken,
      action,
      newStopLossLtv:
        (currentStopLossLevel && !newStopLossLtv.eq(currentStopLossLevel)) || !currentStopLossLevel
          ? newStopLossLtv
          : undefined,
      newStopLossAction: currentStopLossLevel ? TriggerAction.Update : TriggerAction.Add,
      transactionStep,
    })

  useEffect(() => {
    if (aaveLikePartialTakeProfitLambdaData.triggerLtv) {
      aaveLikePartialTakeProfitParams.setTriggerLtv(aaveLikePartialTakeProfitLambdaData.triggerLtv)
      aaveLikePartialTakeProfitLambdaData.startingTakeProfitPrice &&
        aaveLikePartialTakeProfitParams.setStartingTakeProfitPrice(
          aaveLikePartialTakeProfitLambdaData.startingTakeProfitPrice,
        )
      aaveLikePartialTakeProfitLambdaData.withdrawalLtv &&
        aaveLikePartialTakeProfitParams.setWithdrawalLtv(
          aaveLikePartialTakeProfitLambdaData.withdrawalLtv,
        )
      aaveLikePartialTakeProfitParams.setCustomPriceRatioPercentage(undefined)
    }
    // updates the trigger ltv and withdrawal ltv, removes the custom price ratio percentage
    // but only after its been loaded from the lambda (and its there)
    // should be empty
  }, [])

  useEffect(() => {
    if (
      aaveLikePartialTakeProfitLambdaData.currentStopLossLevel &&
      !aaveLikePartialTakeProfitLambdaData.currentStopLossLevel.eq(newStopLossLtv)
    ) {
      aaveLikePartialTakeProfitParams.setNewStopLossLtv(
        aaveLikePartialTakeProfitLambdaData.currentStopLossLevel,
      )
    }
    // this handles only when the stop loss in lambda is loaded
    // user can update SL level with the slider
  }, [aaveLikePartialTakeProfitLambdaData.currentStopLossLevel])

  useInterval(onTxFinished, refreshingTriggerData ? refreshDataTime : null)

  useEffect(() => {
    if (aaveLikePartialTakeProfitLambdaData.triggerId !== triggerId) {
      setTriggerId(aaveLikePartialTakeProfitLambdaData.triggerId ?? '0')
      setRefreshingTriggerData(false)
      partialTakeProfitProfits &&
        send({
          type: 'SET_PARTIAL_TAKE_PROFIT_FIRST_PROFIT_LAMBDA',
          partialTakeProfitFirstProfit: partialTakeProfitProfits[0],
        })
    }
  }, [aaveLikePartialTakeProfitLambdaData.triggerId, triggerId, partialTakeProfitProfits, send])

  const resetXStateData = () => {
    if (action === TriggerAction.Remove) {
      send({
        type: 'SET_PARTIAL_TAKE_PROFIT_TX_DATA_LAMBDA',
        partialTakeProfitTxDataLambda: undefined,
      })
      send({
        type: 'SET_PARTIAL_TAKE_PROFIT_PROFITS_LAMBDA',
        partialTakeProfitProfits: undefined,
      })
    }
  }

  const executeCall = async () => {
    if (partialTakeProfitTxDataLambda && signer) {
      return await executeTransaction({
        data: partialTakeProfitTxDataLambda.data,
        to: partialTakeProfitTxDataLambda.to,
        signer: signer,
        networkId: strategyConfig.networkId,
      })
    }
    return null
  }

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
        setTransactionStep('prepare')
      })
  }

  const frontendErrors = useMemo(() => {
    const currentLtvValue = currentLtv.times(lambdaPercentageDenomination)
    const triggerLtvTooHigh = triggerLtv.gt(currentLtvValue.plus(triggerLtvSliderConfig.step))
    const cumulativeLtvTooHight = triggerLtv
      .plus(withdrawalLtv)
      .gt(withdrawalLtvSliderConfig.maxBoundry)
    const startingTakeProfitPriceTooLow = !lambdaStartingTakeProfitPrice
      ? startingTakeProfitPrice.lt(positionPriceRatio)
      : false
    return [
      triggerLtvTooHigh &&
        `Trigger LTV should not be higher than current position LTV (${currentLtvValue.toFixed(
          2,
        )}%)`,
      cumulativeLtvTooHight &&
        `Trigger LTV and Withdrawal LTV sum should be less than maximum LTV (${withdrawalLtvSliderConfig.maxBoundry}%)`,
      startingTakeProfitPriceTooLow &&
        'Starting take profit price should be higher or equal the current price.',
    ].filter(Boolean) as string[]
  }, [
    currentLtv,
    lambdaStartingTakeProfitPrice,
    positionPriceRatio,
    startingTakeProfitPrice,
    triggerLtv,
    triggerLtvSliderConfig.step,
    withdrawalLtv,
    withdrawalLtvSliderConfig.maxBoundry,
  ])

  const isDisabled = useMemo(() => {
    if (frontendErrors.length || errors.length) {
      return true
    }
    if (
      isGettingPartialTakeProfitTx ||
      refreshingTriggerData ||
      ['addInProgress', 'updateInProgress', 'removeInProgress'].includes(transactionStep)
    ) {
      return true
    }
    if (transactionStep === 'finished') {
      return false
    }
    return false
  }, [
    errors.length,
    frontendErrors.length,
    isGettingPartialTakeProfitTx,
    refreshingTriggerData,
    transactionStep,
  ])

  const primaryButtonAction = () => {
    if (['prepare', 'preparedRemove'].includes(transactionStep)) {
      setTransactionStep(inProgressState)
      partialTakeProfitTxCancelablePromise?.cancel()
      executionAction()
    }
    if (transactionStep === 'finished') {
      onTxFinished()
      resetXStateData()
      setTransactionStep('prepare')
    }
  }

  const primaryButtonLabel = () => {
    const primaryButtonMap = {
      prepare: {
        [TriggerAction.Add]: t('automation.add-trigger', partialTakeProfitTranslationParams),
        [TriggerAction.Update]: t('automation.update-trigger', partialTakeProfitTranslationParams),
        [TriggerAction.Remove]: t('automation.cancel-trigger', partialTakeProfitTranslationParams),
      }[action],
      preparedAdd: t('protection.confirm'),
      preparedUpdate: t('protection.confirm'),
      preparedRemove: t('protection.confirm'),
      addInProgress: t('automation.setting', partialTakeProfitTranslationParams),
      removeInProgress: t('automation.cancelling', partialTakeProfitTranslationParams),
      updateInProgress: t('automation.updating', partialTakeProfitTranslationParams),
      finished: t('open-earn.aave.vault-form.back-to-editing'),
    } as Record<PartialTakeProfitSidebarStates, string>
    return primaryButtonMap[transactionStep]
  }

  const showSecondaryButton = useMemo(() => {
    if (transactionStep === 'prepare' && action !== TriggerAction.Remove && !!lambdaTriggerLtv) {
      return true
    }
    if (action === TriggerAction.Remove && transactionStep !== 'finished') {
      return true
    }
    if (transactionStep === 'preparedRemove') {
      return true
    }
    return false
  }, [action, lambdaTriggerLtv, transactionStep])

  const secondaryButtonLabel = () => {
    if (transactionStep === 'prepare') {
      return t('system.remove-trigger')
    }
    if (action === TriggerAction.Remove || transactionStep === 'preparedRemove') {
      return t('go-back')
    }
    return ''
  }

  const secondaryButtonAction = () => {
    if (transactionStep === 'prepare') {
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

  const parsedProfits = useMemo(() => {
    return partialTakeProfitProfits
      ? partialTakeProfitProfits.map((profit) => {
          const isSelectedTokenDebt = partialTakeProfitToken === 'debt'
          const selectedTokenSymbol = partialTakeProfitTokenData.symbol
          const secondaryToSelectedToken =
            strategyConfig.tokens[partialTakeProfitToken === 'debt' ? 'collateral' : 'debt']
          const realizedProfitValue = isSelectedTokenDebt
            ? profit.realizedProfitInDebt
            : profit.realizedProfitInCollateral
          const totalProfitValue = isSelectedTokenDebt
            ? profit.totalProfitInDebt
            : profit.totalProfitInCollateral
          const totalProfitSecondValue = isSelectedTokenDebt
            ? profit.totalProfitInCollateral
            : profit.totalProfitInDebt
          return [
            // Trigger price
            `${formatAmount(profit.triggerPrice, selectedTokenSymbol)} ${priceFormat}`,
            // Realized profit
            <Flex sx={{ flexDirection: 'column', textAlign: 'right' }}>
              <Text variant="paragraph4" color="neutral80" sx={{ fontSize: '11px' }}>
                {`${formatAmount(
                  realizedProfitValue.balance,
                  selectedTokenSymbol,
                )} ${selectedTokenSymbol}`}
              </Text>
            </Flex>,
            // Total profit
            <Flex sx={{ flexDirection: 'column', textAlign: 'right' }}>
              <Text variant="paragraph4" color="neutral100" sx={{ fontSize: '11px' }}>
                {`${formatAmount(
                  totalProfitValue.balance,
                  selectedTokenSymbol,
                )} ${selectedTokenSymbol}`}
              </Text>
              <Text variant="paragraph4" sx={{ fontSize: '11px', mt: '-5px' }} color="neutral80">
                {`${formatAmount(
                  totalProfitSecondValue.balance,
                  secondaryToSelectedToken,
                )} ${secondaryToSelectedToken}`}
              </Text>
            </Flex>,
            // Stop loss
            `${formatAmount(profit.stopLossDynamicPrice, selectedTokenSymbol)} ${priceFormat}`,
          ]
        })
      : []
  }, [
    partialTakeProfitToken,
    partialTakeProfitTokenData.symbol,
    priceFormat,
    partialTakeProfitProfits,
    strategyConfig.tokens,
  ])

  const parsedSummaryProfits = useMemo(() => {
    if (partialTakeProfitProfits && partialTakeProfitProfits[0]) {
      const profit = partialTakeProfitProfits[0]
      const isSelectedTokenDebt = partialTakeProfitToken === 'debt'
      const selectedTokenSymbol = partialTakeProfitTokenData.symbol
      const realizedProfitValue = isSelectedTokenDebt
        ? profit.realizedProfitInDebt
        : profit.realizedProfitInCollateral
      return {
        nextTriggerPrice: `${formatAmount(
          profit.triggerPrice,
          selectedTokenSymbol,
        )} ${priceFormat}`,
        nextRealizedProfit: `${formatAmount(
          realizedProfitValue.balance,
          selectedTokenSymbol,
        )} ${selectedTokenSymbol}`,
        nextStopLossTriggerPrice: `${formatAmount(
          profit.stopLossDynamicPrice,
          selectedTokenSymbol,
        )} ${priceFormat}`,
      }
    }
    return {}
  }, [
    partialTakeProfitToken,
    partialTakeProfitTokenData.symbol,
    priceFormat,
    partialTakeProfitProfits,
  ])

  const sidebarInProgressContent: SidebarSectionProps['content'] = strategyInfo ? (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      <DimmedList>
        {action !== TriggerAction.Remove && (
          <>
            <VaultChangesInformationItem
              label="Next trigger price"
              value={
                parsedSummaryProfits.nextTriggerPrice ? (
                  <Text>{parsedSummaryProfits.nextTriggerPrice}</Text>
                ) : (
                  <AppSpinner />
                )
              }
            />
            <VaultChangesInformationItem
              label="Next realized profit"
              value={
                parsedSummaryProfits.nextRealizedProfit ? (
                  <Text>{parsedSummaryProfits.nextRealizedProfit}</Text>
                ) : (
                  <AppSpinner />
                )
              }
            />
            <VaultChangesInformationItem
              label="Next Stop-Loss trigger price"
              value={
                parsedSummaryProfits.nextStopLossTriggerPrice ? (
                  <Text>{parsedSummaryProfits.nextStopLossTriggerPrice}</Text>
                ) : (
                  <AppSpinner />
                )
              }
            />
          </>
        )}
        <VaultChangesInformationItem
          label={`${t('protection.estimated-fees-on-trigger', {
            token: strategyConfig.tokens.collateral,
          })}`}
          value={TransactionCost}
        />
      </DimmedList>
    </Grid>
  ) : (
    <></>
  )

  const sidebarRemoveTriggerContent: SidebarSectionProps['content'] = strategyInfo ? (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', { feature: t('partial-take-profit') })}
      </Text>
      <InfoSection
        title="Cancel Auto Take Profit order summary"
        items={[
          {
            label: 'Next Dynamic Trigger Price',
            value: parsedSummaryProfits.nextTriggerPrice ? (
              <Text>{parsedSummaryProfits.nextTriggerPrice}</Text>
            ) : (
              <AppSpinner />
            ),
            change: 'n/a',
          },
          {
            label: 'Next realized profit',
            value: parsedSummaryProfits.nextRealizedProfit ? (
              <Text>{parsedSummaryProfits.nextRealizedProfit}</Text>
            ) : (
              <AppSpinner />
            ),
            change: 'n/a',
          },
          {
            label: 'Next Stop-Loss trigger price',
            value: parsedSummaryProfits.nextStopLossTriggerPrice ? (
              <Text>{parsedSummaryProfits.nextStopLossTriggerPrice}</Text>
            ) : (
              <AppSpinner />
            ),
            change: 'n/a',
          },
          {
            label: t('auto-sell.estimated-transaction-cost'),
            value: TransactionCost,
          },
        ]}
      />
      <MessageCard
        messages={[
          <>
            <strong>{t(`notice`)}</strong>: {t('protection.take-profit-cancel-notice')}
          </>,
        ]}
        type="warning"
        withBullet={false}
      />
    </Grid>
  ) : (
    <></>
  )

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('system.partial-take-profit'),
    dropdown,
    content: {
      prepare: (
        <PreparingPartialTakeProfitSidebarContent
          strategyConfig={strategyConfig}
          aaveLikePartialTakeProfitParams={aaveLikePartialTakeProfitParams}
          aaveLikePartialTakeProfitLambdaData={aaveLikePartialTakeProfitLambdaData}
          isGettingPartialTakeProfitTx={isGettingPartialTakeProfitTx}
          errors={errors}
          frontendErrors={frontendErrors}
          warnings={warnings}
          profits={parsedProfits}
        />
      ),
      preparedRemove: sidebarRemoveTriggerContent,
      addInProgress: sidebarInProgressContent,
      updateInProgress: sidebarInProgressContent,
      removeInProgress: sidebarRemoveTriggerContent,
      finished: (
        <Grid gap={3}>
          <StopLossTxCompleteBanner />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {action === TriggerAction.Add && (
              <>
                {t('automation-creation.add-complete-content', partialTakeProfitTranslationParams)}{' '}
                <AppLink
                  href={`https://docs.summer.fi/products/${sidebarAutomationLinkMap['partialTakeProfit']}`}
                  sx={{ fontSize: 2 }}
                >
                  {t('here')}.
                </AppLink>
              </>
            )}
            {action === TriggerAction.Remove &&
              t('automation-creation.remove-complete-content', partialTakeProfitTranslationParams)}
          </Text>
          <Box>
            <VaultChangesWithADelayCard />
          </Box>
        </Grid>
      ),
    }[transactionStep],
    primaryButton: {
      isLoading:
        isGettingPartialTakeProfitTx ||
        refreshingTriggerData ||
        transactionStep === 'removeInProgress',
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

  return (
    <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} disableMaxHeight />
  )
}
