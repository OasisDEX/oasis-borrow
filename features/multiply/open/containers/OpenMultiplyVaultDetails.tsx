import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { DetailsSection } from '../../../../components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from '../../../../components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from '../../../../components/DetailsSectionFooterItem'
import { ContentCardBuyingPower } from '../../../../components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardLiquidationPrice } from '../../../../components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from '../../../../components/vault/detailsSection/ContentCardNetValue'
import { OpenMultiplyVaultState } from '../pipes/openMultiplyVault'

export function OpenMultiplyVaultDetails(props: OpenMultiplyVaultState) {
  const {
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterBuyingPowerUSD,
    afterNetValueUSD,
    token,
    inputAmountsEmpty,
    stage,
    marketPrice,
    priceInfo,
    ilkData: { liquidationRatio },
    afterOutstandingDebt,
    totalExposure,
    multiply,
  } = props
  const { t } = useTranslation()

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero
  const buyingPowerUSD = zero

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice

  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardLiquidationPrice
            liquidationPrice={liquidationPrice}
            liquidationRatio={liquidationRatio}
            afterLiquidationPrice={afterLiquidationPrice}
            changeVariant={changeVariant}
          />
          <ContentCardBuyingPower
            token={token}
            buyingPowerUSD={buyingPowerUSD}
            afterBuyingPowerUSD={afterBuyingPowerUSD}
            changeVariant={changeVariant}
          />
          <ContentCardNetValue
            token={token}
            oraclePrice={oraclePrice}
            marketPrice={marketPrice}
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
            afterLockedCollateral={totalExposure}
            afterMultiply={multiply}
            changeVariant={changeVariant}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
