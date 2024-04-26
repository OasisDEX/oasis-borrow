import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { Skeleton } from 'components/Skeleton'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import type { SimulationYields } from 'features/omni-kit/hooks'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Grid, Heading, Text } from 'theme-ui'

interface OmniCardDataCollateralDepositedModalProps extends OmniContentCardDataWithTheme {
  collateralToken: string
  quoteToken: string
  protocol: string
  simulations?: SimulationYields
}

export function OmniCardDataNetApyModal({
  collateralToken,
  quoteToken,
  protocol,
  theme,
  simulations,
}: OmniCardDataCollateralDepositedModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.net-apy.title')}
      description={t('omni-kit.content-card.net-apy.modal-description', {
        collateralToken,
        quoteToken,
        protocol,
      })}
      theme={theme}
    >
      <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
        Net APY Breakdown
      </Heading>
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr'],
          alignItems: 'center',
          justifyItems: 'center',
          gap: 2,
        }}
      >
        <Text variant="paragraph4" color="neutral80">
          Current (last 24h)
        </Text>
        <Text variant="paragraph4" color="neutral80">
          7 days
        </Text>
        <Text variant="paragraph4" color="neutral80">
          30 days
        </Text>
        <Text variant="paragraph4" color="neutral80">
          90 days
        </Text>
      </Grid>
      <Divider />
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr'],
          alignItems: 'center',
          justifyItems: 'center',
          gap: 2,
        }}
      >
        <Text variant="boldParagraph2">
          {simulations?.yields.apy1d ? (
            formatPercent(simulations.yields.apy1d, { precision: 2 })
          ) : (
            <Skeleton />
          )}
        </Text>
        <Text variant="boldParagraph2">
          {simulations?.yields.apy7d ? (
            formatPercent(simulations.yields.apy7d, { precision: 2 })
          ) : (
            <Skeleton />
          )}
        </Text>
        <Text variant="boldParagraph2">
          {simulations?.yields.apy30d
            ? formatPercent(simulations.yields.apy30d, { precision: 2 })
            : 'New!'}
        </Text>
        <Text variant="boldParagraph2">
          {simulations?.yields.apy90d
            ? formatPercent(simulations.yields.apy90d, { precision: 2 })
            : 'New!'}
        </Text>
      </Grid>
    </DetailsSectionContentSimpleModal>
  )
}
