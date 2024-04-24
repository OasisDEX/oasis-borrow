import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { Skeleton } from 'components/Skeleton'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import type { SimulationYields } from 'features/omni-kit/hooks'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Divider, Flex, Grid, Text } from 'theme-ui'

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
      <Grid
        sx={{
          gridTemplateColumns: '0.7fr 1fr',
          alignItems: 'end',
          justifyItems: 'end',
          gap: 2,
        }}
      >
        <Box as="span" />
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          APY Breakdown
        </Text>
      </Grid>
      <Divider />
      <Grid
        sx={{
          gridTemplateColumns: '0.7fr 1fr',
          alignItems: 'end',
          justifyItems: 'end',
          gap: 2,
        }}
      >
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text variant="paragraph4" color="neutral80">
            Current (last 24h)
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text variant="boldParagraph2">
            {simulations?.yields.apy ? (
              formatPercent(simulations.yields.apy, { precision: 2 })
            ) : (
              <Skeleton />
            )}
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text variant="paragraph4" color="neutral80">
            7 days
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text variant="boldParagraph2">
            {simulations?.yields.apy7d ? (
              formatPercent(simulations.yields.apy7d, { precision: 2 })
            ) : (
              <Skeleton />
            )}
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text variant="paragraph4" color="neutral80">
            30 days
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text variant="boldParagraph2">
            {simulations?.yields.apy30d ? (
              formatPercent(simulations.yields.apy30d, { precision: 2 })
            ) : (
              <Skeleton />
            )}
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text variant="paragraph4" color="neutral80">
            90 days
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text variant="boldParagraph2">
            {simulations?.yields.apy90d ? (
              formatPercent(simulations.yields.apy90d, { precision: 2 })
            ) : (
              <Skeleton />
            )}
          </Text>
        </Flex>
      </Grid>
    </DetailsSectionContentSimpleModal>
  )
}
