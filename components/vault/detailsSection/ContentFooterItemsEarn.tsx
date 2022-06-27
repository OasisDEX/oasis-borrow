import BigNumber from 'bignumber.js'
import { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnProps {
  token: string
  earn: BigNumber
  afterEarn: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentFooterItemsEarn({
  token,
  earn,
  afterEarn,
  changeVariant,
}: ContentFooterItemsEarnProps) {
  const { t } = useTranslation()

  const formatted = {
    breakeven: ``,
    entryfees: ``,
    apy: ``,
    afterBreakeven: ``,
    afterEntryfees: ``,
    afterApy: afterEarn?.toFixed(2),
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.est-break-even')}
        value={formatted.breakeven}
        {...(changeVariant && {
          change: {
            value: `${formatted.afterBreakeven} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
      <DetailsSectionFooterItem
        title={t('system.est-entry-fees')}
        value={formatted.entryfees}
        {...(changeVariant && {
          change: {
            value: `${formatted.afterEntryfees} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
      <DetailsSectionFooterItem
        title={t('system.apy')}
        value={`${formatted.apy}%`}
        {...(changeVariant && {
          change: {
            value: `${formatted.afterApy}x ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
    </>
  )
}
