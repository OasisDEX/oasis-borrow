import type { IPosition } from '@oasisdex/dma-library'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import type { calculateViewValuesForPosition } from 'features/aave/services'
import { StrategyType } from 'features/aave/types'
import { formatPrecision } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function NetValueCard({
  strategyType,
  currentPosition,
  nextPositionThings,
  currentPositionThings,
  modal,
}: {
  strategyType: StrategyType
  currentPositionThings: ReturnType<typeof calculateViewValuesForPosition>
  currentPosition: IPosition
  nextPositionThings: ReturnType<typeof calculateViewValuesForPosition> | undefined
  modal?: React.ReactNode
}) {
  const { t } = useTranslation()

  const currentNetValue =
    strategyType === StrategyType.Long
      ? currentPositionThings.netValueInDebtToken
      : currentPositionThings.netValueInCollateralToken
  const nextNetValue =
    nextPositionThings &&
    (strategyType === StrategyType.Long
      ? nextPositionThings.netValueInDebtToken
      : nextPositionThings.netValueInCollateralToken)
  const netValueSymbol =
    strategyType === StrategyType.Long
      ? currentPosition.debt.symbol
      : currentPosition.collateral.symbol

  return (
    <DetailsSectionContentCard
      title={t('system.net-value')}
      value={`${formatPrecision(currentNetValue, 2)} ${netValueSymbol}`}
      change={
        nextNetValue && {
          variant: nextNetValue.gt(currentNetValue) ? 'positive' : 'negative',
          value: `${formatPrecision(nextNetValue, 2)} ${t('after')}`,
        }
      }
      modal={modal}
    />
  )
}
