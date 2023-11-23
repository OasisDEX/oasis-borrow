import type BigNumber from 'bignumber.js'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatDecimalAsPercent, formatPrecision } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface OmniContentCardNetBorrowCostProps extends OmniContentCardCommonProps {
  afterNextBorrowCost?: BigNumber
  netBorrowCost: BigNumber
  netBorrowCostInUSDC: BigNumber
  quoteToken: string
}

export const OmniContentCardNetBorrowCost: FC<OmniContentCardNetBorrowCostProps> = ({
  afterNextBorrowCost,
  netBorrowCost,
  netBorrowCostInUSDC,
  quoteToken,
}) => {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentCard
      title={t('system.net-borrow-cost')}
      value={formatDecimalAsPercent(NaNIsZero(netBorrowCost))}
      change={
        afterNextBorrowCost && {
          variant: afterNextBorrowCost.lte(zero) ? 'positive' : 'negative',
          value: `${formatDecimalAsPercent(NaNIsZero(afterNextBorrowCost))} ${t('after')}`,
        }
      }
      // TODO remove aave dependency from translation
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
            {formatDecimalAsPercent(NaNIsZero(netBorrowCost))}
          </Card>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.net-borrow-cost.second-description-line')}
          </Text>
          <Heading variant="header4">
            {t('aave-position-modal.net-borrow-cost.second-header', {
              debtToken: quoteToken,
            })}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.net-borrow-cost.third-description-line', {
              debtToken: quoteToken,
            })}
            <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
              {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
            </Text>
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {`${formatPrecision(netBorrowCostInUSDC, 2)} ${quoteToken}`}
          </Card>
        </Grid>
      }
    />
  )
}
