import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { PillAccordion } from 'components/PillAccordion'
import {
  AJNA_HTP_OFFSET,
  AJNA_MOMP_OFFSET,
  lendingPriceColors,
} from 'features/ajna/positions/earn/consts'
import { convertSliderThresholds } from 'features/ajna/positions/earn/helpers/convertSliderThresholds'
import { getMinMaxAndRange } from 'features/ajna/positions/earn/helpers/getMinMaxAndRange'
import { snapToPredefinedValues } from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { AjnaOmniEarnInput } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnInput'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useEffect, useMemo } from 'react'
import { Box } from 'theme-ui'

interface AjnaEarnSliderProps {
  isFormFrozen: boolean
  isDisabled?: boolean
  nestedManualInput?: boolean
}

export const AjnaOmniEarnSlider: FC<AjnaEarnSliderProps> = ({
  isDisabled,
  nestedManualInput,
  isFormFrozen,
}) => {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, priceFormat, quoteToken, isShort, isOracless },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position: _position },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  const {
    state: { price },
    dispatch,
  } = useAjnaCustomState()

  const position = _position as AjnaEarnPosition

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
        isOracless,
        mompOffset: AJNA_MOMP_OFFSET,
        htpOffset: AJNA_HTP_OFFSET,
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
    const newValue = snapToPredefinedValues(v)
    dispatch({ type: 'price-change', price: newValue })
  }

  const resolvedLup = lowestUtilizedPriceIndex.isZero() ? max : lowestUtilizedPrice
  const resolvedValue = price || resolvedLup
  const maxLtv = position.getMaxLtv(resolvedValue)
  const isNotUtilizedPool = lowestUtilizedPriceIndex.isZero()

  useEffect(() => {
    // triggered only once to initialize price on state when lup index is zero
    if (isNotUtilizedPool && !price) {
      handleChange(min)
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
      {!(isOracless && isNotUtilizedPool) && (
        <SliderValuePicker
          lastValue={resolvedValue}
          minBoundry={min}
          maxBoundry={max}
          step={range.at(-1)!.minus(range.at(-2)!).toNumber()}
          leftBoundry={leftBoundry}
          rightBoundry={maxLtv}
          leftBoundryFormatter={(v) => `${formatCryptoBalance(v)}`}
          rightBoundryFormatter={(v) =>
            isOracless ? '' : !v.isZero() ? formatDecimalAsPercent(v) : '-'
          }
          disabled={isDisabled || isFormFrozen}
          onChange={handleChange}
          leftLabel={t('ajna.position-page.earn.common.form.token-pair-lending-price', {
            quoteToken: isShort ? collateralToken : quoteToken,
            collateralToken: isShort ? quoteToken : collateralToken,
          })}
          rightLabel={
            !isOracless ? t('ajna.position-page.earn.common.form.max-ltv-to-lend-at') : undefined
          }
          leftBottomLabel={t('safer')}
          rightBottomLabel={t('riskier')}
          colorfulRanges={`linear-gradient(to right,
        #D3D4D8 0 ${htpPercentage}%,
        ${lendingPriceColors.belowLup} ${htpPercentage}% ${lupPercentage}%,
        ${lendingPriceColors.belowMomp} ${lupPercentage}% ${mompPercentage}%,
        ${lendingPriceColors.aboveMomp} ${mompPercentage}% 100%)`}
        />
      )}
      {nestedManualInput ? (
        <PillAccordion
          title={t('ajna.position-page.earn.common.form.or-enter-specific-lending-price', {
            priceFormat,
          })}
        >
          <AjnaOmniEarnInput disabled={isDisabled || isFormFrozen} />
        </PillAccordion>
      ) : (
        <Box sx={{ mt: 3 }}>
          <AjnaOmniEarnInput disabled={isDisabled || isFormFrozen} />
        </Box>
      )}
    </>
  )
}
