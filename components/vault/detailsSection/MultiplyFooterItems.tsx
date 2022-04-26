import BigNumber from 'bignumber.js'
import { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { zero } from '../../../helpers/zero'

interface MultiplyFooterItemsProps {
  token: string
  afterDebt: BigNumber
  lockedCollateral?: BigNumber
  afterLockedCollateral: BigNumber
  afterMultiple: BigNumber
  changeVariant?: ChangeVariantType
  debt?: BigNumber
  multiple?: BigNumber
}

export function MultiplyFooterItems({
  token,
  debt,
  lockedCollateral,
  afterLockedCollateral,
  afterDebt,
  multiple,
  afterMultiple,
  changeVariant,
}: MultiplyFooterItemsProps) {
  const { t } = useTranslation()

  const formatted = {
    debt: `${formatAmount(debt || zero, 'DAI')} DAI`,
    afterDebt: `${formatAmount(afterDebt, 'DAI')} DAI`,
    lockedCollateral: `${formatAmount(lockedCollateral || zero, token)} ${token}`,
    afterLockedCollateral: `${formatAmount(afterLockedCollateral, token)} ${token}`,
    multiple: `${(multiple || zero).toFixed(2)}x`,
    afterMultiple: `${afterMultiple.toFixed(2)}x`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.vault-dai-debt')}
        value={formatted.debt}
        {...(changeVariant && { change: { value: formatted.afterDebt, variant: changeVariant } })}
      />
      <DetailsSectionFooterItem
        title={t('system.total-exposure', { token })}
        value={formatted.lockedCollateral}
        {...(changeVariant && {
          change: { value: formatted.afterLockedCollateral, variant: changeVariant },
        })}
      />
      <DetailsSectionFooterItem
        title={t('system.multiple')}
        value={formatted.multiple}
        {...(changeVariant && {
          change: { value: formatted.afterMultiple, variant: changeVariant },
        })}
      />
    </>
  )
}
