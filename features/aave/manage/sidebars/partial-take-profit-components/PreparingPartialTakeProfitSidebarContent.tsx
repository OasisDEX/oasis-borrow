import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { FormatPercentWithSmallPercentCharacter } from 'components/FormatPercentWithSmallPercentCharacter'
import { Icon } from 'components/Icon'
import { InfoSectionTable } from 'components/infoSection/InfoSectionTable'
import { MessageCard } from 'components/MessageCard'
import { SidebarAccordion } from 'components/SidebarAccordion'
import { StatefulTooltip } from 'components/Tooltip'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { mapErrorsToErrorVaults, mapWarningsToWarningVaults } from 'features/aave/helpers'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import { type IStrategyConfig, StrategyType } from 'features/aave/types'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { nbsp } from 'helpers/nbsp'
import type { TriggersApiError, TriggersApiWarning } from 'helpers/triggers'
import { hundred } from 'helpers/zero'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { question_o } from 'theme/icons'
import { Box, Button, Divider, Flex, Grid, Text } from 'theme-ui'

type PreparingPartialTakeProfitSidebarContentProps = {
  strategyConfig: IStrategyConfig
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
  aaveLikePartialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
  errors?: TriggersApiError[]
  warnings?: TriggersApiWarning[]
  profits?: (string | JSX.Element)[][]
  isGettingPartialTakeProfitTx: boolean
  frontendErrors: string[]
}

