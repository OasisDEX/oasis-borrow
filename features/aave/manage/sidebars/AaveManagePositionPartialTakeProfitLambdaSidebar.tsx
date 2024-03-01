import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ConnectedSidebarSection } from 'features/aave/components'
import { PreparingPartialTakeProfitSidebarContent } from 'features/aave/manage/sidebars/partial-take-profit-components/PreparingPartialTakeProfitSidebarContent'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

type PartialTakeProfitSidebarStates =
  | 'prepare'
  | 'preparedAdd'
  | 'preparedUpdate'
  | 'preparedRemove'
  | 'addInProgress'
  | 'updateInProgress'
  | 'removeInProgress'
  | 'finished'

// const refreshDataTime = 10 * 1000

// const getFormatters = (strategyConfig: IStrategyConfig) => {
//   const { denomination, denominationToken } = getDenominations(strategyConfig)
//   const firstFormatter = (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x))
//   const secondFormatter = (x: BigNumber) =>
//     x.isZero() ? '-' : `${formatAmount(x, denominationToken)} ${denomination}`

//   return [firstFormatter, secondFormatter]
// }

export function AaveManagePositionPartialTakeProfitLambdaSidebar({
  state,
  send,
  dropdown,
  aaveLikePartialTakeProfitParams,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
}) {
  const { t } = useTranslation()
  // const [refreshingTriggerData, setRefreshingTriggerData] = useState(false)
  // const { signer } = useWalletManagement()
  // const [triggerId, setTriggerId] = useState<string>(stopLossLambdaData.triggerId ?? '0')
  const [transactionStep, setTransactionStep] = useState<PartialTakeProfitSidebarStates>('prepare')
  const { strategyConfig } = state.context
  const {
    priceFormat,
    positionPriceRatio,
    priceDenominationToken,
    partialTakeProfitTokenData,
    triggerLtv,
    setTriggerLtv,
  } = aaveLikePartialTakeProfitParams

  useEffect(() => {
    // if (stopLossLambdaData.stopLossLevel) {
    //   send({
    //     type: 'SET_STOP_LOSS_LEVEL',
    //     stopLossLevel: stopLossLambdaData.stopLossLevel,
    //   })
    // } else {
    //   send({
    //     type: 'SET_STOP_LOSS_LEVEL',
    //     stopLossLevel: reserveConfigurationData.liquidationThreshold
    //       .minus(aaveOffsets.manage.max)
    //       .times(100),
    //   })
    // }
  }, []) // should be empty

  // useEffect(() => {
  // if (refreshingTriggerData) {
  //   setTimeout(() => {
  //     setRefreshingTriggerData(false)
  //     onTxFinished()
  //     if (stopLossLambdaData.triggerId !== triggerId) {
  //       setTriggerId(stopLossLambdaData.triggerId ?? '0')
  //       setRefreshingTriggerData(false)
  //     } else {
  //       setRefreshingTriggerData(true)
  //     }
  //   }, refreshDataTime)
  // }
  // }, [refreshingTriggerData])

  const sidebarPreparingContent: SidebarSectionProps['content'] = (
    <PreparingPartialTakeProfitSidebarContent
      strategyConfig={strategyConfig}
      aaveLikePartialTakeProfitParams={aaveLikePartialTakeProfitParams}
    />
  )

  const sidebarPreparedContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>sidebarPreparedContent</Grid>
  ) : (
    <></>
  )

  const sidebarInProgressContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>sidebarInProgressContent</Grid>
  ) : (
    <></>
  )

  const sidebarRemoveTriggerContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>sidebarRemoveTriggerContent</Grid>
  ) : (
    <></>
  )

  const sidebarFinishedContent: SidebarSectionProps['content'] = (
    <Grid gap={3}>sidebarFinishedContent</Grid>
  )

  // const executionAction = () => {
  //   console.log('executionAction not implemented');
  // void executeCall()
  //   .then(() => {
  //     setTransactionStep('finished')
  //     action !== TriggerAction.Remove && setRefreshingTriggerData(true)
  //   })
  //   .catch((error) => {
  //     console.error('error', error)
  //     setTransactionStep(preparedState)
  //   })
  // }

  // const isDisabled = useMemo(() => {
  // if (
  //   isGettingStopLossTx ||
  //   ['addInProgress', 'updateInProgress', 'removeInProgress'].includes(transactionStep)
  // ) {
  //   return true
  // }
  // if (transactionStep === 'finished') {
  //   return false
  // }
  // return !stopLossConfigChanged
  // }, [isGettingStopLossTx, stopLossConfigChanged, transactionStep])

  // const primaryButtonAction = () => {
  //   if (transactionStep === 'prepare') {
  //     setTransactionStep(preparedState)
  //   }
  //   if (['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)) {
  //     setTransactionStep(inProgressState)
  //     stopLossTxCancelablePromise?.cancel()
  //     executionAction()
  //   }
  //   if (transactionStep === 'finished') {
  //     onTxFinished()
  //     setTransactionStep('prepare')
  //   }
  // }

  // const primaryButtonLabel = () => {
  //   const primaryButtonMap = {
  //     prepare: {
  //       [TriggerAction.Add]: t('automation.add-trigger', stopLossTranslationParams),
  //       [TriggerAction.Update]: t('automation.update-trigger', stopLossTranslationParams),
  //       [TriggerAction.Remove]: t('automation.cancel-trigger', stopLossTranslationParams),
  //     }[action],
  //     preparedAdd: t('protection.confirm'),
  //     preparedUpdate: t('protection.confirm'),
  //     preparedRemove: t('protection.confirm'),
  //     addInProgress: t('automation.setting', stopLossTranslationParams),
  //     removeInProgress: t('automation.cancelling', stopLossTranslationParams),
  //     updateInProgress: t('automation.updating', stopLossTranslationParams),
  //     finished: t('open-earn.aave.vault-form.back-to-editing'),
  //   } as Record<PartialTakeProfitSidebarStates, string>
  //   return primaryButtonMap[transactionStep]
  // }

  // const showSecondaryButton =
  //   (transactionStep === 'prepare' &&
  //     isRegularStopLossEnabled &&
  //     action !== TriggerAction.Remove) ||
  //   (action === TriggerAction.Remove && transactionStep !== 'finished') ||
  //   ['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)

  // const secondaryButtonLabel = () => {
  //   if (transactionStep === 'prepare' && isRegularStopLossEnabled) {
  //     return t('system.remove-trigger')
  //   }
  //   if (
  //     action === TriggerAction.Remove ||
  //     ['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)
  //   ) {
  //     return t('go-back')
  //   }
  //   return ''
  // }

  // const secondaryButtonAction = () => {
  //   if (transactionStep === 'prepare' && isRegularStopLossEnabled) {
  //     setTransactionStep('preparedRemove')
  //   }
  //   if (['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)) {
  //     setTransactionStep('prepare')
  //   }
  // }

  // const getCurrectStep: () => [number, number] = () => {
  //   switch (transactionStep) {
  //     case 'prepare':
  //       return [1, 3]
  //     case 'preparedAdd':
  //     case 'preparedUpdate':
  //     case 'preparedRemove':
  //     case 'addInProgress':
  //     case 'updateInProgress':
  //     case 'removeInProgress':
  //       return [2, 3]
  //     case 'finished':
  //       return [3, 3]
  //     default:
  //       return [1, 3]
  //   }
  // }

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('system.partial-take-profit'),
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
      // isLoading: isGettingStopLossTx || refreshingTriggerData,
      // disabled: isDisabled,
      // label: primaryButtonLabel(),
      // action: primaryButtonAction,
      // steps: getCurrectStep(),
      label: 'Button label',
    },
    // textButton: showSecondaryButton
    //   ? {
    //       label: secondaryButtonLabel(),
    //       action: secondaryButtonAction,
    //     }
    //   : undefined,
  }

  return (
    <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} disableMaxHeight />
  )
}
