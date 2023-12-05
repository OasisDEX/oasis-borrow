import type { AjnaCumulativesData } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Box, Card, Divider, Flex, Grid, Text } from 'theme-ui'

interface AjnaCardDataNetValueLendingModalProps {
  collateralPrice: BigNumber
  collateralToken: string
  cumulatives: AjnaCumulativesData
  netValue: BigNumber
  pnl?: BigNumber
  pnlUSD?: BigNumber
}

interface AjnaCardDataNetValueLendingModalGridRowProps {
  firstColumn: string
  label: string
  secondColumn: string
}

function AjnaCardDataNetValueLendingModalGridRow({
  firstColumn,
  label,
  secondColumn,
}: AjnaCardDataNetValueLendingModalGridRowProps) {
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

export function AjnaCardDataNetValueLendingModal({
  collateralPrice,
  collateralToken,
  cumulatives,
  netValue,
  pnl,
  pnlUSD,
}: AjnaCardDataNetValueLendingModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('ajna.content-card.net-value.modal-title')}
      description={
        <Trans
          i18nKey="ajna.content-card.net-value.modal-description"
          values={{ collateralPrice: formatCryptoBalance(collateralPrice) }}
          components={{ strong: <Text sx={{ fontWeight: 'semiBold' }} /> }}
        />
      }
      theme={ajnaExtensionTheme}
    >
      <Grid
        sx={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'end',
          justifyItems: 'end',
          gap: 2,
        }}
      >
        <Box as="span" />
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          {t('ajna.content-card.net-value.modal-table-col-1')}
        </Text>
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          {t('ajna.content-card.net-value.modal-table-col-2')}
        </Text>
        <AjnaCardDataNetValueLendingModalGridRow
          label={t('ajna.content-card.net-value.modal-table-row-1')}
          firstColumn={`${formatCryptoBalance(netValue.div(collateralPrice))} ${collateralToken}`}
          secondColumn={`$${formatCryptoBalance(netValue)}`}
        />
      </Grid>
      <Divider />
      <Grid
        sx={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'end',
          justifyItems: 'end',
          gap: 2,
        }}
      >
        <AjnaCardDataNetValueLendingModalGridRow
          label={t('ajna.content-card.net-value.modal-table-row-2')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.borrowCumulativeDepositUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={`$${formatCryptoBalance(cumulatives.borrowCumulativeDepositUSD)}`}
        />
        <AjnaCardDataNetValueLendingModalGridRow
          label={t('ajna.content-card.net-value.modal-table-row-3')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.borrowCumulativeWithdrawUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={`$${formatCryptoBalance(cumulatives.borrowCumulativeWithdrawUSD)}`}
        />
        <AjnaCardDataNetValueLendingModalGridRow
          label={t('ajna.content-card.net-value.modal-table-row-4')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.borrowCumulativeFeesUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={`$${formatCryptoBalance(cumulatives.borrowCumulativeFeesUSD)}`}
        />
      </Grid>
      {pnlUSD && pnl && (
        <>
          <Card variant="vaultDetailsCardModal" sx={{ textAlign: 'center' }}>
            <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
              {t('ajna.content-card.net-value.modal-value')}
            </Text>
            <Text as="p" variant="paragraph1" sx={{ fontWeight: 'regular' }}>
              {pnlUSD.gte(zero) ? '+' : '-'}
              {formatDecimalAsPercent(pnl)} / ${formatCryptoBalance(pnlUSD)}
            </Text>
          </Card>

          <Text as="p" variant="paragraph3" sx={{ fontStyle: 'italic', color: 'neutral80' }}>
            {t('ajna.content-card.net-value.modal-footnote-1')}
          </Text>
        </>
      )}
      <Text as="p" variant="paragraph3" sx={{ fontStyle: 'italic', color: 'neutral80' }}>
        {t('ajna.content-card.net-value.modal-footnote-2')}
      </Text>
    </DetailsSectionContentSimpleModal>
  )
}
