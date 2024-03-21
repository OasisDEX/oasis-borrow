import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { getTrailingStopLossFormatters } from 'features/omni-kit/automation/helpers'
import { useOmniTrailingStopLossDataHandler } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
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
      automationForms: {
        trailingStopLoss: { updateState },
      },
    },
  } = useOmniProductContext(productType)

  const {
    sliderStep,
    sliderMax,
    sliderMin,
    sliderPercentageFill,
    trailingDistance,
    dynamicStopPriceChange,
    trailingDistanceForTx,
    isCollateralActive,
  } = useOmniTrailingStopLossDataHandler()

  const { leftFormatter, rightFormatter } = getTrailingStopLossFormatters({
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
              updateState('resolveTo', 'quote')
              // initialize other state fields to get full after state picture
              updateState('price', trailingDistance)
              updateState('trailingDistance', sliderMax.minus(trailingDistance))
            },
          },
          {
            id: 'collateral',
            label: t('close-to', { token: collateralToken }),
            action: () => {
              updateState('resolveTo', 'collateral')
              // initialize other state fields to get full after state picture
              updateState('price', trailingDistance)
              updateState('trailingDistance', sliderMax.minus(trailingDistance))
            },
          },
        ]}
        active={activePill}
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
        leftBoundry={trailingDistanceForTx}
        onChange={(nextTrailingDistance) => {
          updateState('price', nextTrailingDistance)
          updateState('trailingDistance', sliderMax.minus(nextTrailingDistance))
        }}
        useRcSlider
        leftLabel={t('protection.trailing-distance')}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
    </>
  )
}
