import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { FormatPercentWithSmallPercentCharacter } from 'components/FormatPercentWithSmallPercentCharacter'
import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { partialTakeProfitConstants } from 'features/omni-kit/automation/constants'
import { useOmniPartialTakeProfitDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { hundred, zero } from 'helpers/zero'
import { curry } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createNumberMask } from 'text-mask-addons'
import { question_o } from 'theme/icons'
import { Box, Button, Divider, Flex, Grid, Text } from 'theme-ui'

type PercentageOptionsType =
  | typeof partialTakeProfitConstants.startingPercentageOptionsLong
  | typeof partialTakeProfitConstants.startingPercentageOptionsShort

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
      automationForm: { state: automationFormState, updateState: automationUpdateState },
    },
    dynamicMetadata: {
      values: { automation: automationDynamicValues },
    },
  } = useOmniProductContext(productType)

  const {
    startingTakeProfitPrice,
    partialTakeProfitToken,
    positionPriceRatio,
    resolvedTriggerLtv,
    triggerLtvSliderConfig,
    withdrawalLtvSliderConfig,
    castedPosition,
    resolvedWithdrawalLtv,
  } = useOmniPartialTakeProfitDataHandler()

  const [isFocus, setStartingPriceInputFocus] = useState<boolean>(false)
  const [customPriceRatioPercentage, setCustomPriceRatioPercentage] = useState<
    PercentageOptionsType[number] | undefined
  >(0)

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
    return automationFormState.triggerLtv || resolvedTriggerLtv || zero
  }, [automationFormState.triggerLtv, resolvedTriggerLtv])

  const targetLtvValue = useMemo(() => {
    return automationFormState.targetLtv || resolvedWithdrawalLtv || zero
  }, [automationFormState.targetLtv, resolvedWithdrawalLtv])

  const getTriggerLtvMultiple = useCallback((ltv: BigNumber) => {
    const riskRatio = new RiskRatio(ltv.div(hundred), RiskRatio.TYPE.LTV)
    return `${riskRatio.multiple.toFixed(2)}x`
  }, [])

  useEffect(() => {
    // if the custom percentage is set, calculate the next price and update it
    if (customPriceRatioPercentage !== undefined) {
      const probableNextprice = getPriceIncreasedByPercentage(
        positionPriceRatio,
        customPriceRatioPercentage,
      )
      if (!startingTakeProfitPriceValue.eq(probableNextprice)) {
        automationUpdateState('price', probableNextprice)
      }
    }
  }, [
    automationUpdateState,
    customPriceRatioPercentage,
    positionPriceRatio,
    startingTakeProfitPriceValue,
  ])

  return (
    <Grid gap={3} sx={partialTakeProfitConstants.wrapperSx}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.partial-take-profit-sidebar.main-description')}
      </Text>
      <ActionPills
        items={[
          {
            id: 'quote',
            label: t('protection.partial-take-profit-sidebar.profit-in', { token: quoteToken }),
            action: () => automationUpdateState('resolveTo', 'quote'),
          },
          {
            id: 'collateral',
            label: t('protection.partial-take-profit-sidebar.profit-in', {
              token: collateralToken,
            }),
            action: () => automationUpdateState('resolveTo', 'collateral'),
          },
        ]}
        active={
          automationFormState.resolveTo ||
          partialTakeProfitToken ||
          partialTakeProfitConstants.defaultResolveTo
        }
      />
      <Box
        sx={{
          padding: 3,
          borderWidth: '1px',
          borderStyle: 'solid',
          mt: 2,
          border: '1px solid',
          borderRadius: 'medium',
          transition: 'border-color 200ms',
          borderColor: isFocus ? 'neutral70' : 'neutral20',
        }}
      >
        <Text variant="boldParagraph3" color="neutral80">
          {isShort
            ? t('protection.partial-take-profit-sidebar.set-maximum-take-profit-price')
            : t('protection.partial-take-profit-sidebar.set-minimum-take-profit-price')}
          <StatefulTooltip
            tooltip={
              <Text variant="paragraph4">
                {isShort
                  ? t('protection.partial-take-profit-sidebar.tooltips.take-profit-price-highest')
                  : t('protection.partial-take-profit-sidebar.tooltips.take-profit-price-lowest')}
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
              setStartingPriceInputFocus(true)
            }}
            onBlur={() => {
              setStartingPriceInputFocus(false)
            }}
            value={`${formatCryptoBalance(startingTakeProfitPriceValue)}`}
            onChange={handleNumericInput((value) => {
              if (value) {
                automationUpdateState('price', value)
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
          ? partialTakeProfitConstants.startingPercentageOptionsShort
          : partialTakeProfitConstants.startingPercentageOptionsLong
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
        {t('protection.partial-take-profit-sidebar.configure-trigger-loan-to-value')}
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
                  {t('protection.partial-take-profit-sidebar.trigger-ltv')}
                  <StatefulTooltip
                    tooltip={
                      <Text variant="paragraph4">
                        {t('protection.partial-take-profit-sidebar.tooltips.trigger-ltv-tooltip')}
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
          lastValue={triggerLtvValue}
          leftBoundry={triggerLtvValue}
          onChange={curry(automationUpdateState)('triggerLtv')}
          useRcSlider
          {...triggerLtvSliderConfig}
          customSliderProps={{
            marks: {
              [castedPosition.riskRatio.loanToValue.times(lambdaPercentageDenomination).toFixed()]:
                (
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
          leftBoundryFormatter={(x) => {
            if (x.isZero()) {
              return '-'
            }
            return (
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="paragraph3" sx={{ mb: 2 }}>
                  {t('protection.partial-take-profit-sidebar.ltv-withdrawal-step')}
                  <StatefulTooltip
                    tooltip={
                      <Text variant="paragraph4">
                        {t('protection.partial-take-profit-sidebar.tooltips.withdrawal-step')}
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
                    {t('protection.partial-take-profit-sidebar.step-amount')}
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
                    {t('protection.partial-take-profit-sidebar.ltv-after-execution')}
                  </Text>
                  <FormatPercentWithSmallPercentCharacter
                    value={x.div(lambdaPercentageDenomination)}
                  />
                </Text>
              </Flex>
            )
          }}
          lastValue={targetLtvValue}
          leftBoundry={targetLtvValue}
          rightBoundry={targetLtvValue.plus(triggerLtvValue)}
          onChange={curry(automationUpdateState)('targetLtv')}
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
    </Grid>
  )
}
