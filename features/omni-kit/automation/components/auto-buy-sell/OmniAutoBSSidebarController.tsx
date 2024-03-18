import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import { OmniAutomationNotGuaranteedInfo } from 'features/omni-kit/automation/components/common'
import { autoBuySellConstants } from 'features/omni-kit/automation/constants'
import { getAutoBuyAutoSellDescription } from 'features/omni-kit/automation/helpers'
import { useOmniAutoBSDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { Text } from 'theme-ui'

export const OmniAutoBSSidebarController: FC<{ type: OmniAutoBSAutomationTypes }> = ({ type }) => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, quoteToken },
  } = useOmniGeneralContext()
  const {
    automation: { automationForms },
  } = useOmniProductContext(productType)
  const {
    maxLtv,
    currentLtv,
    afterTargetLtv,
    afterTriggerLtv,
    currentExecutionLTV,
    currentTargetLTV,
    pricesDenomination,
    castedPosition,
    resolvedThresholdPrice,
  } = useOmniAutoBSDataHandler({ type })
  const defaultTriggerValues = useMemo(() => {
    return {
      triggerLtv: currentLtv.times(100).minus(5),
      targetLtv: currentLtv.times(100),
    }
  }, [currentLtv])

  const { state: automationFormState, updateState: updateFormState } = automationForms[type]

  const sliderValues = useMemo(() => {
    return {
      value0: Number(
        (
          afterTriggerLtv ||
          currentExecutionLTV?.times(100) ||
          defaultTriggerValues.triggerLtv
        ).toPrecision(2),
      ),
      value1: Number(
        (
          afterTargetLtv ||
          currentTargetLTV?.times(100) ||
          defaultTriggerValues.targetLtv
        ).toPrecision(2),
      ),
    }
  }, [afterTargetLtv, afterTriggerLtv, currentExecutionLTV, currentTargetLTV, defaultTriggerValues])

  const description = useMemo(() => {
    return getAutoBuyAutoSellDescription({
      triggerLtv: new BigNumber(sliderValues.value0),
      targetLtv: new BigNumber(sliderValues.value1),
      automationFormState,
      t,
      position: castedPosition,
      pricesDenomination,
      collateralToken,
      quoteToken,
      type,
    })
  }, [
    automationFormState,
    castedPosition,
    collateralToken,
    pricesDenomination,
    quoteToken,
    sliderValues.value0,
    sliderValues.value1,
    t,
    type,
  ])

  const maxSliderValue = useMemo(() => {
    return Number(maxLtv.times(100).toPrecision(2))
  }, [maxLtv])

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
          updateFormState('triggerLtv', new BigNumber(change.value0))
          updateFormState('targetLtv', new BigNumber(change.value1))
        }}
        value={sliderValues}
        valueColors={valueColors}
        step={0.01}
        leftDescription={sliderDescriptions.leftDescription}
        rightDescription={sliderDescriptions.rightDescription}
        {...thumbColors}
      />
      <VaultActionInput
        action={
          {
            [AutomationFeatures.AUTO_BUY]: t('auto-buy.set-max-buy-price'),
            [AutomationFeatures.AUTO_SELL]: t('auto-sell.set-min-sell-price'),
          }[type]
        }
        amount={automationFormState.price || resolvedThresholdPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode={pricesDenomination === 'collateral' ? quoteToken : collateralToken}
        onChange={handleNumericInput(curry(updateFormState)('price'))}
        onToggle={curry(updateFormState)('useThreshold')}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
        defaultToggle={automationFormState.useThreshold}
      />
      <MaxGasPriceSection
        onChange={(value) => updateFormState('maxGasFee', new BigNumber(value))}
        value={Number(automationFormState.maxGasFee) || autoBuySellConstants.defaultGasFee}
      />
      <OmniAutomationNotGuaranteedInfo />
    </>
  )
}
