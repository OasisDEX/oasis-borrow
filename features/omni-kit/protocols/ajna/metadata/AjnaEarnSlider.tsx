import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { PillAccordion } from 'components/PillAccordion'
import { omniLendingPriceColors } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { AJNA_HTP_OFFSET, AJNA_LUP_OFFSET } from 'features/omni-kit/protocols/ajna/constants'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts'
import {
  convertAjnaSliderThresholds,
  getAjnaMinMaxAndRange,
  snapToPredefinedValues,
} from 'features/omni-kit/protocols/ajna/helpers'
import { AjnaEarnInput } from 'features/omni-kit/protocols/ajna/metadata'
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

export const AjnaEarnSlider: FC<AjnaEarnSliderProps> = ({
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

  const { highestThresholdPrice, lowestUtilizedPrice, lowestUtilizedPriceIndex } = position.pool

  const { min, max, range } = useMemo(
    () =>
      getAjnaMinMaxAndRange({
        highestThresholdPrice,
        lowestUtilizedPrice,
        lowestUtilizedPriceIndex,
        marketPrice: position.marketPrice,
        isOracless,
        lupOffset: AJNA_LUP_OFFSET,
        htpOffset: AJNA_HTP_OFFSET,
      }),
    [
      highestThresholdPrice.toString(),
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

  const { htpPercentage, lupPercentage } = useMemo(
    () =>
      convertAjnaSliderThresholds({
        min,
        max,
        highestThresholdPrice,
        lowestUtilizedPrice,
      }),
    [min, max, highestThresholdPrice, lowestUtilizedPrice],
  )

  const leftBoundry = isShort ? one.div(resolvedValue) : resolvedValue

  return (
    <>
      {!(isOracless && isNotUtilizedPool) && (
        <SliderValuePicker
          lastValue={resolvedValue}
          minBoundry={min}
          maxBoundry={max}
          step={max
            .minus(min)
            .div(range.length - 1)
            .toNumber()}
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
        ${omniLendingPriceColors[0]} 0 ${htpPercentage}%,
        ${omniLendingPriceColors[1]} ${htpPercentage}% ${lupPercentage}%,
        ${omniLendingPriceColors[2]} ${lupPercentage}% 100%)`}
        />
      )}
      {nestedManualInput ? (
        <PillAccordion
          title={t('ajna.position-page.earn.common.form.or-enter-specific-lending-price', {
            priceFormat,
          })}
        >
          <AjnaEarnInput disabled={isDisabled || isFormFrozen} />
        </PillAccordion>
      ) : (
        <Box sx={{ mt: 3 }}>
          <AjnaEarnInput disabled={isDisabled || isFormFrozen} />
        </Box>
      )}
    </>
  )
}
