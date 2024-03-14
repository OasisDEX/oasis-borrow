import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniDoubleStopLossWarning } from 'features/omni-kit/automation/components/common/OmniDoubleStopLossWarning'
import { trailingStopLossConstants } from 'features/omni-kit/automation/constants'
import { getTrailingStopLossFormatters } from 'features/omni-kit/automation/helpers'
import { useOmniTrailingStopLossDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Text } from 'theme-ui'

export const OmniTrailingStopLossSidebarController: FC = () => {
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
    sliderStep,
    sliderMax,
    sliderMin,
    sliderPercentageFill,
    trailingDistance,
    currentTrailingDistanceValue,
    trailingDistanceValue,
    dynamicStopPriceChange,
  } = useOmniTrailingStopLossDataHandler()

  const { leftFormatter, rightFormatter } = getTrailingStopLossFormatters({
    isShort,
    collateralTokenSymbol: collateralToken,
    quoteTokenSymbol: quoteToken,
    priceFormat,
  })

  return (
    <>
      <ActionPills
        items={[
          {
            id: 'quote',
            label: t('close-to', { token: quoteToken }),
            action: () => automationUpdateState('resolveTo', 'quote'),
          },
          {
            id: 'collateral',
            label: t('close-to', { token: collateralToken }),
            action: () => automationUpdateState('resolveTo', 'collateral'),
          },
        ]}
        active={automationFormState.resolveTo || trailingStopLossConstants.defaultResolveTo}
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
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
        step={sliderStep}
        leftBoundryFormatter={leftFormatter}
        rightBoundryFormatter={rightFormatter}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={trailingDistance}
        minBoundry={sliderMin}
        maxBoundry={sliderMax.minus(sliderStep)}
        rightBoundry={dynamicStopPriceChange}
        leftBoundry={
          trailingDistanceValue.eq(zero) ? currentTrailingDistanceValue : trailingDistanceValue
        }
        onChange={(nextTrailingDistance) => {
          automationUpdateState('trailingDistance', nextTrailingDistance)
        }}
        useRcSlider
        leftLabel={t('protection.trailing-distance')}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
      <OmniDoubleStopLossWarning
        hasStopLoss={automationDynamicValues?.flags.isStopLossEnabled}
        onClick={() => {
          automationUpdateState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
        }}
      />
      <Text as="p" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {t('protection.not-guaranteed')}
      </Text>
      <Text as="p" variant="paragraph3">
        {t('protection.guarantee-factors')}{' '}
        <AppLink href={EXTERNAL_LINKS.KB.AUTOMATION} sx={{ fontWeight: 'body' }}>
          {t('protection.learn-more-about-automation')}
        </AppLink>
      </Text>
    </>
  )
}
