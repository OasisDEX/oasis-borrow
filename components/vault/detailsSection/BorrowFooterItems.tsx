import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

interface BorrowFooterItemsProps {
  token: string
  debt: BigNumber
  freeCollateral: BigNumber
  daiYieldFromLockedCollateral: BigNumber
}

export function BorrowFooterItems({
  token,
  debt,
  freeCollateral,
  daiYieldFromLockedCollateral,
}: BorrowFooterItemsProps) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  const formatted = {
    debt: `${formatAmount(debt, 'DAI')} DAI`,
    freeCollateral: `${formatAmount(freeCollateral, symbol)} ${symbol}`,
    daiYieldFromLockedCollateral: `${formatAmount(daiYieldFromLockedCollateral, 'DAI')} DAI`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.vault-dai-debt')}
        value={formatted.debt}
      />
      <DetailsSectionFooterItem
        title={t('system.available-to-withdraw')}
        value={formatted.freeCollateral}
      />
      <DetailsSectionFooterItem
        title={t('system.available-to-generate')}
        value={formatted.daiYieldFromLockedCollateral}
      />
    </>
  )
}
