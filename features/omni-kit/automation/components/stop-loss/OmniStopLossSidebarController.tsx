import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
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
        stopLoss: { updateState: automationUpdateState },
      },
    },
  } = useOmniProductContext(productType)

  const {
    displayStopLossLevel,
    isCollateralActive,
    resolvedAfterDynamicStopLossPrice,
    resolvedDynamicStopLossPrice,
    sliderMax,
    sliderMin,
    sliderPercentageFill,
    sliderStep,
  } = useOmniStopLossDataHandler()

  const { leftFormatter, rightFormatter } = getStopLossFormatters({
    isShort,
    collateralTokenSymbol: collateralToken,
    quoteTokenSymbol: quoteToken,
    priceFormat,
  })

  const activePill = isCollateralActive ? 'collateral' : 'quote'

  return (
    <>
      <ActionPills
        items={[
          {
            id: 'quote',
            label: t('close-to', { token: quoteToken }),
            action: () => {
              automationUpdateState('resolveTo', 'quote')
              // initialize other state fields to get full after state picture
              automationUpdateState('triggerLtv', displayStopLossLevel)
            },
          },
          {
            id: 'collateral',
            label: t('close-to', { token: collateralToken }),
            action: () => {
              automationUpdateState('resolveTo', 'collateral')
              // initialize other state fields to get full after state picture
              automationUpdateState('triggerLtv', displayStopLossLevel)
            },
          },
        ]}
        active={activePill}
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
        rightBoundry={resolvedAfterDynamicStopLossPrice || resolvedDynamicStopLossPrice}
        leftBoundry={displayStopLossLevel}
        onChange={(triggerLtv) => {
          automationUpdateState('triggerLtv', triggerLtv)
          automationUpdateState('resolveTo', activePill)
        }}
        leftLabel={t('protection.stop-loss-something', {
          value: t('vault-changes.loan-to-value'),
        })}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
    </>
  )
}
