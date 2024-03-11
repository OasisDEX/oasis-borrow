import type BigNumber from 'bignumber.js'
import { executeTransaction } from 'blockchain/better-calls/dpm-account'
import { ActionPills } from 'components/ActionPills'
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
import { OpenAaveStopLossInformationLambda } from 'features/aave/components/order-information/OpenAaveStopLossInformationLambda'
import {
  getDenominations,
  mapErrorsToErrorVaults,
  mapWarningsToWarningVaults,
} from 'features/aave/helpers'
import type { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { TriggersAaveEvent } from 'features/aave/manage/state'
import { getAaveLikeStopLossParams } from 'features/aave/open/helpers'
import { useLambdaDebouncedStopLoss } from 'features/aave/open/helpers/use-lambda-debounced-stop-loss'
import type { IStrategyConfig } from 'features/aave/types'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TriggerAction } from 'helpers/triggers'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { useInterval } from 'usehooks-ts'
import type { Sender } from 'xstate'

const aaveLambdaStopLossConfig = {
  translationRatioParam: 'vault-changes.loan-to-value',
  sliderStep: 0.1,
}

type StopLossSidebarStates =
  | 'prepare'
  | 'preparedAdd'
  | 'preparedUpdate'
  | 'preparedRemove'
  | 'addInProgress'
  | 'updateInProgress'
  | 'removeInProgress'
  | 'finished'

const refreshDataTime = 10 * 1000

const getFormatters = (strategyConfig: IStrategyConfig) => {
  const { denomination, denominationToken } = getDenominations(strategyConfig)
  const firstFormatter = (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x, { precision: 2 }))
  const secondFormatter = (x: BigNumber) =>
    x.isZero() ? '-' : `${formatAmount(x, denominationToken)} ${denomination}`

  return [firstFormatter, secondFormatter]
}

