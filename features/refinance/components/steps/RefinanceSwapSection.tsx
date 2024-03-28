import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceSwapSection = () => {
  const { t } = useTranslation()

  const primaryToken = 'ETH'
  const afterPrimaryToken = 'ETH'
  const secondaryToken = 'DAI'
  const afterSecondaryToken = 'USDC'

  const priceImpact = new BigNumber(0.001)
  const slippage = new BigNumber(0.005)
  const fee = new BigNumber(12)

  const formatted = {
    collateralAsset: <ItemValueWithIcon tokens={[primaryToken]}>{primaryToken}</ItemValueWithIcon>,
    afterCollateralAsset: (
      <ItemValueWithIcon tokens={[afterPrimaryToken]}>{afterPrimaryToken}</ItemValueWithIcon>
    ),
    debtAsset: <ItemValueWithIcon tokens={[secondaryToken]}>{secondaryToken}</ItemValueWithIcon>,
    afterDebtAsset: (
      <ItemValueWithIcon tokens={[afterSecondaryToken]}>{afterSecondaryToken}</ItemValueWithIcon>
    ),
    priceImpact: formatDecimalAsPercent(priceImpact),
    slippage: formatDecimalAsPercent(slippage),
    fee: `$${formatFiatBalance(fee)}`,
  }

  return (
    <InfoSection
      items={[
        {
          label: t('system.swap'),
          dropdownValues: [
            {
              label: t('system.debt-asset'),
              value: formatted.debtAsset,
              change: formatted.afterDebtAsset,
            },
            {
              label: t('system.price-impact'),
              value: formatted.priceImpact,
            },
            {
              label: t('system.slippage'),
              value: formatted.slippage,
            },
            {
              label: t('system.fee'),
              value: formatted.fee,
            },
          ],
        },
      ]}
      withListPadding={false}
      wrapperSx={{ backgroundColor: 'unset' }}
    />
  )
}
