import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex, Grid, Text } from 'theme-ui'

interface AjnaContentCardNetValueProps extends OmniContentCardCommonProps {
  netValue: BigNumber
  position: AjnaPosition
  collateralPrice: BigNumber
  collateralToken: string
}

function NetValueModalGridRow({
  label,
  firstColumn,
  secondColumn,
}: {
  label: string
  firstColumn: string
  secondColumn: string
}) {
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

export function AjnaContentCardNetValueModal({
  netValue,
  position,
  collateralPrice,
  collateralToken,
}: AjnaContentCardNetValueProps) {
  const { t } = useTranslation()
  const {
    pnl: { cumulatives, withoutFees, withFees },
  } = position
  return (
    <Grid gap={2}>
      <Text variant="paragraph3">
        {`${t('ajna.position-page.common.net-value-pnl-modal.net-value-pnl-based-on-price')}`}
        &nbsp;
        <Text as="span" variant="boldParagraph2">{`$${formatAmount(collateralPrice, 'USD')}`}</Text>
      </Text>
      <Grid gap={2} columns="repeat(3, 1fr)">
        <Flex />
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text variant="paragraph4" color="neutral80">
            {t('ajna.position-page.common.net-value-pnl-modal.collateral-value')}
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text variant="paragraph4" color="neutral80">
            {t('ajna.position-page.common.net-value-pnl-modal.usd-value')}
          </Text>
        </Flex>

        <NetValueModalGridRow
          label={t('ajna.position-page.common.net-value-pnl-modal.net-value')}
          firstColumn={`${formatCryptoBalance(netValue.div(collateralPrice))} ${collateralToken}`}
          secondColumn={`$${formatAmount(netValue, 'USD')}`}
        />
      </Grid>
      <Divider />
      <Grid gap={2} columns="repeat(3, 1fr)">
        <NetValueModalGridRow
          label={t('ajna.position-page.common.net-value-pnl-modal.deposits')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.borrowCumulativeDepositUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={`$${formatAmount(cumulatives.borrowCumulativeDepositUSD, 'USD')}`}
        />
        <NetValueModalGridRow
          label={t('ajna.position-page.common.net-value-pnl-modal.withdrawals')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.borrowCumulativeWithdrawUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={`$${formatAmount(cumulatives.borrowCumulativeWithdrawUSD, 'USD')}`}
        />
        <NetValueModalGridRow
          label={t('ajna.position-page.common.net-value-pnl-modal.gas-fees-spent')}
          firstColumn={`${formatCryptoBalance(
            cumulatives.borrowCumulativeFeesUSD.div(collateralPrice),
          )} ${collateralToken}`}
          secondColumn={`$${formatAmount(cumulatives.borrowCumulativeFeesUSD, 'USD')}`}
        />
      </Grid>
      <Flex
        sx={{
          backgroundColor: 'neutral30',
          borderRadius: 'large',
          flexDirection: 'column',
          p: 2,
          my: 3,
          textAlign: 'center',
        }}
      >
        <Text variant="paragraph4" color="neutral80">
          {t('ajna.position-page.common.net-value-pnl-modal.unrealised-pnl')}
        </Text>
        <Text variant="paragraph1">
          {formatPercent(withFees.div(netValue), {
            plus: true,
            precision: 2,
          })}{' '}
          / ${formatAmount(withFees, 'USD')}
        </Text>
      </Flex>
      <Flex
        sx={{
          flexDirection: 'column',
        }}
      >
        <Text variant="paragraph3" sx={{ fontStyle: 'italic', mb: 3 }} color="neutral80">
          {t('ajna.position-page.common.net-value-pnl-modal.formula')}
        </Text>
        <Text variant="paragraph3" sx={{ fontStyle: 'italic' }} color="neutral80">
          {t('ajna.position-page.common.net-value-pnl-modal.note')}
        </Text>
      </Flex>
    </Grid>
  )
}
