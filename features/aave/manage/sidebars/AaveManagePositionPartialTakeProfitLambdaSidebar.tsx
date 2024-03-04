import { executeTransaction } from 'blockchain/better-calls/dpm-account'
import { InfoSectionTable } from 'components/infoSection/InfoSectionTable'
import { AppLink } from 'components/Links'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { ConnectedSidebarSection } from 'features/aave/components'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import { PreparingPartialTakeProfitSidebarContent } from 'features/aave/manage/sidebars/partial-take-profit-components/PreparingPartialTakeProfitSidebarContent'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import { useLambdaDebouncedPartialTakeProfit } from 'features/aave/open/helpers/use-lambda-debounced-partial-take-profit'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TriggerAction } from 'helpers/triggers'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

type PartialTakeProfitSidebarStates =
  | 'prepare'
  | 'preparedRemove'
  | 'addInProgress'
  | 'updateInProgress'
  | 'removeInProgress'
  | 'finished'

const refreshDataTime = 10 * 1000

const profitRangeItem = [
  '4,100 ETH/USD',
  <Flex sx={{ flexDirection: 'column', textAlign: 'right' }}>
    <Text variant="paragraph4" color="neutral80" sx={{ fontSize: '11px' }}>
      531 ETH
    </Text>
  </Flex>,
  <Flex sx={{ flexDirection: 'column', textAlign: 'right' }}>
    <Text variant="paragraph4" color="neutral100" sx={{ fontSize: '11px' }}>
      531 ETH
    </Text>
    <Text variant="paragraph4" sx={{ fontSize: '11px', mt: '-5px' }} color="neutral80">
      782,321 USDC
    </Text>
  </Flex>,
  '2,332 ETH/USD',
]

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
  const { signer } = useWalletManagement()
  const [triggerId, setTriggerId] = useState<string>(
    aaveLikePartialTakeProfitLambdaData.triggerId ?? '0',
  )
  const [transactionStep, setTransactionStep] = useState<PartialTakeProfitSidebarStates>('prepare')
  const { strategyConfig } = state.context
  const { triggerLtv, withdrawalLtv, startingTakeProfitPrice, partialTakeProfitToken } =
    aaveLikePartialTakeProfitParams
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
    })

  useEffect(() => {
    if (aaveLikePartialTakeProfitLambdaData.triggerLtv) {
      aaveLikePartialTakeProfitParams.setTriggerLtv(aaveLikePartialTakeProfitLambdaData.triggerLtv)
      aaveLikePartialTakeProfitLambdaData.startingTakeProfitPrice &&
        aaveLikePartialTakeProfitParams.setStartingTakeProfitPrice(
          aaveLikePartialTakeProfitLambdaData.startingTakeProfitPrice,
        )
      aaveLikePartialTakeProfitParams.setCustomPriceRatioPercentage(undefined)
    }
    // updates the trigger ltv and withdrawal ltv, removes the custom price ratio percentage
    // but only after its been loaded from the lambda (and its there)
    // should be empty
  }, [])

  useEffect(() => {
    if (refreshingTriggerData) {
      setTimeout(() => {
        setRefreshingTriggerData(false)
        onTxFinished()
        if (aaveLikePartialTakeProfitLambdaData.triggerId !== triggerId) {
          setTriggerId(aaveLikePartialTakeProfitLambdaData.triggerId ?? '0')
          setRefreshingTriggerData(false)
        } else {
          setRefreshingTriggerData(true)
        }
      }, refreshDataTime)
    }
  }, [refreshingTriggerData])

  const sidebarInProgressContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      <InfoSectionTable
        title="Full realized profit range"
        headers={['Trigger Price', 'Realized profit', 'Total profit', 'Stop Loss']}
        rows={[...Array.from({ length: 13 }, () => profitRangeItem)]}
        wrapperSx={{
          gridGap: 1,
        }}
        defaultLimitItems={3}
        expandItemsButtonLabel="See next 10 price triggers"
      />
    </Grid>
  ) : (
    <></>
  )

  const sidebarRemoveTriggerContent: SidebarSectionProps['content'] = state.context.strategyInfo ? (
    <Grid gap={3}>sidebarRemoveTriggerContent</Grid>
  ) : (
    <></>
  )

  const executeCall = async () => {
    const { partialTakeProfitTxDataLambda } = state.context
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
        setTransactionStep('finished')
        action !== TriggerAction.Remove && setRefreshingTriggerData(true)
      })
      .catch((error) => {
        console.error('error', error)
        setTransactionStep('prepare')
      })
  }

  const isDisabled = useMemo(() => {
    if (
      isGettingPartialTakeProfitTx ||
      ['addInProgress', 'updateInProgress', 'removeInProgress'].includes(transactionStep)
    ) {
      return true
    }
    if (transactionStep === 'finished') {
      return false
    }
    return false
  }, [isGettingPartialTakeProfitTx, transactionStep])

  const primaryButtonAction = () => {
    if (['prepare', 'preparedRemove'].includes(transactionStep)) {
      setTransactionStep(inProgressState)
      partialTakeProfitTxCancelablePromise?.cancel()
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

  const showSecondaryButton =
    (transactionStep === 'prepare' && action !== TriggerAction.Remove) ||
    (action === TriggerAction.Remove && transactionStep !== 'finished') ||
    ['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)

  const secondaryButtonLabel = () => {
    if (transactionStep === 'prepare') {
      return t('system.remove-trigger')
    }
    if (
      action === TriggerAction.Remove ||
      ['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)
    ) {
      return t('go-back')
    }
    return ''
  }

  const secondaryButtonAction = () => {
    if (transactionStep === 'prepare') {
      setTransactionStep('preparedRemove')
    }
    if (['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)) {
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

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('system.partial-take-profit'),
    dropdown,
    content: {
      prepare: (
        <PreparingPartialTakeProfitSidebarContent
          strategyConfig={strategyConfig}
          aaveLikePartialTakeProfitParams={aaveLikePartialTakeProfitParams}
          aaveLikePartialTakeProfitLambdaData={aaveLikePartialTakeProfitLambdaData}
        />
      ),
      preparedRemove: sidebarRemoveTriggerContent,
      addInProgress: sidebarInProgressContent,
      updateInProgress: sidebarInProgressContent,
      removeInProgress: sidebarRemoveTriggerContent,
      finished: (
        <Grid gap={3}>
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
            </Flex>
          </Box>
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
      isLoading: isGettingPartialTakeProfitTx || refreshingTriggerData,
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
