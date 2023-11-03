import { normalizeValue } from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { Icon } from 'components/Icon'
import { SkeletonLine } from 'components/Skeleton'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { arrow_right } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

const min = new BigNumber(0.01)
const max = new BigNumber(1)
const openFlowInitialLtv = new BigNumber(0.1)

interface AjnaAdjustSliderProps {
  disabled?: boolean
}

export function AjnaAdjustSlider({ disabled = false }: AjnaAdjustSliderProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, isShort, product },
    steps: { currentStep },
  } = useAjnaGeneralContext()

  if (product === 'earn') {
    throw new Error('AjnaAdjustSlider is not supported for earn')
  }

  const {
    form: {
      state: { loanToValue, depositAmount },
      dispatch,
    },
    position: {
      currentPosition: { position, simulation },
      isSimulationLoading,
    },
  } = useAjnaProductContext(product)
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

  const resolvedValue = loanToValue || position.riskRatio.loanToValue

  const percentage = resolvedValue.minus(min).div(max.minus(min)).times(100)
  const ltv = position.riskRatio.loanToValue
  const liquidationPrice = simulation?.liquidationPrice || position.liquidationPrice

  const changeVariant = getBorrowishChangeVariant({ simulation, isOracless: false })

  useEffect(() => {
    if (!loanToValue && currentStep === 'setup' && depositAmount) {
      dispatch({ type: 'update-loan-to-value', loanToValue: openFlowInitialLtv })
    }
  }, [loanToValue?.toString(), currentStep, depositAmount?.toString()])

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
                  <Icon icon={arrow_right} size={14} sx={{ mx: 2 }} />
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
      onChange={(value) => dispatch({ type: 'update-loan-to-value', loanToValue: value })}
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
