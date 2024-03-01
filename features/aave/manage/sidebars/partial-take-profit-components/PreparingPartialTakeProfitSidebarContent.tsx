import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { FormatPercentWithSmallPercentCharacter } from 'components/FormatPercentWithSmallPercentCharacter'
import { Icon } from 'components/Icon'
import { InfoSectionTable } from 'components/infoSection/InfoSectionTable'
import { MessageCard } from 'components/MessageCard'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import type { IStrategyConfig } from 'features/aave/types'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { hundred } from 'helpers/zero'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { question_o } from 'theme/icons'
import { Box, Button, Divider, Flex, Grid, Text } from 'theme-ui'

type PreparingPartialTakeProfitSidebarContentProps = {
  strategyConfig: IStrategyConfig
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
}

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

export const PreparingPartialTakeProfitSidebarContent = ({
  strategyConfig,
  aaveLikePartialTakeProfitParams,
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
    takeProfitStartingPercentageOptions,
    setTriggerLtv,
    triggerLtv,
    triggerLtvSliderConfig,
    withdrawalLtv,
    setWithdrawalLtv,
    withdrawalLtvSliderConfig,
  } = aaveLikePartialTakeProfitParams

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

  // useEffect(() => {
  //   if (
  //     triggerLtv.plus(withdrawalLtv).gt(withdrawalLtvSliderConfig.maxBoundry) &&
  //     !withdrawalLtv.eq(withdrawalLtvSliderConfig.maxBoundry)
  //   ) {
  //     setWithdrawalLtv(withdrawalLtvSliderConfig.maxBoundry.minus(triggerLtv))
  //   }
  //   // this *is* supposed to be triggered only when withdrawalLtv changes
  // }, [withdrawalLtv, withdrawalLtvSliderConfig.maxBoundry])

  // useEffect(() => {
  //   if (
  //     triggerLtv.plus(withdrawalLtv).gt(withdrawalLtvSliderConfig.maxBoundry) &&
  //     !withdrawalLtv.eq(withdrawalLtvSliderConfig.maxBoundry)
  //   ) {
  //     setTriggerLtv(triggerLtvSliderConfig.maxBoundry.minus(withdrawalLtv))
  //   }
  //   // this *is* supposed to be triggered only when triggerLtv changes
  // }, [triggerLtv, withdrawalLtvSliderConfig.maxBoundry])

  const getTriggerLtvMultiple = useCallback((ltv: BigNumber) => {
    const riskRatio = new RiskRatio(ltv.div(hundred), RiskRatio.TYPE.LTV)
    return `${riskRatio.multiple.toFixed(2)}x`
  }, [])

  const ltvTooHigh = useMemo(() => {
    return triggerLtv.plus(withdrawalLtv).gt(withdrawalLtvSliderConfig.maxBoundry)
  }, [triggerLtv, withdrawalLtv, withdrawalLtvSliderConfig.maxBoundry])
  const startingTakeProfitPriceTooLow = useMemo(() => {
    return startingTakeProfitPrice.lt(positionPriceRatio)
  }, [positionPriceRatio, startingTakeProfitPrice])

  return (
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
      <MessageCard
        type="error"
        messages={[
          startingTakeProfitPriceTooLow
            ? 'Starting take profit price should be higher or equal the current price.'
            : '',
        ].filter(Boolean)}
      />
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {takeProfitStartingPercentageOptions.map((percentage) => (
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
              : `+${formatPercent(new BigNumber(percentage).times(100))}`}
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
                </Text>
                <Text variant="paragraph2">
                  <FormatPercentWithSmallPercentCharacter value={x} />
                  <Text as="span" variant="paragraph4" sx={{ ml: 1, color: 'neutral80' }}>
                    {getTriggerLtvMultiple(x)}
                  </Text>
                  <Icon
                    icon={question_o}
                    size={16}
                    color="neutral80"
                    sx={{ position: 'relative', top: 1, ml: 2 }}
                  />
                </Text>
              </Flex>
            )
          }}
          rightBoundryFormatter={() => null}
          lastValue={triggerLtv}
          leftBoundry={triggerLtv}
          rightBoundry={new BigNumber(60)}
          onChange={(x) => {
            setTriggerLtv(x)
          }}
          useRcSlider
          {...triggerLtvSliderConfig}
        />
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Icon icon={question_o} size={16} color="interactive100" sx={{ mr: 1 }} />
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
            <Icon icon={question_o} size={16} color="interactive100" sx={{ ml: 1 }} />
          </Flex>
        </Flex>
      </Box>
      <Box
        sx={{
          mb: 3,
          '.rc-slider-dot': {
            backgroundColor: 'neutral70',
            borderColor: 'neutral70',
          },
          '.rc-slider-dot.rc-slider-dot-active': {
            borderColor: 'interactive50',
          },
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
                </Text>
                <Text variant="paragraph2">
                  <FormatPercentWithSmallPercentCharacter value={x} />
                  <Text as="span" variant="paragraph4" sx={{ ml: 1, color: 'neutral80' }}>
                    step amount
                  </Text>
                  <Icon
                    icon={question_o}
                    size={16}
                    color="neutral80"
                    sx={{ position: 'relative', top: 1, ml: 2 }}
                  />
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
                    sx={{
                      ...{
                        color: ltvTooHigh ? 'warning100' : undefined,
                      },
                    }}
                    value={x}
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
              [withdrawalLtvSliderConfig.maxBoundry.minus(triggerLtv).toNumber()]: ' ',
            },
          }}
        />
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}>
            <Icon icon={question_o} size={16} color="interactive100" sx={{ mr: 1 }} />
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
            <Icon icon={question_o} size={16} color="interactive100" sx={{ ml: 1 }} />
          </Flex>
        </Flex>
      </Box>
      <MessageCard
        type="error"
        messages={[
          ltvTooHigh
            ? `Trigger LTV and Withdrawal LTV sum should be less than maximum LTV (${withdrawalLtvSliderConfig.maxBoundry}%)`
            : '',
        ].filter(Boolean)}
      />
      <Divider />
      <Box sx={{ mb: 3 }}>
        <Flex sx={{ flexDirection: 'row', alignItems: 'center', mb: 3 }}>
          <Text variant="boldParagraph2">Configure Stop Loss Loan to Value</Text>
          <Icon icon={question_o} size={16} color="neutral80" sx={{ ml: 1, mt: '3px' }} />
        </Flex>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', mb: 3 }}>
          Your previously configured stop loss LTV will remain unchanged, unless edited below.
        </Text>
        <SliderValuePicker
          disabled={false}
          step={0.01}
          leftBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return formatPercent(x)
          }}
          rightBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return `${formatAmount(x, priceDenominationToken)} ${priceFormat}`
          }}
          leftLabel={'Trigger LTV'}
          rightLabel={'Dynamic stop price'}
          sliderPercentageFill={new BigNumber(50)}
          lastValue={new BigNumber(30)}
          minBoundry={new BigNumber(0)}
          maxBoundry={new BigNumber(60)}
          leftBoundry={new BigNumber(30)}
          rightBoundry={new BigNumber(60)}
          onChange={(x) => {
            console.log('x', x)
          }}
          useRcSlider
        />
      </Box>
      <Box>
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
      </Box>
    </Grid>
  )
}
