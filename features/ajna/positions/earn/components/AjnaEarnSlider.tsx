import BigNumber from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { PillAccordion } from 'components/PillAccordion'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaEarnInput } from 'features/ajna/positions/earn/components/AjnaEarnInput'
import { AJNA_LUP_MOMP_OFFSET } from 'features/ajna/positions/earn/consts'
import { convertSliderThresholds } from 'features/ajna/positions/earn/helpers/convertSliderThresholds'
import { getMinMaxAndRange } from 'features/ajna/positions/earn/helpers/getMinMaxAndRange'
import { snapToPredefinedValues } from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { FC, useEffect, useMemo } from 'react'
import { Box } from 'theme-ui'

interface AjnaEarnSliderProps {
  isDisabled?: boolean
  nestedManualInput?: boolean
}

export const AjnaEarnSlider: FC<AjnaEarnSliderProps> = ({ isDisabled, nestedManualInput }) => {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, priceFormat, quoteToken, isShort },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { price },
      updateState,
    },
    position: {
      currentPosition: { position },
    },
    validation: { isFormFrozen },
  } = useAjnaProductContext('earn')

  const {
    highestThresholdPrice,
    lowestUtilizedPrice,
    mostOptimisticMatchingPrice,
    lowestUtilizedPriceIndex,
  } = position.pool

  const { min, max, range } = useMemo(
    () =>
      getMinMaxAndRange({
        highestThresholdPrice,
        mostOptimisticMatchingPrice,
        lowestUtilizedPrice,
        lowestUtilizedPriceIndex,
        marketPrice: position.marketPrice,
        offset: AJNA_LUP_MOMP_OFFSET,
      }),
    [
      highestThresholdPrice.toString(),
      mostOptimisticMatchingPrice.toString(),
      lowestUtilizedPrice.toString(),
      lowestUtilizedPriceIndex.toString(),
      position.marketPrice.toString(),
    ],
  )

  function handleChange(v: BigNumber) {
    const newValue = snapToPredefinedValues(v, range)
    updateState('price', newValue)
  }

  const resolvedLup = lowestUtilizedPriceIndex.isZero() ? max : lowestUtilizedPrice
  const resolvedValue = price || resolvedLup
  const maxLtv = position.getMaxLtv(resolvedValue)

  useEffect(() => {
    // triggered only once to initialize price on state when lup index is zero
    if (lowestUtilizedPriceIndex.isZero()) {
      handleChange(max)
    }
  }, [])

  const { htpPercentage, lupPercentage, mompPercentage } = useMemo(
    () =>
      convertSliderThresholds({
        min,
        max,
        highestThresholdPrice,
        lowestUtilizedPrice,
        mostOptimisticMatchingPrice,
      }),
    [min, max, highestThresholdPrice, lowestUtilizedPrice, mostOptimisticMatchingPrice],
  )

  const leftBoundry = isShort ? one.div(resolvedValue) : resolvedValue

  return (
    <>
      <SliderValuePicker
        lastValue={resolvedValue}
        minBoundry={min}
        maxBoundry={max}
        step={range[1].minus(range[0]).toNumber()}
        leftBoundry={leftBoundry}
        rightBoundry={maxLtv}
        leftBoundryFormatter={(v) => `${t('price')} $${formatAmount(v, 'USD')}`}
        rightBoundryFormatter={(v) =>
          !v.isZero() ? `${t('max-ltv')} ${formatDecimalAsPercent(v)}` : '-'
        }
        disabled={isDisabled || isFormFrozen}
        onChange={handleChange}
        leftLabel={t('ajna.position-page.earn.common.form.token-pair-lending-price', {
          quoteToken: isShort ? collateralToken : quoteToken,
          collateralToken: isShort ? quoteToken : collateralToken,
        })}
        rightLabel={t('ajna.position-page.earn.common.form.max-ltv-to-lend-at')}
        leftBottomLabel={t('safer')}
        rightBottomLabel={t('riskier')}
        colorfulRanges={`linear-gradient(to right,
        #D3D4D8 0 ${htpPercentage}%,
        #1ECBAE ${htpPercentage}% ${lupPercentage}%,
        #EABE4C ${lupPercentage}% ${mompPercentage}%,
        #EE5728 ${mompPercentage}% 100%)`}
      />
      {nestedManualInput ? (
        <PillAccordion
          title={t('ajna.position-page.earn.common.form.or-enter-specific-lending-price', {
            priceFormat,
          })}
        >
          <AjnaEarnInput disabled={isDisabled || isFormFrozen} min={min} max={max} range={range} />
        </PillAccordion>
      ) : (
        <Box sx={{ mt: 3 }}>
          <AjnaEarnInput disabled={isDisabled || isFormFrozen} min={min} max={max} range={range} />
        </Box>
      )}
    </>
  )
}
