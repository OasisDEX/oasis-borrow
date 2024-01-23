import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function SimpleEarnOverview() {
  const { t } = useTranslation()
  const {
    position: {
      currentPosition: { simulation, position },
    },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Earn)
  const {
    environment: { collateralToken },
  } = useOmniGeneralContext()
  const positionValue = position || simulation
  const apy = positionValue?.apy

  const calcs = depositAmount
    ? {
        per30d: apy?.per30d?.div(100).times(depositAmount),
        per30dNetValue: apy?.per30d?.div(100).times(depositAmount).plus(depositAmount),
        per90d: apy?.per90d?.div(100).times(depositAmount),
        per90dNetValue: apy?.per90d?.div(100).times(depositAmount).plus(depositAmount),
        per365d: apy?.per365d?.div(100).times(depositAmount),
        per365dNetValue: apy?.per365d?.div(100).times(depositAmount).plus(depositAmount),
      }
    : {}
  return (
    <DetailsSectionContentTable
      headers={[
        t('earn-vault.simulate.header1'),
        t('earn-vault.simulate.header2'),
        t('earn-vault.simulate.header3'),
      ]}
      rows={[
        [
          t('earn-vault.simulate.rowlabel1'),
          calcs.per30d ? `${formatCryptoBalance(calcs.per30d)} ${collateralToken}` : '-',
          calcs.per30dNetValue
            ? `${formatCryptoBalance(calcs.per30dNetValue)} ${collateralToken}`
            : '-',
        ],
        [
          t('earn-vault.simulate.rowlabel2'),
          calcs.per90d ? `${formatCryptoBalance(calcs.per90d)} ${collateralToken}` : '-',
          calcs.per90dNetValue
            ? `${formatCryptoBalance(calcs.per90dNetValue)} ${collateralToken}`
            : '-',
        ],
        [
          t('earn-vault.simulate.rowlabel3'),
          calcs.per365d ? `${formatCryptoBalance(calcs.per365d)} ${collateralToken}` : '-',
          calcs.per365dNetValue
            ? `${formatCryptoBalance(calcs.per365dNetValue)} ${collateralToken}`
            : '-',
        ],
      ]}
      footnote={<>{t('earn-vault.simulate.footnote1')}</>}
    />
  )
}
