import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import type { Theme } from 'theme-ui'
import { Box, Card, Divider, Flex, Grid, Text } from 'theme-ui'

interface OmniMultiplyNetValueModalProps extends OmniNetValuePnlDataReturnType {
  theme?: Theme
}

interface OmniMultiplyNetValueModalGridRowProps {
  firstColumn: string
  label: string
  secondColumn: string
}

function OmniMultiplyNetValueModalGridRow({
  firstColumn,
  label,
  secondColumn,
}: OmniMultiplyNetValueModalGridRowProps) {
  return (
    <>
      <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
        <Text variant="paragraph4" color="neutral80">
          {label}
        </Text>
      </Flex>
      <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        <Text variant="boldParagraph2">{firstColumn}</Text>
      </Flex>
      <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        <Text variant="boldParagraph2">{secondColumn}</Text>
      </Flex>
    </>
  )
}

export function OmniMultiplyNetValueModal({
  pnl,
  netValue,
  pnlCumulatives,
  theme,
}: OmniMultiplyNetValueModalProps) {
  const { t } = useTranslation()

  if (!pnlCumulatives) return null
  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.net-value-modal.modal-title')}
      description={
        <Trans
          i18nKey="omni-kit.content-card.net-value-modal.modal-description"
          values={{ netValueTokenPrice: formatCryptoBalance(netValue.netValueTokenPrice) }}
          components={{ strong: <Text sx={{ fontWeight: 'semiBold' }} /> }}
        />
      }
      theme={theme}
    >
      <Grid
        sx={{
          gridTemplateColumns: '0.7fr 1.3fr 1fr',
          alignItems: 'end',
          justifyItems: 'end',
          gap: 2,
        }}
      >
        <Box as="span" />
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          {t('omni-kit.content-card.net-value-modal.modal-table-col-1')}
        </Text>
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          {t('omni-kit.content-card.net-value-modal.modal-table-col-2')}
        </Text>
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-1')}
          firstColumn={`${formatCryptoBalance(netValue.inToken)} ${netValue.netValueToken}`}
          secondColumn={formatUsdValue(netValue.inUsd)}
        />
      </Grid>
      <Divider />
      <Grid
        sx={{
          gridTemplateColumns: '0.7fr 1.3fr 1fr',
          alignItems: 'end',
          justifyItems: 'end',
          gap: 2,
        }}
      >
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-2')}
          firstColumn={`${formatCryptoBalance(pnlCumulatives.deposit.inToken)} ${
            netValue.netValueToken
          }`}
          secondColumn={formatUsdValue(pnlCumulatives.deposit.inUsd)}
        />
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-3')}
          firstColumn={`${formatCryptoBalance(pnlCumulatives.withdraw.inToken)} ${
            netValue.netValueToken
          }`}
          secondColumn={formatUsdValue(pnlCumulatives.withdraw.inUsd)}
        />
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-4')}
          firstColumn={`${formatCryptoBalance(pnlCumulatives.fees.inToken)} ${
            netValue.netValueToken
          }`}
          secondColumn={formatUsdValue(pnlCumulatives.fees.inUsd)}
        />
      </Grid>
      {pnl && (
        <>
          <Card variant="vaultDetailsCardModal" sx={{ textAlign: 'center' }}>
            <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
              {t('omni-kit.content-card.net-value-modal.modal-value')}
            </Text>
            <Text as="p" variant="paragraph1" sx={{ fontWeight: 'regular' }}>
              {pnl.percentage.gte(zero) && '+'}
              {`${formatDecimalAsPercent(pnl.percentage)} / ${formatCryptoBalance(pnl.inToken)} ${
                netValue.netValueToken
              }`}
            </Text>
          </Card>

          <Text as="p" variant="paragraph3" sx={{ fontStyle: 'italic', color: 'neutral80' }}>
            {t('omni-kit.content-card.net-value-modal.modal-footnote-1')}
          </Text>
        </>
      )}
      <Text as="p" variant="paragraph3" sx={{ fontStyle: 'italic', color: 'neutral80' }}>
        {t('omni-kit.content-card.net-value-modal.modal-footnote-2')}
      </Text>
    </DetailsSectionContentSimpleModal>
  )
}
