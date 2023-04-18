import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { ajnaMultiplySliderDefaults } from 'features/ajna/positions/multiply/temp'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface AjnaMultiplySliderProps {
  disabled?: boolean
}

export function AjnaMultiplySlider({ disabled = false }: AjnaMultiplySliderProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { targetLiquidationPrice },
      updateState,
    },
  } = useAjnaProductContext('multiply')

  const resolvedValue = targetLiquidationPrice || ajnaMultiplySliderDefaults.initial
  const min = ajnaMultiplySliderDefaults.min
  const max = ajnaMultiplySliderDefaults.max
  const percentage = resolvedValue.minus(min).div(max.minus(min)).times(100)
  const ltv = new BigNumber(0.6265)
  const afterLtv = new BigNumber(0.7141)
  const variant = 'positive'

  return (
    <SliderValuePicker
      sliderPercentageFill={percentage}
      leftBoundry={resolvedValue}
      leftBoundryFormatter={(val) => `${formatCryptoBalance(val)} ${collateralToken}/${quoteToken}`}
      rightBoundry={afterLtv}
      rightBoundryFormatter={(val) => (
        <>
          {formatDecimalAsPercent(ltv)}
          {afterLtv && !ltv.eq(afterLtv) && (
            <>
              <Icon name="arrow_right" size={14} sx={{ mx: 2 }} />
              <Text as="span" sx={{ color: variant === 'positive' ? 'success100' : 'critical100' }}>
                {formatDecimalAsPercent(val)}
              </Text>
            </>
          )}
        </>
      )}
      onChange={(targetLiquidationPrice) => {
        updateState('targetLiquidationPrice', targetLiquidationPrice)
      }}
      minBoundry={min}
      maxBoundry={max}
      lastValue={resolvedValue}
      disabled={disabled}
      step={1}
      leftBottomLabel={t('slider.adjust-multiply.left-footer')}
      leftLabel={t('slider.adjust-multiply.left-label')}
      rightBottomLabel={t('slider.adjust-multiply.right-footer')}
      rightLabel={t('system.loan-to-value')}
    />
  )
}
