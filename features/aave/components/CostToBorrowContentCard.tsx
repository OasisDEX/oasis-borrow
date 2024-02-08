import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import type { calculateViewValuesForPosition } from 'features/aave/services'
import { formatDecimalAsPercent, formatPrecision } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export function CostToBorrowContentCard({
  position,
  currentPositionThings,
  nextPositionThings,
  debtTokenPrice,
}: {
  position: IPosition
  currentPositionThings: ReturnType<typeof calculateViewValuesForPosition>
  nextPositionThings: ReturnType<typeof calculateViewValuesForPosition> | undefined
  debtTokenPrice: BigNumber
}) {
  const { t } = useTranslation()
  const { debt } = position

  const constToBorrow = currentPositionThings.debt
    .times(debtTokenPrice)
    .times(NaNIsZero(currentPositionThings.debtVariableBorrowRate))

  return (
    <DetailsSectionContentCard
      title={t('system.net-borrow-cost')}
      value={formatDecimalAsPercent(NaNIsZero(currentPositionThings.netBorrowCostPercentage))}
      change={
        nextPositionThings && {
          variant: nextPositionThings.netBorrowCostPercentage.lte(zero) ? 'positive' : 'negative',
          value: `${formatDecimalAsPercent(
            NaNIsZero(nextPositionThings.netBorrowCostPercentage),
          )} ${t('after')}`,
        }
      }
      modal={
        <Grid gap={2}>
          <Heading variant="header4">
            {t('aave-position-modal.net-borrow-cost.first-header')}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.net-borrow-cost.first-description-line')}
            <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
              {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
            </Text>
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {formatDecimalAsPercent(NaNIsZero(currentPositionThings.netBorrowCostPercentage))}
          </Card>
          <Text as="p" variant="boldParagraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.net-borrow-cost.borrow-apy', {
              rate: formatDecimalAsPercent(currentPositionThings.debtVariableBorrowRate),
            })}
          </Text>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            <Text as="span" variant="boldParagraph3" sx={{ mb: 1 }}>
              {t('aave-position-modal.net-borrow-cost.supply-apy', {
                rate: formatDecimalAsPercent(currentPositionThings.collateralLiquidityRate),
              })}
            </Text>
            <Text as="span" variant="paragraph3" sx={{ mb: 1 }}>
              {t('aave-position-modal.net-borrow-cost.supply-apy-note')}
            </Text>
          </Text>
          <Heading variant="header4">
            {t('aave-position-modal.net-borrow-cost.second-header', {
              debtToken: debt.symbol,
            })}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.net-borrow-cost.third-description-line')}
            <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
              {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
            </Text>
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {`${formatPrecision(constToBorrow, 2)} ${debt.symbol}`}
          </Card>
        </Grid>
      }
    />
  )
}
