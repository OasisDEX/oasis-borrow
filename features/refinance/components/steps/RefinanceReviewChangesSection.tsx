import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatLtvDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export const RefinanceReviewChangesSection = () => {
  const { t } = useTranslation()

  const ltv = new BigNumber(0.6)
  const afterLtv = new BigNumber(0.7)
  const liquidationPrice = new BigNumber(1235)
  const afterLiquidationPrice = new BigNumber(1335)
  const debt = new BigNumber(12000)
  const afterDebt = new BigNumber(14000)
  const primaryToken = 'ETH'
  const afterSecondaryToken = 'USDC'

  const ltvChange = afterLtv.minus(ltv).div(ltv)
  const liquidationPriceChange = afterLiquidationPrice.minus(liquidationPrice).div(liquidationPrice)

  const formatted = {
    ltv: formatLtvDecimalAsPercent(ltv),
    afterLtv: formatLtvDecimalAsPercent(afterLtv),
    ltvChange: formatLtvDecimalAsPercent(ltvChange),
    liquidationPrice: formatCryptoBalance(liquidationPrice),
    afterLiquidationPrice: formatCryptoBalance(afterLiquidationPrice),
    liquidationPriceChange: formatDecimalAsPercent(liquidationPriceChange),
    debt: (
      <ItemValueWithIcon tokens={[primaryToken]}>{formatCryptoBalance(debt)}</ItemValueWithIcon>
    ),
    afterDebt: (
      <ItemValueWithIcon tokens={[afterSecondaryToken]}>
        {formatCryptoBalance(afterDebt)}
      </ItemValueWithIcon>
    ),
  }

  return (
    <InfoSection
      items={[
        {
          label: t('refinance.sidebar.whats-changing.review-all-changes'),
          dropdownValues: [
            {
              label: t('system.liq-price-short'),
              value: formatted.liquidationPrice,
              change: formatted.afterLiquidationPrice,
              secondary: {
                value: formatted.liquidationPriceChange,
                variant: liquidationPriceChange.isPositive() ? 'positive' : 'negative',
              },
            },
            {
              label: t('system.ltv-short'),
              value: formatted.ltv,
              change: formatted.afterLtv,
              secondary: {
                value: formatted.ltvChange,
                variant: ltvChange.isPositive() ? 'negative' : 'positive',
              },
            },
            {
              label: t('system.debt'),
              value: formatted.debt,
              change: formatted.afterDebt,
            },
            {
              label: t('system.automations'),
              value: 'On',
              change: (
                <Text as="span" sx={{ color: 'critical100' }}>
                  Off
                </Text>
              ),
            },
          ],
        },
      ]}
      withListPadding={false}
      wrapperSx={{ backgroundColor: 'unset' }}
    />
  )
}
