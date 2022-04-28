import BigNumber from 'bignumber.js'
import { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsMultiplyProps {
  token: string
  debt: BigNumber
  lockedCollateral: BigNumber
  multiply: BigNumber
  afterDebt: BigNumber
  afterLockedCollateral: BigNumber
  afterMultiply: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentFooterItemsMultiply({
  token,
  debt,
  lockedCollateral,
  multiply,
  afterDebt,
  afterLockedCollateral,
  afterMultiply,
  changeVariant,
}: ContentFooterItemsMultiplyProps) {
  const { t } = useTranslation()

  const formatted = {
    debt: `${formatAmount(debt, 'DAI')} DAI`,
    lockedCollateral: `${formatCryptoBalance(lockedCollateral)} ${token}`,
    multiply: multiply?.toFixed(2),
    afterDebt: `${formatAmount(afterDebt, 'DAI')} DAI`,
    afterLockedCollateral: `${formatCryptoBalance(afterLockedCollateral)} ${token}`,
    afterMultiply: afterMultiply?.toFixed(2),
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.vault-dai-debt')}
        value={formatted.debt}
        {...(changeVariant && {
          change: {
            value: `${formatted.afterDebt} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
      <DetailsSectionFooterItem
        title={t('system.total-collateral')}
        value={formatted.lockedCollateral}
        {...(changeVariant && {
          change: {
            value: `${formatted.afterLockedCollateral} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
      <DetailsSectionFooterItem
        title={t('system.multiple')}
        value={`${formatted.multiply}x ${t('system.exposure')}`}
        {...(changeVariant && {
          change: {
            value: `${formatted.afterMultiply}x ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
    </>
  )
}
