import { Icon } from '@makerdao/dai-ui-icons'
import { normalizeValue } from '@oasisdex/dma-library'
import { DEFAULT_LTV_ON_NEW_POOL } from 'actions/ajna/multiply'
import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { SkeletonLine } from 'components/Skeleton'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { resolveSwapTokenPrice } from 'features/ajna/positions/common/helpers/resolveSwapTokenPrice'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Flex, Text } from 'theme-ui'

interface AjnaMultiplySliderProps {
  disabled?: boolean
}

export function AjnaMultiplySlider({ disabled = false }: AjnaMultiplySliderProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, isShort, collateralPrice },
  } = useAjnaGeneralContext()

  const {
    form: {
      state: { loanToValue, depositAmount },
      updateState,
    },
    position: {
      currentPosition: { position, simulation },
      swap,
      isSimulationLoading,
    },
  } = useAjnaProductContext('multiply')
  const [depositChanged, setDepositChanged] = useState(false)

  useEffect(() => {
    if (depositChanged && !isSimulationLoading) {
      setDepositChanged(false)
    }
  }, [isSimulationLoading])

  useEffect(() => {
    setDepositChanged(true)

    if (!depositAmount) {
      setDepositChanged(false)
    }
  }, [depositAmount?.toString()])

  // Want min to be zero or related to a simulated position
  // Trying to determine min from existing position (pre simulation) creates issues
  const min = simulation?.minRiskRatio.loanToValue.decimalPlaces(2, BigNumber.ROUND_UP) || zero

  const generateMax = getAjnaBorrowDebtMax({
    precision: getToken(quoteToken).precision,
    position,
    simulation,
  })

  const tokenPrice =
    resolveSwapTokenPrice({
      positionData: position,
      simulationData: simulation,
      swapData: swap?.current,
    }) || collateralPrice

  // Max falls back to 100% if it's zero or NaN to limit issues
  // With min/loanToValue being larger than max
  const max =
    !generateMax.isZero() && tokenPrice
      ? generateMax
          .plus(position.debtAmount)
          .div((simulation || position).collateralAmount.times(tokenPrice))
          .decimalPlaces(2, BigNumber.ROUND_DOWN)
      : one

  const resolvedValue = loanToValue || min || DEFAULT_LTV_ON_NEW_POOL

  const sliderMin = min || DEFAULT_LTV_ON_NEW_POOL
  const sliderMax = max.gt(min || zero) ? max : one
  const impossibleLimits = min.gt(max)

  useEffect(() => {
    // Give a default value to LTV if it's not set
    // Avoids issues with LTV of 0 and aligns with the initial LTV value
    // Used in for openMultiply when getting the initial simulation
    if (loanToValue) return
    updateState('loanToValue', DEFAULT_LTV_ON_NEW_POOL)
  }, [loanToValue, resolvedValue])

  useEffect(() => {
    // If prevailing LTV is lower than min bump it up to min
    if (!impossibleLimits && min && loanToValue && loanToValue.lt(min)) {
      updateState('loanToValue', min)
    }
  }, [loanToValue, min, impossibleLimits])

  useEffect(() => {
    // If prevailing LTV is higher than max bump it down to max
    if (!impossibleLimits && loanToValue && loanToValue.gt(max)) {
      updateState('loanToValue', max)
    }
  }, [loanToValue, max, impossibleLimits])

  useEffect(() => {
    // Place LTV in middle of impossible limits
    // To help mediate issues with these edge cases
    if (!impossibleLimits || !loanToValue) return
    // Adjustment has already taken effect
    if (loanToValue.lt(min) && loanToValue.gt(max)) return
    // Place LTV in middle of impossible limits
    updateState('loanToValue', min.plus(max).div(2))
  }, [loanToValue, max, min, impossibleLimits])

  const percentage = resolvedValue.minus(min).div(max.minus(min)).times(100)
  const ltv = position.riskRatio.loanToValue
  const liquidationPrice = simulation?.liquidationPrice || position.liquidationPrice

  const changeVariant = getBorrowishChangeVariant(simulation)

  return (
    <SliderValuePicker
      sliderPercentageFill={percentage}
      leftBoundry={isShort ? normalizeValue(one.div(liquidationPrice)) : liquidationPrice}
      leftBoundryFormatter={(val) =>
        isSimulationLoading ? (
          <Flex sx={{ alignItems: 'center', height: '28px' }}>
            <SkeletonLine height="18px" />
          </Flex>
        ) : (
          `${formatCryptoBalance(val)} ${collateralToken}/${quoteToken}`
        )
      }
      rightBoundry={resolvedValue}
      rightBoundryFormatter={(val) => (
        <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          {depositChanged && isSimulationLoading ? (
            <SkeletonLine height="18px" sx={{ my: '5px' }} />
          ) : (
            <>
              {formatDecimalAsPercent(ltv)}
              {!ltv.eq(resolvedValue) && (
                <>
                  <Icon name="arrow_right" size={14} sx={{ mx: 2 }} />
                  <Text
                    as="span"
                    sx={{ color: changeVariant === 'positive' ? 'success100' : 'critical100' }}
                  >
                    {formatDecimalAsPercent(val)}
                  </Text>
                </>
              )}
            </>
          )}
        </Flex>
      )}
      onChange={(value) => updateState('loanToValue', value)}
      minBoundry={sliderMin}
      maxBoundry={sliderMax}
      lastValue={resolvedValue}
      disabled={disabled}
      step={0.01}
      leftBottomLabel={t('slider.adjust-multiply.left-footer')}
      leftLabel={t('slider.adjust-multiply.left-label')}
      rightBottomLabel={t('slider.adjust-multiply.right-footer')}
      rightLabel={t('system.loan-to-value')}
    />
  )
}
