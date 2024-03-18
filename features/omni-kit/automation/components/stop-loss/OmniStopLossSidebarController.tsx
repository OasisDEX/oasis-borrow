import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniDoubleStopLossWarning } from 'features/omni-kit/automation/components'
import { stopLossConstants } from 'features/omni-kit/automation/constants'
import { getStopLossFormatters } from 'features/omni-kit/automation/helpers'
import { useOmniStopLossDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Text } from 'theme-ui'

export const OmniStopLossSidebarController: FC = () => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat },
  } = useOmniGeneralContext()
  const {
    automation: {
      automationForms: {
        stopLoss: { state: automationFormState, updateState: automationUpdateState },
      },
      commonForm: { updateState: commonUpdateState },
    },
    dynamicMetadata: {
      values: { automation: automationDynamicValues },
    },
  } = useOmniProductContext(productType)

  const {
    resolvedAfterDynamicStopLossPrice,
    dynamicStopLossPrice,
    sliderStep,
    sliderMax,
    sliderMin,
    sliderPercentageFill,
    displayStopLossLevel,
  } = useOmniStopLossDataHandler()

  const { leftFormatter, rightFormatter } = getStopLossFormatters({
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
        active={automationFormState.resolveTo || stopLossConstants.defaultResolveTo}
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.set-downside-protection-desc', {
          ratioParam: t('vault-changes.loan-to-value'),
        })}{' '}
        <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>
      <SliderValuePicker
        step={sliderStep}
        leftBoundryFormatter={leftFormatter}
        rightBoundryFormatter={rightFormatter}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={displayStopLossLevel}
        maxBoundry={sliderMax}
        minBoundry={sliderMin}
        rightBoundry={resolvedAfterDynamicStopLossPrice || dynamicStopLossPrice?.div(100)}
        leftBoundry={displayStopLossLevel}
        onChange={(triggerLtv) => {
          automationUpdateState('triggerLtv', triggerLtv)
        }}
        leftLabel={t('protection.stop-loss-something', {
          value: t('vault-changes.loan-to-value'),
        })}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
      <OmniDoubleStopLossWarning
        hasTrailingStopLoss={automationDynamicValues?.flags.isTrailingStopLossEnabled}
        onClick={() => {
          commonUpdateState('uiDropdownProtection', AutomationFeatures.TRAILING_STOP_LOSS)
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
