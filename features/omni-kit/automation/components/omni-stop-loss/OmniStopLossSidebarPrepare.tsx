import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { ActionPills } from 'components/ActionPills'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getDynamicStopLossPrice,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { OmniDoubleStopLossWarning } from 'features/omni-kit/automation/components'
import { stopLossConstants } from 'features/omni-kit/automation/constants'
import { getStopLossFormatters } from 'features/omni-kit/automation/helpers'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { Text } from 'theme-ui'

export const OmniStopLossSidebarPrepare: FC = () => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat },
  } = useOmniGeneralContext()
  const {
    automation: {
      automationForm: { state: automationFormState, updateState: automationUpdateState },
      positionTriggers: {
        triggers: { aaveTrailingStopLossDMA, sparkTrailingStopLossDMA },
      },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  const { riskRatio, category, debtAmount, collateralAmount } = position as AaveLikePositionV2

  const positionLtv = riskRatio.loanToValue
  const liquidationRatio = category.liquidationThreshold
  const defaultStopLossLevel = category.maxLoanToValue
    .minus(stopLossConstants.offsets.manage.max)
    .times(100)

  const stopLossLevel = automationFormState.triggerLtv || defaultStopLossLevel
  const sliderMin = useMemo(
    () => positionLtv.plus(stopLossConstants.offsets.manage.min).times(100),
    [positionLtv],
  )
  const sliderMax = useMemo(
    () => liquidationRatio.minus(stopLossConstants.offsets.manage.max).times(100),
    [liquidationRatio],
  )

  const sliderPercentageFill = useMemo(
    () =>
      getSliderPercentageFill({
        min: sliderMin,
        max: sliderMax,
        value: stopLossLevel,
      }),
    [sliderMax, sliderMin, stopLossLevel],
  )
  const liquidationPrice = useMemo(
    () => debtAmount.div(collateralAmount.times(liquidationRatio)) || zero,
    [collateralAmount, debtAmount, liquidationRatio],
  )
  const dynamicStopLossPrice = useMemo(
    () =>
      getDynamicStopLossPrice({
        liquidationPrice,
        liquidationRatio: one.div(liquidationRatio),
        stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
      }),
    [liquidationPrice, liquidationRatio, stopLossLevel],
  )
  const dynamicStopLossPriceForView = useMemo(
    () => (isShort ? one.div(dynamicStopLossPrice) : dynamicStopLossPrice),
    [dynamicStopLossPrice, isShort],
  )

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
        step={stopLossConstants.sliderStep}
        leftBoundryFormatter={leftFormatter}
        rightBoundryFormatter={rightFormatter}
        sliderPercentageFill={sliderPercentageFill}
        lastValue={stopLossLevel}
        maxBoundry={sliderMax}
        minBoundry={sliderMin}
        rightBoundry={dynamicStopLossPriceForView}
        leftBoundry={stopLossLevel}
        onChange={curry(automationUpdateState)('triggerLtv')}
        leftLabel={t('protection.stop-loss-something', {
          value: t('vault-changes.loan-to-value'),
        })}
        rightLabel={t('slider.set-stoploss.right-label')}
      />
      <OmniDoubleStopLossWarning
        hasTrailingStopLoss={isAnyValueDefined(aaveTrailingStopLossDMA, sparkTrailingStopLossDMA)}
        onClick={() => {
          automationUpdateState('uiDropdownProtection', AutomationFeatures.TRAILING_STOP_LOSS)
        }}
      />
    </>
  )
}
