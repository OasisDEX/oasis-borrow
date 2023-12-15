import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
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

interface OmniMultiplyNetValueModalProps {
  collateralPrice: BigNumber
  collateralToken: string
  cumulatives: {
    cumulativeDepositUSD: BigNumber
    cumulativeWithdrawUSD: BigNumber
    cumulativeFeesUSD: BigNumber
    cumulativeDeposit?: BigNumber
    cumulativeWithdraw?: BigNumber
    cumulativeFees?: BigNumber
  }
  netValue: BigNumber
  pnl?: BigNumber
  pnlUSD?: BigNumber
  theme?: Theme
  pnlInCollateralToken?: boolean
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
  collateralPrice,
  collateralToken,
  cumulatives,
  netValue,
  pnl,
  pnlUSD,
  theme,
  pnlInCollateralToken = false,
}: OmniMultiplyNetValueModalProps) {
  const { t } = useTranslation()

  const netValueInCollateralToken = netValue.div(collateralPrice)

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.net-value-modal.modal-title')}
      description={
        <Trans
          i18nKey="omni-kit.content-card.net-value-modal.modal-description"
          values={{ collateralPrice: formatCryptoBalance(collateralPrice) }}
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
          firstColumn={`${formatCryptoBalance(netValueInCollateralToken)} ${collateralToken}`}
          secondColumn={`$${formatUsdValue(netValue)}`}
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
            cumulatives.cumulativeDeposit
              ? cumulatives.cumulativeDeposit
              : cumulatives.cumulativeDepositUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={formatUsdValue(cumulatives.cumulativeDepositUSD)}
        />
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-3')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.cumulativeWithdraw
              ? cumulatives.cumulativeWithdraw
              : cumulatives.cumulativeWithdrawUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={formatUsdValue(cumulatives.cumulativeWithdrawUSD)}
        />
        <OmniMultiplyNetValueModalGridRow
          label={t('omni-kit.content-card.net-value-modal.modal-table-row-4')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.cumulativeFees
              ? cumulatives.cumulativeFees
              : cumulatives.cumulativeFeesUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={formatUsdValue(cumulatives.cumulativeFeesUSD)}
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
              {formatDecimalAsPercent(pnl)} /
              {pnlInCollateralToken && cumulatives.cumulativeDeposit
                ? ` ${formatCryptoBalance(
                    netValueInCollateralToken.minus(cumulatives.cumulativeDeposit),
                  )} ${collateralToken}`
                : ` ${formatUsdValue(pnlUSD)}`}
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
