import type { IPosition } from '@oasisdex/dma-library'
import type { calculateViewValuesForPosition } from 'features/aave/services'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Heading, Text } from 'theme-ui'

export function CostToBorrowContentCardModal({
  position,
  currentPositionThings,
}: {
  position: IPosition
  currentPositionThings: ReturnType<typeof calculateViewValuesForPosition>
}) {
  const { t } = useTranslation()

  const { debt } = position

  const costToBorrow = currentPositionThings.debt.times(
    NaNIsZero(currentPositionThings.debtVariableBorrowRate),
  )

  return (
    <Grid gap={2}>
      <Heading variant="header4">{t('aave-position-modal.net-borrow-cost.first-header')}</Heading>
      <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
        {t('aave-position-modal.net-borrow-cost.first-description-line')}
        <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
          {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
        </Text>
      </Text>
      <Card as="p" variant="vaultDetailsCardModal">
        {formatDecimalAsPercent(NaNIsZero(currentPositionThings.netBorrowCostPercentage))}
      </Card>
      <Flex sx={{ justifyContent: 'space-around' }}>
        <Card variant="vaultDetailsCardModalDetail">
          {t('aave-position-modal.net-borrow-cost.borrow-apy', {
            rate: formatDecimalAsPercent(currentPositionThings.debtVariableBorrowRate),
          })}
        </Card>
        <Card variant="vaultDetailsCardModalDetail" sx={{ ml: 2 }}>
          {t('aave-position-modal.net-borrow-cost.supply-apy', {
            rate: formatDecimalAsPercent(currentPositionThings.collateralLiquidityRate),
          })}
        </Card>
      </Flex>
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
        {`${formatCryptoBalance(costToBorrow)} ${debt.symbol}`}
      </Card>
    </Grid>
  )
}
