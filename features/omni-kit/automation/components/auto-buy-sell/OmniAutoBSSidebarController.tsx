import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import {
  getPriceIncreasedByPercentage,
  SidebarInputWithOffsets,
} from 'components/sidebar/SidebarInputWithOffsets'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import { autoBuySellConstants } from 'features/omni-kit/automation/constants'
import { getAutoBuyAutoSellDescription } from 'features/omni-kit/automation/helpers'
import { useOmniAutoBSDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniProductType } from 'features/omni-kit/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { handleNumericInput } from 'helpers/input'
import { one } from 'helpers/zero'
import { isBoolean } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Text } from 'theme-ui'

export const OmniAutoBSSidebarController: FC<{ type: OmniAutoBSAutomationTypes }> = ({ type }) => {
  const { t } = useTranslation()
  const {
    environment: {
      productType,
      collateralToken,
      quoteToken,
      priceFormat,
      isShort,
      collateralDigits,
      quoteDigits,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position },
    },
    automation: { automationForms },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  const {
    afterTargetLtv,
    afterTriggerLtv,
    currentExecutionLtv,
    currentTargetLtv,
    pricesDenomination,
    resolvedThresholdPrice,
    resolvedTrigger,
  } = useOmniAutoBSDataHandler({ type })

  const {
    maxRiskRatio: { loanToValue: maxLoanToValue },
    riskRatio: { loanToValue },
    marketPrice,
  } = position

  const defaultTriggerValues = useMemo(() => {
    if (type === AutomationFeatures.AUTO_BUY) {
      return {
        triggerLtv: loanToValue.times(100).minus(5),
        targetLtv: loanToValue.times(100),
      }
    }
    return {
      targetLtv: loanToValue.times(100),
      triggerLtv: loanToValue.times(100).plus(5),
    }
  }, [loanToValue, type])

  const { state: automationFormState, updateState: updateFormState } = automationForms[type]

  const sliderValues = useMemo(() => {
    const triggerValue = Number(
      (
        afterTriggerLtv ||
        currentExecutionLtv?.times(100) ||
        defaultTriggerValues.triggerLtv
      ).toPrecision(2),
    )
    const targetValue = Number(
      (
        afterTargetLtv ||
        currentTargetLtv?.times(100) ||
        defaultTriggerValues.targetLtv
      ).toPrecision(2),
    )

    if (type === AutomationFeatures.AUTO_BUY) {
      return {
        value0: triggerValue,
        value1: targetValue,
      }
    }

    return {
      value0: targetValue,
      value1: triggerValue,
    }
  }, [
    afterTargetLtv,
    afterTriggerLtv,
    currentExecutionLtv,
    currentTargetLtv,
    defaultTriggerValues,
    type,
  ])

  const description = useMemo(() => {
    return getAutoBuyAutoSellDescription({
      automationFormState,
      collateralToken,
      position,
      pricesDenomination,
      quoteToken,
      t,
      triggerLtv:
        type === AutomationFeatures.AUTO_BUY
          ? new BigNumber(sliderValues.value0)
          : new BigNumber(sliderValues.value1),
      targetLtv:
        type === AutomationFeatures.AUTO_BUY
          ? new BigNumber(sliderValues.value1)
          : new BigNumber(sliderValues.value0),
      type,
    })
  }, [
    automationFormState,
    collateralToken,
    position,
    pricesDenomination,
    quoteToken,
    sliderValues.value0,
    sliderValues.value1,
    t,
    type,
  ])

  const maxSliderValue = useMemo(() => {
    return Number(maxLoanToValue.times(100).toPrecision(2))
  }, [maxLoanToValue])

  const sliderDescriptions = useMemo(() => {
    return {
      [AutomationFeatures.AUTO_BUY]: {
        leftDescription: t('auto-buy.trigger-ltv'),
        rightDescription: t('auto-buy.target-ltv'),
      },
      [AutomationFeatures.AUTO_SELL]: {
        leftDescription: t('auto-sell.target-ltv'),
        rightDescription: t('auto-sell.trigger-ltv'),
      },
    }[type]
  }, [t, type])

  const valueColors = {
    [AutomationFeatures.AUTO_BUY]: {
      value0: 'primary100',
      value1: 'success100',
    },
    [AutomationFeatures.AUTO_SELL]: {
      value0: 'success100',
      value1: 'primary100',
    },
  }[type]

  const thumbColors = {
    [AutomationFeatures.AUTO_BUY]: {
      leftThumbColor: 'primary100',
      rightThumbColor: 'success100',
    },
    [AutomationFeatures.AUTO_SELL]: {
      leftThumbColor: 'success100',
      rightThumbColor: 'primary100',
    },
  }[type]

  const defaultPrice =
    isBoolean(automationFormState.useThreshold) && !automationFormState.useThreshold
      ? undefined
      : automationFormState.price || resolvedThresholdPrice

  const defaultToggle = isBoolean(automationFormState.useThreshold)
    ? automationFormState.useThreshold
    : resolvedTrigger && !resolvedThresholdPrice
      ? false
      : autoBuySellConstants.defaultToggle

  const resolveSliderDefaultUpdate = ({ value0, value1 }: { value0: number; value1: number }) => {
    if (type === AutomationFeatures.AUTO_BUY) {
      updateFormState('triggerLtv', new BigNumber(value0))
      updateFormState('targetLtv', new BigNumber(value1))
    }
    if (type === AutomationFeatures.AUTO_SELL) {
      updateFormState('targetLtv', new BigNumber(value0))
      updateFormState('triggerLtv', new BigNumber(value1))
    }
  }

  const defaultMaxGasFee = new BigNumber(
    automationFormState.maxGasFee || autoBuySellConstants.defaultGasFee,
  )

  const positionPriceRatio = isShort ? one.div(marketPrice) : marketPrice

  const inputMask = createNumberMask({
    allowDecimal: true,
    prefix: '',
    decimalLimit: Math.max(collateralDigits, quoteDigits),
  })

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {description}{' '}
        <AppLink
          href={
            {
              [AutomationFeatures.AUTO_BUY]: EXTERNAL_LINKS.KB.SETTING_AUTO_BUY,
              [AutomationFeatures.AUTO_SELL]: EXTERNAL_LINKS.KB.SETTING_AUTO_SELL,
            }[type]
          }
          sx={{ fontSize: 2 }}
        >
          {t('here')}.
        </AppLink>
      </Text>{' '}
      <MultipleRangeSlider
        min={1}
        max={maxSliderValue}
        onChange={(change) => {
          updateFormState('price', defaultPrice)
          updateFormState('maxGasFee', defaultMaxGasFee)
          resolveSliderDefaultUpdate({ value0: change.value0, value1: change.value1 })
        }}
        value={sliderValues}
        valueColors={valueColors}
        step={0.01}
        leftDescription={sliderDescriptions.leftDescription}
        rightDescription={sliderDescriptions.rightDescription}
        otherDependencies={[defaultPrice?.toString(), defaultMaxGasFee.toString()]}
        {...thumbColors}
      />
      <SidebarInputWithOffsets
        useNegativeOffset={type === AutomationFeatures.AUTO_SELL}
        priceFormat={priceFormat}
        positionPriceRatio={positionPriceRatio}
        inputMask={inputMask}
        inputValue={defaultPrice === undefined ? '' : defaultPrice?.toString()}
        label={
          {
            [AutomationFeatures.AUTO_BUY]: t('auto-buy.set-max-buy-price'),
            [AutomationFeatures.AUTO_SELL]: t('auto-sell.set-min-sell-price'),
          }[type]
        }
        updateInputValue={handleNumericInput((price) => {
          updateFormState('price', price)
          updateFormState('maxGasFee', defaultMaxGasFee)
          resolveSliderDefaultUpdate({ value0: sliderValues.value0, value1: sliderValues.value1 })
        })}
        updateOffset={(percentage) => {
          updateFormState('percentageOffset', percentage)

          updateFormState(
            'price',
            getPriceIncreasedByPercentage(positionPriceRatio, percentage?.toNumber() || 0),
          )
          updateFormState('maxGasFee', defaultMaxGasFee)
          resolveSliderDefaultUpdate({ value0: sliderValues.value0, value1: sliderValues.value1 })
        }}
        percentageOffset={automationFormState.percentageOffset}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
        defaultToggle={defaultToggle}
        onToggle={(flag) => {
          updateFormState('useThreshold', flag)
          if (!flag) {
            updateFormState('price', undefined)
          } else {
            updateFormState('price', defaultPrice)
          }

          updateFormState('percentageOffset', undefined)
          updateFormState('maxGasFee', defaultMaxGasFee)
          resolveSliderDefaultUpdate({ value0: sliderValues.value0, value1: sliderValues.value1 })
        }}
      />
      <MaxGasPriceSection
        onChange={(value) => {
          updateFormState('maxGasFee', new BigNumber(value))
          updateFormState('price', defaultPrice)
          resolveSliderDefaultUpdate({ value0: sliderValues.value0, value1: sliderValues.value1 })
        }}
        value={defaultMaxGasFee.toNumber()}
      />
    </>
  )
}
