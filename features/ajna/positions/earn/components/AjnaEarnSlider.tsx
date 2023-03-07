import BigNumber from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
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
  htp,
  lup,
  momp,
  offset, // 0 - 1, percentage value
}: {
  htp: BigNumber
  lup: BigNumber
  momp: BigNumber
  offset: number
}) {
  // Generate ranges from min to lup
  const lupNearHtpRange = [lup]

  while (lupNearHtpRange[lupNearHtpRange.length - 1].gt(htp)) {
    lupNearHtpRange.push(lupNearHtpRange[lupNearHtpRange.length - 1].div(1.005))
  }

  const nearHtpMinRange = [lupNearHtpRange[lupNearHtpRange.length - 1]]

  while (
    nearHtpMinRange[nearHtpMinRange.length - 1].gt(nearHtpMinRange[0].times(one.minus(offset)))
  ) {
    nearHtpMinRange.push(nearHtpMinRange[nearHtpMinRange.length - 1].div(1.005))
  }

  // Generate ranges from lup to max
  const lupNearMompRange = [lup]

  while (lupNearMompRange[lupNearMompRange.length - 1].lt(momp)) {
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
  ].sort((a, b) => a.toNumber() - b.toNumber())

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
  htp,
  lup,
  momp,
}: {
  min: BigNumber
  max: BigNumber
  htp: BigNumber
  lup: BigNumber
  momp: BigNumber
}) {
  return {
    htpPercentage: convertSliderValuesToPercents(htp, min, max),
    lupPercentage: convertSliderValuesToPercents(lup, min, max),
    mompPercentage: convertSliderValuesToPercents(momp, min, max),
  }
}

const ajnaSliderDefaults = {
  maxLtv: new BigNumber(0.65),
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
      currentPosition: {
        position: {
          pool: { highestThresholdPrice, lowestUtilizedPrice, mostOptimisticMatchingPrice },
        },
      },
    },
  } = useAjnaProductContext('earn')

  const { maxLtv } = ajnaSliderDefaults
  const resolvedValue = (price || highestThresholdPrice).decimalPlaces(2)

  const { min, max, range } = useMemo(
    () =>
      getMinMaxAndRange({
        htp: highestThresholdPrice,
        momp: mostOptimisticMatchingPrice,
        lup: lowestUtilizedPrice,
        offset: 0.2, // 20%
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
        htp: highestThresholdPrice,
        lup: lowestUtilizedPrice,
        momp: mostOptimisticMatchingPrice,
      }),
    [min, max, highestThresholdPrice, lowestUtilizedPrice, mostOptimisticMatchingPrice],
  )

  function handleChange(v: BigNumber) {
    const newValue = snapToPredefinedValues(v, range)
    updateState('price', newValue.decimalPlaces(2))
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
      rightBoundryFormatter={(v) => `${t('max-ltv')} ${formatDecimalAsPercent(v)}`}
      disabled={false}
      onChange={handleChange}
      leftLabel={t('ajna.earn.open.form.max-lending-price', {
        quoteToken,
        collateralToken,
      })}
      rightLabel={t('ajna.earn.open.form.max-ltv-to-lend-at')}
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