export function AaveManagePositionStopLossLambdaSidebar({
  state,
  send,
  dropdown,
  stopLossLambdaData,
  stopLossToken,
  trailingStopLossLambdaData,
  setStopLossToken,
  reserveConfigurationData,
  onTxFinished,
  sendTriggerEvent,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  stopLossLambdaData: ReturnType<typeof mapStopLossFromLambda>
  trailingStopLossLambdaData: ReturnType<typeof mapTrailingStopLossFromLambda>
  stopLossToken: 'debt' | 'collateral'
  setStopLossToken: (token: 'debt' | 'collateral') => void
  reserveConfigurationData: AaveLikeReserveConfigurationData
  onTxFinished: () => void
  sendTriggerEvent: Sender<TriggersAaveEvent>
}) {
  const { t } = useTranslation()
  const [refreshingTriggerData, setRefreshingTriggerData] = useState(false)
  const { signer } = useWalletManagement()
  const [triggerId, setTriggerId] = useState<string>(stopLossLambdaData.triggerId ?? '0')
  const [transactionStep, setTransactionStep] = useState<StopLossSidebarStates>('prepare')

  useEffect(() => {
    if (stopLossLambdaData.stopLossLevel) {
      send({
        type: 'SET_STOP_LOSS_LEVEL',
        stopLossLevel: stopLossLambdaData.stopLossLevel,
      })
    } else {
      send({
        type: 'SET_STOP_LOSS_LEVEL',
        stopLossLevel: reserveConfigurationData.liquidationThreshold
          .minus(aaveOffsets.manage.max)
          .times(100),
      })
    }
  }, []) // should be empty

  useInterval(onTxFinished, refreshingTriggerData ? refreshDataTime : null)

  useEffect(() => {
    if (stopLossLambdaData.triggerId !== triggerId) {
      setTriggerId(stopLossLambdaData.triggerId ?? '0')
      setRefreshingTriggerData(false)
    }
  }, [stopLossLambdaData.triggerId, triggerId])

  const isRegularStopLossEnabled = stopLossLambdaData.stopLossLevel !== undefined
  const isTrailingStopLossEnabled = trailingStopLossLambdaData.trailingDistance !== undefined
  const { strategyConfig } = state.context
  const {
    stopLossLevel,
    dynamicStopLossPrice,
    sliderMin,
    sliderMax,
    sliderPercentageFill,
    liquidationPrice,
    dynamicStopLossPriceForView,
    ...stopLossParamsRest
  } = getAaveLikeStopLossParams.manage({ state })
  const action = useMemo(() => {
    const anyStopLoss = isTrailingStopLossEnabled || isRegularStopLossEnabled
    if (transactionStep === 'preparedRemove') {
      return TriggerAction.Remove
    }
    return anyStopLoss ? TriggerAction.Update : TriggerAction.Add
  }, [transactionStep, isTrailingStopLossEnabled, isRegularStopLossEnabled])

  const { stopLossTxCancelablePromise, isGettingStopLossTx, errors, warnings } =
    useLambdaDebouncedStopLoss({
      state,
      stopLossLevel,
      stopLossToken,
      send,
      action,
    })

  const preparedState = {
    [TriggerAction.Add]: 'preparedAdd',
    [TriggerAction.Update]: 'preparedUpdate',
    [TriggerAction.Remove]: 'preparedRemove',
  }[action] as StopLossSidebarStates
  const inProgressState = {
    [TriggerAction.Add]: 'addInProgress',
    [TriggerAction.Update]: 'updateInProgress',
    [TriggerAction.Remove]: 'removeInProgress',
  }[action] as StopLossSidebarStates

  const stopLossConfigChanged = useMemo(() => {
    if (action === TriggerAction.Remove) return true
    const stopLossDifferentThanLambda =
      stopLossLambdaData.stopLossLevel &&
      (!stopLossLevel.eq(stopLossLambdaData.stopLossLevel) ||
        stopLossLambdaData.stopLossToken !== stopLossToken)
    return stopLossLambdaData.stopLossLevel ? stopLossDifferentThanLambda : true
  }, [stopLossLambdaData, stopLossLevel, stopLossToken, action])

  const stopLossTranslationParams = {
    feature: t(sidebarAutomationFeatureCopyMap['stopLoss']),
    featureName: t(sidebarAutomationFeatureCopyMap['stopLoss']), // the same param, two different names
  }

  const executeCall = async () => {
    const { stopLossTxDataLambda, strategyConfig } = state.context
    if (stopLossTxDataLambda && signer) {
      return await executeTransaction({
        data: stopLossTxDataLambda.data,
        to: stopLossTxDataLambda.to,
        signer: signer,
        networkId: strategyConfig.networkId,
      })
    }
    return null
  }
  const [leftFormatter, rightFormatter] = getFormatters(strategyConfig)

  const frontendErrors = useMemo(() => {
    const validationDisabled = getLocalAppConfig('features').AaveV3LambdaSuppressValidation
    return [
      validationDisabled && 'Validation is disabled, you are proceeding on your own risk.',
    ].filter(Boolean) as string[]
  }, [])

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
        leftBoundryFormatter={leftFormatter}
        rightBoundryFormatter={rightFormatter}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={stopLossLevel}
        maxBoundry={sliderMax}
        minBoundry={sliderMin}
        rightBoundry={dynamicStopLossPriceForView}
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
      />
      {!!trailingStopLossLambdaData.trailingDistance && (
        <MessageCard
          messages={[
            t('protection.current-stop-loss-overwrite', {
              addingStopLossType: t('protection.regular-stop-loss'),
              currentStopLossType: t('protection.trailing-stop-loss'),
            }),
            <Trans
              i18nKey="protection.current-stop-loss-overwrite-click-here"
              values={{
                currentStopLossType: t('protection.trailing-stop-loss'),
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
                        view: 'trailing-stop-loss',
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
      <>
        <MessageCard
          type="error"
          messages={frontendErrors}
          withBullet={frontendErrors.length > 1}
        />
        <VaultErrors errorMessages={mapErrorsToErrorVaults(errors)} autoType="Stop-Loss" />
        <VaultWarnings warningMessages={mapWarningsToWarningVaults(warnings)} />
      </>
      {!!state.context.strategyInfo && (
        <OpenAaveStopLossInformationLambda
          stopLossParams={{
            stopLossLevel,
            dynamicStopLossPrice,
            sliderMin,
            sliderMax,
            sliderPercentageFill,
            liquidationPrice,
            dynamicStopLossPriceForView,
            ...stopLossParamsRest,
          }}
          strategyInfo={state.context.strategyInfo}
          collateralActive={stopLossToken === 'collateral'}
        />
      )}
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
      <OpenAaveStopLossInformationLambda
        stopLossParams={{
          stopLossLevel,
          dynamicStopLossPrice,
          sliderMin,
          sliderMax,
          sliderPercentageFill,
          liquidationPrice,
          dynamicStopLossPriceForView,
          ...stopLossParamsRest,
        }}
        strategyInfo={state.context.strategyInfo}
        collateralActive={stopLossToken === 'collateral'}
      />
    </Grid>
  ) : (
    <></>
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
          liquidationPrice,
          dynamicStopLossPriceForView,
          ...stopLossParamsRest,
        }}
        strategyInfo={state.context.strategyInfo}
        collateralActive={stopLossToken === 'collateral'}
      />
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
              {formatPercent(stopLossLevel)}
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
      (isGettingStopLossTx ||
        ['addInProgress', 'updateInProgress', 'removeInProgress'].includes(transactionStep) ||
        errors.length) &&
      !validationDisabled
    ) {
      return true
    }
    if (transactionStep === 'finished') {
      return false
    }
    return !stopLossConfigChanged
  }, [isGettingStopLossTx, stopLossConfigChanged, transactionStep, errors.length])

  const primaryButtonAction = () => {
    if (transactionStep === 'prepare') {
      setTransactionStep(preparedState)
    }
    if (['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)) {
      setTransactionStep(inProgressState)
      stopLossTxCancelablePromise?.cancel()
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
    } as Record<StopLossSidebarStates, string>
    return primaryButtonMap[transactionStep]
  }

  const showSecondaryButton =
    (transactionStep === 'prepare' &&
      isRegularStopLossEnabled &&
      action !== TriggerAction.Remove) ||
    (action === TriggerAction.Remove && transactionStep !== 'finished') ||
    ['preparedAdd', 'preparedUpdate', 'preparedRemove'].includes(transactionStep)

  const secondaryButtonLabel = () => {
    if (transactionStep === 'prepare' && isRegularStopLossEnabled) {
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
    if (transactionStep === 'prepare' && isRegularStopLossEnabled) {
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
    title: t('system.stop-loss'),
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
      isLoading: isGettingStopLossTx || refreshingTriggerData,
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
