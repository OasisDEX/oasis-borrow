import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { FormatPercentWithSmallPercentCharacter } from 'components/FormatPercentWithSmallPercentCharacter'
import { Icon } from 'components/Icon'
import { InfoSectionTable } from 'components/infoSection/InfoSectionTable'
import { MessageCard } from 'components/MessageCard'
import { SidebarInputWithOffsets } from 'components/sidebar/SidebarInputWithOffsets'
import { SidebarAccordion } from 'components/SidebarAccordion'
import { StatefulTooltip } from 'components/Tooltip'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { partialTakeProfitConfig } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import { mapProfits } from 'features/aave/open/helpers/use-lambda-debounced-partial-take-profit'
import {
  OmniPartialTakeProfitLtvStepSliderLeftBoundary,
  OmniPartialTakeProfitLtvStepSliderRightBoundary,
  OmniPartialTakeProfitTriggerLtvSliderLeftBoundary,
} from 'features/omni-kit/automation/components/partial-take-profit'
import { partialTakeProfitConstants } from 'features/omni-kit/automation/constants'
import { useOmniPartialTakeProfitDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniProductType } from 'features/omni-kit/types'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import type { SetupPartialTakeProfitResponse } from 'helpers/lambda/triggers'
import { nbsp } from 'helpers/nbsp'
import { hundred, one, zero } from 'helpers/zero'
import { curry } from 'ramda'
import React, { useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { createNumberMask } from 'text-mask-addons'
import { question_o } from 'theme/icons'
import { Box, Divider, Flex, Grid, Text } from 'theme-ui'

const getPriceIncreasedByPercentage = (price: BigNumber, percentage: number) => {
  return price.plus(price.times(percentage))
}

export const OmniPartialTakeProfitSidebarController = () => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat },
  } = useOmniGeneralContext()
  const {
    automation: {
      isSimulationLoading,
      automationForms: {
        partialTakeProfit: { state: automationFormState, updateState: automationUpdateState },
      },
    },
    dynamicMetadata: {
      values: { automation },
    },
    position: {
      currentPosition: {
        position: {
          marketPrice,
          riskRatio: { loanToValue },
        },
      },
    },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  // TODO: better type this
  const partialTakeProfitSimulation =
    automation.simulation as SetupPartialTakeProfitResponse['simulation']

  const {
    currentStopLossLevel,
    dynamicStopLossPrice,
    extraTriggerLtv,
    hasStopLoss,
    hasTrailingStopLoss,
    newStopLossSliderConfig,
    partialTakeProfitSecondTokenData,
    partialTakeProfitToken,
    partialTakeProfitTokenData,
    resolvedTriggerLtv,
    resolvedWithdrawalLtv,
    selectedPartialTakeProfitToken,
    startingTakeProfitPrice,
    stopLossLevelLabel,
    trailingStopLossDistanceLabel,
    triggerLtvSliderConfig,
    withdrawalLtvSliderConfig,
  } = useOmniPartialTakeProfitDataHandler()

  const inputMask = useMemo(() => {
    const selectedResolveToTokenData = getToken(
      automationFormState.resolveTo === 'collateral' ? collateralToken : quoteToken,
    )
    return createNumberMask({
      allowDecimal: true,
      prefix: '',
      decimalLimit: selectedResolveToTokenData.digits,
    })
  }, [automationFormState.resolveTo, collateralToken, quoteToken])

  const startingTakeProfitPriceValue = useMemo(() => {
    return automationFormState.price || startingTakeProfitPrice || zero
  }, [automationFormState.price, startingTakeProfitPrice])

  const triggerLtvValue = useMemo(() => {
    return (
      automationFormState.triggerLtv ||
      resolvedTriggerLtv?.times(100) ||
      loanToValue
        .minus(partialTakeProfitConfig.defaultTriggelLtvOffset.div(100))
        .times(100)
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
    )
  }, [automationFormState.triggerLtv, resolvedTriggerLtv])

  const targetLtvValue = useMemo(() => {
    return (
      automationFormState.ltvStep ||
      resolvedWithdrawalLtv?.times(100) ||
      partialTakeProfitConfig.defaultWithdrawalLtv
    )
  }, [automationFormState.ltvStep, resolvedWithdrawalLtv])

  const getTriggerLtvMultiple = useCallback((ltv: BigNumber) => {
    const riskRatio = new RiskRatio(ltv.div(hundred), RiskRatio.TYPE.LTV)
    return `${riskRatio.multiple.toFixed(2)}x`
  }, [])
  const positionPriceRatio = isShort ? one.div(marketPrice) : marketPrice

  const parsedProfits = useMemo(() => {
    return mapProfits(partialTakeProfitSimulation, isShort).map((profit) => {
      const isSelectedTokenDebt = selectedPartialTakeProfitToken === 'quote'
      const selectedTokenSymbol = partialTakeProfitTokenData.symbol
      const selectedSecondaryTokenSymbol = partialTakeProfitSecondTokenData.symbol
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
        `${formatAmount(new BigNumber(profit.triggerPrice), selectedTokenSymbol)} ${priceFormat}`,
        // Realized profit
        <Flex sx={{ flexDirection: 'column', textAlign: 'right' }}>
          <Text variant="paragraph4" color="neutral80" sx={{ fontSize: '11px' }}>
            {`${formatAmount(
              new BigNumber(realizedProfitValue.balance),
              selectedTokenSymbol,
            )} ${selectedTokenSymbol}`}
          </Text>
        </Flex>,
        // Total profit
        <Flex sx={{ flexDirection: 'column', textAlign: 'right' }}>
          <Text variant="paragraph4" color="neutral100" sx={{ fontSize: '11px' }}>
            {`${formatAmount(
              new BigNumber(totalProfitValue.balance),
              selectedTokenSymbol,
            )} ${selectedTokenSymbol}`}
          </Text>
          <Text variant="paragraph4" sx={{ fontSize: '11px', mt: '-5px' }} color="neutral80">
            {`${formatAmount(
              new BigNumber(totalProfitSecondValue.balance),
              selectedSecondaryTokenSymbol,
            )} ${selectedSecondaryTokenSymbol}`}
          </Text>
        </Flex>,
        // Stop loss
        `${formatAmount(
          new BigNumber(profit.stopLossDynamicPrice),
          selectedTokenSymbol,
        )} ${priceFormat}`,
      ]
    })
  }, [
    partialTakeProfitSimulation,
    selectedPartialTakeProfitToken,
    partialTakeProfitTokenData.symbol,
    partialTakeProfitSecondTokenData.symbol,
    priceFormat,
  ])

  const resolveDefaultUpdate = () => {
    automationUpdateState('price', startingTakeProfitPriceValue)
    automationUpdateState('triggerLtv', triggerLtvValue)
    automationUpdateState('ltvStep', targetLtvValue)
    !hasTrailingStopLoss && automationUpdateState('extraTriggerLtv', extraTriggerLtv)
  }

  return (
    <Grid gap={3} sx={partialTakeProfitConstants.wrapperSx}>
      <ActionPills
        items={[
          {
            id: 'quote',
            label: t('protection.partial-take-profit-sidebar.profit-in', { token: quoteToken }),
            action: () => {
              automationUpdateState('resolveTo', 'quote')
              resolveDefaultUpdate()
            },
          },
          {
            id: 'collateral',
            label: t('protection.partial-take-profit-sidebar.profit-in', {
              token: collateralToken,
            }),
            action: () => {
              automationUpdateState('resolveTo', 'collateral')
              resolveDefaultUpdate()
            },
          },
        ]}
        active={selectedPartialTakeProfitToken}
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.partial-take-profit-sidebar.main-description')}
      </Text>
      <SidebarInputWithOffsets
        label={
          isShort
            ? t('protection.partial-take-profit-sidebar.set-maximum-take-profit-price')
            : t('protection.partial-take-profit-sidebar.set-minimum-take-profit-price')
        }
        tooltip={
          isShort
            ? t('protection.partial-take-profit-sidebar.tooltips.take-profit-price-highest')
            : t('protection.partial-take-profit-sidebar.tooltips.take-profit-price-lowest')
        }
        useNegativeOffset={isShort}
        priceFormat={priceFormat}
        positionPriceRatio={positionPriceRatio}
        inputMask={inputMask}
        inputValue={startingTakeProfitPriceValue.toString()}
        updateInputValue={handleNumericInput((value) => {
          if (value) {
            automationUpdateState('price', value)
            // Initialize state
            automationUpdateState('resolveTo', selectedPartialTakeProfitToken)
            automationUpdateState('triggerLtv', triggerLtvValue)
            automationUpdateState('ltvStep', targetLtvValue)
            automationUpdateState('percentageOffset', undefined)
            !hasTrailingStopLoss && automationUpdateState('extraTriggerLtv', extraTriggerLtv)
          }
        })}
        updateOffset={(percentage) => {
          automationUpdateState('percentageOffset', percentage)

          automationUpdateState(
            'price',
            getPriceIncreasedByPercentage(positionPriceRatio, percentage?.toNumber() || 0),
          )
          automationUpdateState('triggerLtv', triggerLtvValue)
          automationUpdateState('ltvStep', targetLtvValue)
          !hasTrailingStopLoss && automationUpdateState('extraTriggerLtv', extraTriggerLtv)
        }}
        percentageOffset={automationFormState.percentageOffset}
      />
      <Divider />
      <Text variant="boldParagraph2">
        {t('protection.partial-take-profit-sidebar.configure-trigger-loan-to-value')}
      </Text>
      <Box sx={{ mb: 3 }}>
        <SliderValuePicker
          disabled={false}
          leftBoundryFormatter={(x) => (
            <OmniPartialTakeProfitTriggerLtvSliderLeftBoundary
              value={x}
              maxMultiple={getTriggerLtvMultiple(x)}
            />
          )}
          rightBoundryFormatter={() => null}
          lastValue={triggerLtvValue}
          leftBoundry={triggerLtvValue}
          onChange={(triggerLtv) => {
            automationUpdateState('triggerLtv', triggerLtv)
            // Initialize state
            automationUpdateState('price', startingTakeProfitPriceValue)
            automationUpdateState('resolveTo', selectedPartialTakeProfitToken)
            automationUpdateState('ltvStep', targetLtvValue)
            !hasTrailingStopLoss && automationUpdateState('extraTriggerLtv', extraTriggerLtv)
          }}
          useRcSlider
          {...triggerLtvSliderConfig}
          customSliderProps={{
            marks: {
              [loanToValue.times(lambdaPercentageDenomination).toFixed()]: (
                <Text
                  variant="boldParagraph3"
                  sx={{ fontSize: '10px', textTransform: 'uppercase' }}
                >
                  {t('protection.partial-take-profit-sidebar.current-ltv')}
                </Text>
              ),
            },
          }}
        />
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              {t('protection.partial-take-profit-sidebar.profit-at-higher-price')}
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              {t('protection.partial-take-profit-sidebar.profit-at-lower-price')}
            </Text>
          </Flex>
        </Flex>
      </Box>
      <Box
        sx={{
          mb: 3,
        }}
      >
        <SliderValuePicker
          disabled={false}
          leftBoundryFormatter={(x) => <OmniPartialTakeProfitLtvStepSliderLeftBoundary value={x} />}
          rightBoundryFormatter={(x) => (
            <OmniPartialTakeProfitLtvStepSliderRightBoundary value={x} />
          )}
          lastValue={targetLtvValue}
          leftBoundry={targetLtvValue}
          rightBoundry={targetLtvValue.plus(triggerLtvValue)}
          onChange={(ltvStep) => {
            automationUpdateState('ltvStep', ltvStep)

            // Initialize state
            automationUpdateState('price', startingTakeProfitPriceValue)
            automationUpdateState('resolveTo', selectedPartialTakeProfitToken)
            automationUpdateState('triggerLtv', triggerLtvValue)
            !hasTrailingStopLoss && automationUpdateState('extraTriggerLtv', extraTriggerLtv)
          }}
          useRcSlider
          {...withdrawalLtvSliderConfig}
          customSliderProps={{
            marks: {
              [withdrawalLtvSliderConfig.maxBoundry.minus(triggerLtvValue).toNumber()]: (
                <Text
                  variant="boldParagraph3"
                  sx={{ fontSize: '10px', textTransform: 'uppercase' }}
                >
                  {t('protection.partial-take-profit-sidebar.max-ltv')}
                </Text>
              ),
            },
          }}
        />
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              {t('protection.partial-take-profit-sidebar.take-smaller-amounts')}
              <br />
              {t('protection.partial-take-profit-sidebar.more-often')}
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              {t('protection.partial-take-profit-sidebar.take-larger-amounts')}
              <br />
              {t('protection.partial-take-profit-sidebar.less-often')}
            </Text>
          </Flex>
        </Flex>
      </Box>
      <SidebarAccordion
        isDisabled={automation.resolved.isFormEmpty || hasTrailingStopLoss}
        title={
          <>
            {t('protection.partial-take-profit-sidebar.configure-stop-loss-loan-to-value')}
            <StatefulTooltip
              tooltip={
                <Text variant="paragraph4">
                  {t('protection.partial-take-profit-sidebar.tooltips.stop-loss-ltv')}
                </Text>
              }
              containerSx={{ display: 'inline' }}
              inline
              tooltipSx={{ maxWidth: '350px' }}
            >
              <Icon
                color={'neutral80'}
                icon={question_o}
                size="auto"
                width="14px"
                height="14px"
                sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
              />
            </StatefulTooltip>
          </>
        }
        additionalDescriptionComponent={
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', mb: 3 }}>
            {t('protection.partial-take-profit-sidebar.stop-loss-info')}
          </Text>
        }
        openByDefault={!hasStopLoss || !hasTrailingStopLoss}
      >
        <SliderValuePicker
          disabled={!!hasStopLoss && !!trailingStopLossDistanceLabel}
          leftBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return (
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="paragraph2">
                  <FormatPercentWithSmallPercentCharacter
                    value={x.div(lambdaPercentageDenomination)}
                  />
                </Text>
              </Flex>
            )
          }}
          rightBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return `${formatCryptoBalance(x)} ${priceFormat}`
          }}
          leftLabel={t('protection.partial-take-profit-sidebar.trigger-ltv')}
          rightLabel={t('slider.set-stoploss.right-label')}
          lastValue={extraTriggerLtv}
          leftBoundry={extraTriggerLtv}
          rightBoundry={isShort ? one.div(dynamicStopLossPrice) : dynamicStopLossPrice}
          {...newStopLossSliderConfig}
          onChange={curry(automationUpdateState)('extraTriggerLtv')}
          useRcSlider
          customSliderProps={
            currentStopLossLevel
              ? {
                  marks: {
                    [currentStopLossLevel.toNumber()]: (
                      <Text
                        variant="boldParagraph3"
                        sx={{ fontSize: '10px', textTransform: 'uppercase' }}
                      >
                        {t('protection.partial-take-profit-sidebar.current-stop-loss')}
                      </Text>
                    ),
                  },
                }
              : {}
          }
        />
        <MessageCard
          sx={{ mt: 3 }}
          type="ok"
          withBullet={false}
          messages={[
            !hasStopLoss && !hasTrailingStopLoss ? (
              <Trans
                i18nKey="protection.partial-take-profit-sidebar.stop-loss-messages.no-stop-loss"
                values={{
                  partialTakeProfitToken,
                }}
              />
            ) : (
              ''
            ),
            hasStopLoss && stopLossLevelLabel ? (
              <Trans
                i18nKey="protection.partial-take-profit-sidebar.stop-loss-messages.has-stop-loss"
                values={{
                  nbsp,
                  stopLossLevelLabel,
                }}
              />
            ) : (
              ''
            ),
            hasTrailingStopLoss && trailingStopLossDistanceLabel ? (
              <Trans
                i18nKey="protection.partial-take-profit-sidebar.stop-loss-messages.has-trailing-stop-loss"
                values={{
                  nbsp,
                  trailingStopLossDistanceLabel,
                }}
              />
            ) : (
              ''
            ),
            hasStopLoss && currentStopLossLevel && !currentStopLossLevel.eq(extraTriggerLtv) ? (
              <Trans
                i18nKey="protection.partial-take-profit-sidebar.stop-loss-messages.new-stop-loss"
                values={{
                  newStopLossValue: formatPercent(extraTriggerLtv, {
                    precision: 2,
                  }),
                }}
              />
            ) : (
              ''
            ),
          ].filter(Boolean)}
        />
      </SidebarAccordion>
      <InfoSectionTable
        withListPadding={false}
        title={
          <>
            {t('protection.partial-take-profit-sidebar.profits-table.full-realized-profit-range')}
            <StatefulTooltip
              tooltip={
                <Text variant="paragraph4">
                  {t('protection.partial-take-profit-sidebar.profits-table.tooltip')}
                </Text>
              }
              containerSx={{ display: 'inline' }}
              inline
              tooltipSx={{ maxWidth: '350px' }}
            >
              <Icon
                color={'neutral80'}
                icon={question_o}
                size="auto"
                width="14px"
                height="14px"
                sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
              />
            </StatefulTooltip>
          </>
        }
        headers={[
          t('protection.partial-take-profit-sidebar.profits-table.trigger-price'),
          t('protection.partial-take-profit-sidebar.profits-table.realized-profit'),
          t('protection.partial-take-profit-sidebar.profits-table.total-profit'),
          t('protection.partial-take-profit-sidebar.profits-table.stop-loss'),
        ]}
        rows={isSimulationLoading ? [] : parsedProfits}
        loading={!parsedProfits || isSimulationLoading}
        wrapperSx={{
          gridGap: 1,
          backgroundColor: 'transparent',
        }}
        defaultLimitItems={partialTakeProfitConstants.realizedProfitRangeVisible}
        expandItemsButtonLabel={
          (parsedProfits && parsedProfits.length) || !parsedProfits
            ? `See next ${
                (parsedProfits?.length || 0) - partialTakeProfitConstants.realizedProfitRangeVisible
              } price triggers`
            : ''
        }
      />
    </Grid>
  )
}
