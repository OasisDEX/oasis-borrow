import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardNetValue } from 'components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { zero } from '../../../../../helpers/zero'
import { OpenGuniVaultState } from '../pipes/openGuniVault'

export function GuniOpenMultiplyVaultDetails(props: OpenGuniVaultState) {
  const { t } = useTranslation()
  const {
    token,
    afterNetValueUSD,
    inputAmountsEmpty,
    stage,
    priceInfo,
    afterOutstandingDebt,
    totalCollateral,
    multiply,
  } = props

  const afterCollRatioColor = 'onSuccess'
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const oraclePrice = priceInfo.currentCollateralPrice
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined

  return (
    <>
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardNetValue
              token={token}
              oraclePrice={oraclePrice}
              afterNetValueUSD={afterNetValueUSD}
              changeVariant={changeVariant}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsMultiply
              token={token}
              debt={zero}
              lockedCollateral={zero}
              multiply={zero}
              afterDebt={afterOutstandingDebt}
              afterLockedCollateral={totalCollateral}
              afterMultiply={multiply}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
    </>
  )
}
