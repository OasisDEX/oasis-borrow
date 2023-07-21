import { Icon } from '@makerdao/dai-ui-icons'
import { normalizeValue } from '@oasisdex/dma-library'
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
import { one } from 'helpers/zero'
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

  const min = (simulation?.minRiskRatio || position.minRiskRatio).loanToValue.decimalPlaces(
    2,
    BigNumber.ROUND_UP,
  )

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

  const max =
    !generateMax.isZero() && tokenPrice
      ? generateMax
          .plus(position.debtAmount)
          .div((simulation || position).collateralAmount.times(tokenPrice))
          .decimalPlaces(2, BigNumber.ROUND_DOWN)
      : one

  let resolvedValue = loanToValue || position.riskRatio.loanToValue || min
  if (resolvedValue.gt(max)) {
    resolvedValue = max
  }
  if (resolvedValue.lt(min)) {
    resolvedValue = min
  }

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
      minBoundry={min}
      maxBoundry={max}
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
