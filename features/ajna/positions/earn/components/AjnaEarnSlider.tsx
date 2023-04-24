import BigNumber from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AJNA_LUP_MOMP_OFFSET } from 'features/ajna/positions/earn/consts'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

function snapToPredefinedValues(value: BigNumber, predefinedSteps: BigNumber[]) {
  return predefinedSteps.reduce((prev, curr) => {
    return curr.minus(value).abs().lt(prev.minus(value).abs()) ? curr : prev
  })
}

function getMinMaxAndRange({
  highestThresholdPrice,
  lowestUtilizedPrice,
  mostOptimisticMatchingPrice,
  offset, // 0 - 1, percentage value
}: {
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  mostOptimisticMatchingPrice: BigNumber
  offset: number
}) {
  // Generate ranges from min to lup
  const lupNearHtpRange = [lowestUtilizedPrice]

  while (lupNearHtpRange[lupNearHtpRange.length - 1].gt(highestThresholdPrice)) {
    lupNearHtpRange.push(lupNearHtpRange[lupNearHtpRange.length - 1].div(1.005))
  }

  const nearHtpMinRange = [lupNearHtpRange[lupNearHtpRange.length - 1]]

  while (
    nearHtpMinRange[nearHtpMinRange.length - 1].gt(nearHtpMinRange[0].times(one.minus(offset)))
  ) {
    nearHtpMinRange.push(nearHtpMinRange[nearHtpMinRange.length - 1].div(1.005))
  }

  // Generate ranges from lup to max
  const lupNearMompRange = [lowestUtilizedPrice]

  while (lupNearMompRange[lupNearMompRange.length - 1].lt(mostOptimisticMatchingPrice)) {
    lupNearMompRange.push(lupNearMompRange[lupNearMompRange.length - 1].times(1.005))
  }

  const nearMompMaxRange = [lupNearMompRange[lupNearMompRange.length - 1]]

  while (
    nearMompMaxRange[nearMompMaxRange.length - 1].lt(nearMompMaxRange[0].times(one.plus(offset)))
  ) {
    nearMompMaxRange.push(nearMompMaxRange[nearMompMaxRange.length - 1].times(1.005))
  }

  const range = [
    ...new Set([...nearHtpMinRange, ...lupNearHtpRange, ...lupNearMompRange, ...nearMompMaxRange]),
  ]
    .sort((a, b) => a.toNumber() - b.toNumber())
    .map((item) => item.decimalPlaces(18))

  return {
    min: range[0],
    max: range[range.length - 1],
    range,
  }
}

function convertSliderValuesToPercents(value: BigNumber, min: BigNumber, max: BigNumber) {
  return value.minus(min).div(max.minus(min)).times(100).toNumber()
}

function convertSliderThresholds({
  min,
  max,
  highestThresholdPrice,
  lowestUtilizedPrice,
  mostOptimisticMatchingPrice,
}: {
  min: BigNumber
  max: BigNumber
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  mostOptimisticMatchingPrice: BigNumber
}) {
  return {
    htpPercentage: convertSliderValuesToPercents(highestThresholdPrice, min, max),
    lupPercentage: convertSliderValuesToPercents(lowestUtilizedPrice, min, max),
    mompPercentage: convertSliderValuesToPercents(mostOptimisticMatchingPrice, min, max),
  }
}

export function AjnaEarnSlider() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { price },
      updateState,
    },
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('earn')

  const { highestThresholdPrice, lowestUtilizedPrice, mostOptimisticMatchingPrice } = position.pool

  const resolvedValue = price || lowestUtilizedPrice

  const maxLtv = position.getMaxLtv(price)

  const { min, max, range } = useMemo(
    () =>
      getMinMaxAndRange({
        highestThresholdPrice,
        mostOptimisticMatchingPrice,
        lowestUtilizedPrice,
        offset: AJNA_LUP_MOMP_OFFSET,
      }),
    [
      highestThresholdPrice.toString(),
      mostOptimisticMatchingPrice.toString(),
      lowestUtilizedPrice.toString(),
    ],
  )

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

  function handleChange(v: BigNumber) {
    const newValue = snapToPredefinedValues(v, range)
    updateState('price', newValue)
  }

  return (
    <SliderValuePicker
      lastValue={resolvedValue}
      minBoundry={min}
      maxBoundry={max}
      step={1}
      leftBoundry={resolvedValue}
      rightBoundry={maxLtv}
      leftBoundryFormatter={(v) => `${t('price')} $${formatAmount(v, 'USD')}`}
      rightBoundryFormatter={(v) =>
        !v.isZero() ? `${t('max-ltv')} ${formatDecimalAsPercent(v)}` : '-'
      }
      disabled={false}
      onChange={handleChange}
      leftLabel={t('ajna.position-page.earn.common.form.max-lending-price', {
        quoteToken,
        collateralToken,
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
  )
}
