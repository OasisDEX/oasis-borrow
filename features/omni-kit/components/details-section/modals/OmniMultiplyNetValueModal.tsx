import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import type { Theme } from 'theme-ui'
import { Box, Card, Divider, Flex, Grid, Text } from 'theme-ui'

interface OmniMultiplyNetValueModalProps {
  netValueTokenPrice: BigNumber
  netValueToken: string
  cumulatives: {
    cumulativeDepositUSD: BigNumber
    cumulativeWithdrawUSD: BigNumber
    cumulativeFeesUSD: BigNumber
    cumulativeDepositInQuoteToken?: BigNumber
  }
  netValueUSD: BigNumber
  pnl?: BigNumber
  pnlUSD?: BigNumber
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
  netValueTokenPrice,
  netValueToken,
  cumulatives,
  netValueUSD,
  pnl,
  pnlUSD,
  theme,
}: OmniMultiplyNetValueModalProps) {
  const { t } = useTranslation()

  const netValueInCollateralToken = netValueUSD.div(netValueTokenPrice)

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.net-value-modal.modal-title')}
      description={
        <Trans
          i18nKey="omni-kit.content-card.net-value-modal.modal-description"
          values={{ netValueTokenPrice: formatCryptoBalance(netValueTokenPrice) }}
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
          firstColumn={`${formatCryptoBalance(netValueInCollateralToken)} ${netValueToken}`}
          secondColumn={`$${formatCryptoBalance(netValueUSD)}`}
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
          firstColumn={`${formatCryptoBalance(
            cumulatives.cumulativeDepositUSD.div(netValueTokenPrice),
          )} ${netValueToken}`}
          secondColumn={`$${formatCryptoBalance(cumulatives.cumulativeDepositUSD)}`}
        />
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-3')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.cumulativeWithdrawUSD.div(netValueTokenPrice),
          )} ${netValueToken}`}
          secondColumn={`$${formatCryptoBalance(cumulatives.cumulativeWithdrawUSD)}`}
        />
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-4')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.cumulativeFeesUSD.div(netValueTokenPrice),
          )} ${netValueToken}`}
          secondColumn={`$${formatCryptoBalance(cumulatives.cumulativeFeesUSD)}`}
        />
      </Grid>
      {pnlUSD && pnl && (
        <>
          <Card variant="vaultDetailsCardModal" sx={{ textAlign: 'center' }}>
            <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
              {t('omni-kit.content-card.net-value-modal.modal-value')}
            </Text>
            <Text as="p" variant="paragraph1" sx={{ fontWeight: 'regular' }}>
              {pnlUSD.gte(zero) && '+'}
              {formatDecimalAsPercent(pnl)} /{` $${formatCryptoBalance(pnlUSD)}`}
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
