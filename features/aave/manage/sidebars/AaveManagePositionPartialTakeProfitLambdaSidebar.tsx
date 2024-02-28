import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ConnectedSidebarSection } from 'features/aave/components'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { StrategyType } from 'features/aave/types'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { one } from 'helpers/zero'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Divider, Flex, Grid, Text } from 'theme-ui'

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

const takeProfitStartingPercentageOptions = [0.1, 0.2, 0.3, 0.4, 0.5]

export function AaveManagePositionPartialTakeProfitLambdaSidebar({
  state,
  send,
  dropdown,
  partialTakeProfitToken,
  setPartialTakeProfitToken,
}: ManageAaveStateProps & {
  dropdown: SidebarSectionHeaderDropdown
  partialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
  partialTakeProfitToken: 'debt' | 'collateral'
  setPartialTakeProfitToken: (token: 'debt' | 'collateral') => void
}) {
  const { t } = useTranslation()
  // const [refreshingTriggerData, setRefreshingTriggerData] = useState(false)
  // const { signer } = useWalletManagement()
  // const [triggerId, setTriggerId] = useState<string>(stopLossLambdaData.triggerId ?? '0')
  const [transactionStep, setTransactionStep] = useState<PartialTakeProfitSidebarStates>('prepare')
  const { strategyConfig, strategyInfo, trailingStopLossTxDataLambda } = state.context

  const [inputValue, setInputValue] = useState<BigNumber>(new BigNumber(0))
  const [isFocus, setIsFocus] = useState<boolean>(false)

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
  const partialTakeProfitTokenData = useMemo(
    () => getToken(strategyConfig.tokens[partialTakeProfitToken]),
    [partialTakeProfitToken, strategyConfig.tokens],
  )
  const priceFormat =
    strategyConfig.strategyType === StrategyType.Long
      ? `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`
      : `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
  const inputMask = useMemo(() => {
    return createNumberMask({
      allowDecimal: true,
      prefix: '',
      decimalLimit: partialTakeProfitTokenData.digits,
    })
  }, [partialTakeProfitTokenData.digits])
  const collateralTokenPrice = strategyInfo?.oracleAssetPrice.collateral || one
  const debtTokenPrice = strategyInfo?.oracleAssetPrice.debt || one
  const positionPrice =
    strategyConfig.strategyType === StrategyType.Long
      ? collateralTokenPrice.div(debtTokenPrice)
      : debtTokenPrice.div(collateralTokenPrice)
  const sidebarPreparingContent: SidebarSectionProps['content'] = (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        Set up your auto take profit price and trigger LTV. These parameters will determine when you
        withdraw assets to realize profits.
      </Text>
      <ActionPills
        items={[
          {
            id: 'debt',
            label: `Profit in ${strategyConfig.tokens.debt}`,
            action: () => setPartialTakeProfitToken('debt'),
          },
          {
            id: 'collateral',
            label: `Profit in ${strategyConfig.tokens.collateral}`,
            action: () => setPartialTakeProfitToken('collateral'),
          },
        ]}
        active={partialTakeProfitToken}
      />
      <Box
        sx={{
          padding: 3,
          borderWidth: '1px',
          borderStyle: 'solid',
          mt: 2,
          border: '1px solid',
          borderColor: isFocus ? 'neutral70' : 'neutral20',
          borderRadius: 'medium',
          transition: 'border-color 200ms',
        }}
      >
        <Text variant="boldParagraph3" color="neutral80">
          Set minimum starting take profit price
        </Text>
        <Box
          sx={{
            position: 'relative',
            variant: 'text.boldParagraph3',
            '::after': {
              position: 'absolute',
              right: '5px',
              top: '15px',
              content: `"${priceFormat}"`,
              pointerEvents: 'none',
              opacity: '0.6',
            },
          }}
        >
          <BigNumberInput
            type="text"
            mask={inputMask}
            onFocus={() => {
              setIsFocus(true)
            }}
            onBlur={() => {
              setIsFocus(false)
            }}
            value={
              inputValue
                ? `${formatAmount(inputValue, partialTakeProfitTokenData.symbol)}`
                : undefined
            }
            onChange={handleNumericInput((value) => {
              setInputValue(value!)
            })}
            sx={{
              fontSize: 5,
              border: 'none',
              pl: 0,
              transition: 'opacity 200ms',
            }}
          />
        </Box>
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          Now: {formatCryptoBalance(positionPrice)} {priceFormat}
        </Text>
      </Box>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {takeProfitStartingPercentageOptions.map((percentage) => (
          <Button
            key={percentage.toString()}
            value={percentage}
            variant="bean"
            sx={{
              color: 'neutral80',
              transition: 'color 200ms, background-color 200ms',
              '&:hover': {
                backgroundColor: 'neutral80',
                color: 'secondary60',
              },
            }}
          >
            +{formatPercent(new BigNumber(percentage).times(100))}
          </Button>
        ))}
      </Flex>
      <Divider />
      <Text variant="boldParagraph2">
        Configure Trigger Loan to Value and Loan to Value Withdrawal steps
      </Text>
      {/* <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
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
      </Text> */}
    </Grid>
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
