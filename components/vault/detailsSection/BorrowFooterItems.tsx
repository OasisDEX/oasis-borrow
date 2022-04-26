import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

interface BorrowFooterItemsProps {
  token: string
  debt: BigNumber
  freeCollateral: BigNumber
  afterDebt: BigNumber
  afterFreeCollateral: BigNumber
  daiYieldFromLockedCollateral: BigNumber
  daiYieldFromTotalCollateral: BigNumber
  changeVariant?: ChangeVariantType
}

export function BorrowFooterItems({
  token,
  debt,
  freeCollateral,
  afterDebt,
  afterFreeCollateral,
  daiYieldFromLockedCollateral,
  daiYieldFromTotalCollateral,
  changeVariant,
}: BorrowFooterItemsProps) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  const formatted = {
    debt: `${formatAmount(debt, 'DAI')} DAI`,
    freeCollateral: `${formatAmount(freeCollateral, symbol)} ${symbol}`,
    afterDebt: `${formatAmount(afterDebt, 'DAI')} DAI`,
    afterFreeCollateral: `${formatAmount(
      !afterFreeCollateral.isNegative() ? afterFreeCollateral : zero,
      symbol,
    )} ${symbol}`,
    daiYieldFromLockedCollateral: `${formatAmount(daiYieldFromLockedCollateral, 'DAI')} DAI`,
    daiYieldFromTotalCollateral: `${formatAmount(
      !daiYieldFromTotalCollateral.isNegative() ? daiYieldFromTotalCollateral : zero,
      'DAI',
    )} DAI`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.vault-dai-debt')}
        value={formatted.debt}
        {...(changeVariant && { change: { value: `${formatted.afterDebt} ${t('system.cards.common.after')}`, variant: changeVariant } })}
      />
      <DetailsSectionFooterItem
        title={t('system.available-to-withdraw')}
        value={formatted.freeCollateral}
        {...(changeVariant && {
          change: { value: `${formatted.afterFreeCollateral} ${t('system.cards.common.after')}`, variant: changeVariant },
        })}
      />
      <DetailsSectionFooterItem
        title={t('system.available-to-generate')}
        value={formatted.daiYieldFromLockedCollateral}
        {...(changeVariant && {
          change: { value: `${formatted.daiYieldFromTotalCollateral} ${t('system.cards.common.after')}`, variant: changeVariant },
        })}
      />
    </>
  )
}
