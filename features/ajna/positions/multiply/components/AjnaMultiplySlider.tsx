import { Icon } from '@makerdao/dai-ui-icons'
import { normalizeValue } from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface AjnaMultiplySliderProps {
  disabled?: boolean
}

export function AjnaMultiplySlider({ disabled = false }: AjnaMultiplySliderProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, collateralPrice, isShort },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { loanToValue },
      updateState,
    },
    position: {
      currentPosition: { position, simulation },
    },
    validation: { isFormFrozen },
  } = useAjnaProductContext('multiply')

  const min = (simulation?.minRiskRatio || position.minRiskRatio).loanToValue.decimalPlaces(
    2,
    BigNumber.ROUND_UP,
  )

  const generateMax = getAjnaBorrowDebtMax({
    precision: getToken(quoteToken).precision,
    position,
    simulation,
  })

  const max = !generateMax.isZero()
    ? generateMax
        .plus(position.debtAmount)
        .div((simulation || position).collateralAmount.times(collateralPrice))
        .decimalPlaces(2, BigNumber.ROUND_DOWN)
    : zero

  const resolvedValue =
    loanToValue || simulation?.riskRatio.loanToValue || position.riskRatio.loanToValue || min

  const percentage = resolvedValue.minus(min).div(max.minus(min)).times(100)
  const ltv = position.riskRatio.loanToValue
  const liquidationPrice = simulation?.liquidationPrice || position.liquidationPrice

  const changeVariant = getBorrowishChangeVariant(simulation)

  return (
    <SliderValuePicker
      sliderPercentageFill={percentage}
      leftBoundry={isShort ? normalizeValue(one.div(liquidationPrice)) : liquidationPrice}
      leftBoundryFormatter={(val) => `${formatCryptoBalance(val)} ${collateralToken}/${quoteToken}`}
      rightBoundry={resolvedValue}
      rightBoundryFormatter={(val) => (
        <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
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
        </Flex>
      )}
      onChange={(value) => updateState('loanToValue', value)}
      minBoundry={min}
      maxBoundry={max}
      lastValue={resolvedValue}
      disabled={disabled || isFormFrozen}
      step={0.01}
      leftBottomLabel={t('slider.adjust-multiply.left-footer')}
      leftLabel={t('slider.adjust-multiply.left-label')}
      rightBottomLabel={t('slider.adjust-multiply.right-footer')}
      rightLabel={t('system.loan-to-value')}
    />
  )
}
