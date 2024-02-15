import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
// import { ContentFooterItemsEarnSimulate } from 'components/vault/detailsSection/ContentFooterItemsEarnSimulate'
// import { useOmniProductContext } from 'features/omni-kit/contexts'
// import { OmniProductType } from 'features/omni-kit/types'
// import { formatPercent } from 'helpers/formatters/format'
// import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function SimpleEarnFooter({ breakevenAnnotation }: { breakevenAnnotation?: string }) {
  const { t } = useTranslation()
  const {
    position: {
      currentPosition: {
        position: { apy },
      },
    },
  } = useOmniProductContext(OmniProductType.Earn)
  const formatted = {
    // breakeven: breakeven.gt(zero) ? breakeven.toFixed(0, BigNumber.ROUND_UP) : '1',
    // entryFees: entryFees.gt(zero) ? `${formatCryptoBalance(entryFees)} ${token}` : '-',
    apy: formatPercent(apy.per365d || zero, { precision: 2 }),
  }
  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.est-break-even')}
        value={`${t('system.est-break-even-value', { days: 'formatted.breakeven' })}${
          breakevenAnnotation ? ` (${breakevenAnnotation})` : ''
        }`}
      />
      <DetailsSectionFooterItem title={t('system.est-entry-fees')} value={'formatted.entryFees'} />
      <DetailsSectionFooterItem title={t('system.apy')} value={formatted.apy} />
    </>
  )
}