export const PreparingPartialTakeProfitSidebarContent = ({
  strategyConfig,
  aaveLikePartialTakeProfitParams,
  aaveLikePartialTakeProfitLambdaData,
  errors,
  warnings,
  profits,
  isGettingPartialTakeProfitTx,
  frontendErrors,
}: PreparingPartialTakeProfitSidebarContentProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false)
  const {
    partialTakeProfitTokenData,
    priceFormat,
    priceDenominationToken,
    positionPriceRatio,
    partialTakeProfitToken,
    setPartialTakeProfitToken,
    startingTakeProfitPrice,
    setStartingTakeProfitPrice,
    customPriceRatioPercentage,
    setCustomPriceRatioPercentage,
    partialTakeProfitConfig,
    setTriggerLtv,
    triggerLtv,
    triggerLtvSliderConfig,
    withdrawalLtv,
    setWithdrawalLtv,
    withdrawalLtvSliderConfig,
    currentLtv,
    newStopLossLtv,
    setNewStopLossLtv,
    newStopLossSliderConfig,
    dynamicStopLossPriceForView,
  } = aaveLikePartialTakeProfitParams

  const { hasStopLoss, stopLossLevelLabel, trailingStopLossDistanceLabel, currentStopLossLevel } =
    aaveLikePartialTakeProfitLambdaData

  const isShort = strategyConfig.strategyType === StrategyType.Short

  const inputMask = useMemo(() => {
    return createNumberMask({
      allowDecimal: true,
      prefix: '',
      decimalLimit: partialTakeProfitTokenData.digits,
    })
  }, [partialTakeProfitTokenData.digits])

  const getPriceIncreasedByPercentage = (price: BigNumber, percentage: number) => {
    return price.plus(price.times(percentage))
  }

  useEffect(() => {
    // if the custom percentage is set, calculate the next price and update it
    if (customPriceRatioPercentage !== undefined) {
      const probableNextprice = getPriceIncreasedByPercentage(
        positionPriceRatio,
        customPriceRatioPercentage,
      )
      if (!startingTakeProfitPrice.eq(probableNextprice)) {
        setStartingTakeProfitPrice(probableNextprice)
      }
    }
  }, [
    customPriceRatioPercentage,
    positionPriceRatio,
    setStartingTakeProfitPrice,
    startingTakeProfitPrice,
  ])

  const getTriggerLtvMultiple = useCallback((ltv: BigNumber) => {
    const riskRatio = new RiskRatio(ltv.div(hundred), RiskRatio.TYPE.LTV)
    return `${riskRatio.multiple.toFixed(2)}x`
  }, [])

  return (
    <Grid
      gap={3}
      sx={{
        '.rc-slider-dot': {
          backgroundColor: 'neutral70',
          borderColor: 'neutral70',
        },
        '.rc-slider-dot.rc-slider-dot-active': {
          borderColor: 'interactive50',
        },
        '.rc-slider-mark-text': {
          opacity: 0,
          bottom: '0px',
          padding: '0px 0px 0px 0px',
          transition: 'opacity 200ms, padding 200ms',
          userSelect: 'none',
          span: {
            backgroundColor: 'white',
            borderRadius: 'medium',
            boxShadow: 'medium',
            padding: '3px 7px',
            display: 'inline-block',
            userSelect: 'none',
          },
          '&:hover': {
            opacity: 1,
            padding: '0px 0px 20px 0px',
          },
        },
      }}
    >
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        Set up your auto take profit price and trigger LTV. These parameters will determine when you
        withdraw assets to realize profits.
      </Text>
      <ActionPills
        items={[
          {
            id: 'debt',
            label: `Profit in ${strategyConfig.tokens.debt}`,
            action: () => {
              setPartialTakeProfitToken('debt')
            },
          },
          {
            id: 'collateral',
            label: `Profit in ${strategyConfig.tokens.collateral}`,
            action: () => {
              setPartialTakeProfitToken('collateral')
            },
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
          {isShort
            ? 'Set maximum starting take profit price'
            : 'Set minimum starting take profit price'}
          <StatefulTooltip
            tooltip={
              <Text variant="paragraph4">
                The first and {isShort ? 'highest' : 'lowest'} price in which you will begin to
                realize profits. The amount of profit you will realize at this price is determined
                by your Withdrawal Step, it is possible it will be triggered at its own LTV,
                distinct from your “Trigger LTV”. This {isShort ? 'maximum' : 'minimum'} starting
                price is subject to change if you make changes to your position after setting it.
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
              startingTakeProfitPrice
                ? `${formatAmount(startingTakeProfitPrice, partialTakeProfitTokenData.symbol)}`
                : undefined
            }
            onChange={handleNumericInput((value) => {
              if (value) {
                setStartingTakeProfitPrice(value)
                setCustomPriceRatioPercentage(undefined)
              }
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
          Now: {formatCryptoBalance(positionPriceRatio)} {priceFormat}
        </Text>
      </Box>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {(isShort
          ? partialTakeProfitConfig.takeProfitStartingPercentageOptionsShort
          : partialTakeProfitConfig.takeProfitStartingPercentageOptionsLong
        ).map((percentage) => (
          <Button
            key={percentage.toString()}
            variant="bean"
            sx={{
              color: 'neutral80',
              transition: 'color 200ms, background-color 200ms',
              '&:hover': {
                backgroundColor: 'neutral80',
                color: 'secondary60',
              },
              ...(customPriceRatioPercentage === percentage
                ? {
                    backgroundColor: 'neutral80',
                    color: 'secondary60',
                  }
                : {}),
            }}
            disabled={customPriceRatioPercentage === percentage}
            onClick={() => {
              setCustomPriceRatioPercentage(percentage)
            }}
          >
            {percentage === 0
              ? 'current'
              : `${isShort ? '' : '+'}${formatPercent(new BigNumber(percentage).times(100))}`}
          </Button>
        ))}
      </Flex>
      <Divider />
      <Text variant="boldParagraph2">
        Configure Trigger Loan to Value and Loan to Value Withdrawal steps
      </Text>
      <Box sx={{ mb: 3 }}>
        <SliderValuePicker
          disabled={false}
          leftBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return (
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="paragraph3" sx={{ mb: 2 }}>
                  Trigger LTV
                  <StatefulTooltip
                    tooltip={
                      <Text variant="paragraph4">
                        The LTV that once reached, it will trigger a realization of collateral or
                        debt to your wallet. It is recurring and will have dynamic trigger prices
                        that are relative to it.
                      </Text>
                    }
                    containerSx={{ display: 'inline', zIndex: 10, position: 'relative' }}
                    inline
                    tooltipSx={{ width: '350px' }}
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
                </Text>
                <Text variant="paragraph2">
                  <FormatPercentWithSmallPercentCharacter
                    value={x.div(lambdaPercentageDenomination)}
                  />
                  <Text as="span" variant="paragraph4" sx={{ ml: 1, color: 'neutral80' }}>
                    {getTriggerLtvMultiple(x)}
                  </Text>
                </Text>
              </Flex>
            )
          }}
          rightBoundryFormatter={() => null}
          lastValue={triggerLtv}
          leftBoundry={triggerLtv}
          onChange={setTriggerLtv}
          useRcSlider
          {...triggerLtvSliderConfig}
          customSliderProps={{
            marks: {
              [currentLtv.times(lambdaPercentageDenomination).toFixed()]: (
                <Text
                  variant="boldParagraph3"
                  sx={{ fontSize: '10px', textTransform: 'uppercase' }}
                >
                  Current LTV
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
              Profit at higher price
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              Profit at lower price
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
          leftBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return (
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="paragraph3" sx={{ mb: 2 }}>
                  LTV Withdrawal Step
                  <StatefulTooltip
                    tooltip={
                      <Text variant="paragraph4">
                        The chosen distance between your Trigger LTV and LTV after execution (The
                        LTV your position will be at after collateral has been withdrawn). Your
                        withdrawal step amount is 5% by default, but customizable. The larger the
                        step the more profit you will realize, the smaller the step the less profit
                        you realize.
                      </Text>
                    }
                    containerSx={{ display: 'inline', zIndex: 10, position: 'relative' }}
                    inline
                    tooltipSx={{ width: '350px' }}
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
                </Text>
                <Text variant="paragraph2">
                  <FormatPercentWithSmallPercentCharacter
                    value={x.div(lambdaPercentageDenomination)}
                  />
                  <Text as="span" variant="paragraph4" sx={{ ml: 1, color: 'neutral80' }}>
                    step amount
                  </Text>
                </Text>
              </Flex>
            )
          }}
          rightBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return (
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="paragraph3" sx={{ mb: 2 }}>
                  {' ' /** empty space so the lines match with the left boundary formatter */}
                </Text>
                <Text variant="paragraph2">
                  <Text as="span" variant="paragraph4" sx={{ mr: 1, color: 'neutral80' }}>
                    LTV after execution:
                  </Text>
                  <FormatPercentWithSmallPercentCharacter
                    value={x.div(lambdaPercentageDenomination)}
                  />
                </Text>
              </Flex>
            )
          }}
          lastValue={withdrawalLtv}
          leftBoundry={withdrawalLtv}
          rightBoundry={withdrawalLtv.plus(triggerLtv)}
          onChange={(x) => {
            setWithdrawalLtv(x)
          }}
          useRcSlider
          {...withdrawalLtvSliderConfig}
          customSliderProps={{
            marks: {
              [withdrawalLtvSliderConfig.maxBoundry.minus(triggerLtv).toNumber()]: (
                <Text
                  variant="boldParagraph3"
                  sx={{ fontSize: '10px', textTransform: 'uppercase' }}
                >
                  MAX LTV
                </Text>
              ),
            },
          }}
        />
        <VaultWarnings warningMessages={mapWarningsToWarningVaults(warnings)} />
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              Take smaller amounts
              <br />
              more often
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Text
              variant="paragraph4"
              sx={{ fontWeight: '500', color: 'interactive100', lineHeight: 1.2 }}
            >
              Take larger amounts
              <br />
              less often
            </Text>
          </Flex>
        </Flex>
      </Box>
      <MessageCard type="error" messages={frontendErrors} withBullet={frontendErrors.length > 1} />
      <VaultErrors errorMessages={mapErrorsToErrorVaults(errors)} autoType="Partial-Take-Profit" />
      <VaultWarnings warningMessages={mapWarningsToWarningVaults(warnings)} />
      <Divider />
      <SidebarAccordion
        title={
          <>
            Configure Stop-Loss Loan to Value
            <StatefulTooltip
              tooltip={
                <Text variant="paragraph4">
                  Your Stop-Loss Loan to Value is the specific debt to collateral ratio at which you
                  have specified you want to be stopped out and have your position closed. If you
                  have already setup a stop-Loss LTV, you can keep it the same or change it.
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
            Your previously configured stop-Loss LTV will remain unchanged, unless edited below.
          </Text>
        }
        openByDefault={!hasStopLoss}
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
            return `${formatAmount(x, priceDenominationToken)} ${priceFormat}`
          }}
          leftLabel={'Trigger LTV'}
          rightLabel={'Dynamic stop price'}
          lastValue={newStopLossLtv}
          leftBoundry={newStopLossLtv}
          rightBoundry={dynamicStopLossPriceForView}
          {...newStopLossSliderConfig}
          onChange={setNewStopLossLtv}
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
                        Current Stop-Loss
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
            !hasStopLoss
              ? `The Stop-Loss you configure will close your position to the same asset you have chosen to take profit in: ${partialTakeProfitToken}.`
              : '',
            hasStopLoss && stopLossLevelLabel
              ? `You already have a Stop-Loss trigger set at${nbsp}${stopLossLevelLabel}. You can update the Stop-Loss LTV above and it all be handled within your Auto Take Profit transaction.`
              : '',
            hasStopLoss && trailingStopLossDistanceLabel
              ? `You already have a Trailing Stop-Loss trigger set at${nbsp}${trailingStopLossDistanceLabel} distance.`
              : '',
            hasStopLoss && currentStopLossLevel && !currentStopLossLevel.eq(newStopLossLtv)
              ? `Your stop-Loss will be updated to a new value: ${formatPercent(newStopLossLtv, {
                  precision: 2,
                })}. Use the dot on the slider if you want to reset it.`
              : '',
          ].filter(Boolean)}
        />
      </SidebarAccordion>
      <InfoSectionTable
        withListPadding={false}
        title={
          <>
            Full realized profit range
            <StatefulTooltip
              tooltip={
                <Text variant="paragraph4">
                  Your Auto Take Profit automation run continuously. The Realized Profit Range
                  simulates and forecasts how your Auto Take Profit will perform and impact your
                  Stop-Loss based on different Trigger Prices. You can turn off Auto Take Profit at
                  any time, if you feel satisfied at specific Trigger Price.
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
        headers={['Trigger Price', 'Realized profit', 'Total profit', 'Stop-Loss']}
        rows={profits}
        loading={isGettingPartialTakeProfitTx}
        wrapperSx={{
          gridGap: 1,
          backgroundColor: 'transparent',
        }}
        defaultLimitItems={partialTakeProfitConfig.realizedProfitRangeVisible}
        expandItemsButtonLabel={
          (profits && profits.length) || isGettingPartialTakeProfitTx
            ? `See next ${
                (profits?.length || 0) - partialTakeProfitConfig.realizedProfitRangeVisible
              } price triggers`
            : ''
        }
      />
    </Grid>
  )
}
