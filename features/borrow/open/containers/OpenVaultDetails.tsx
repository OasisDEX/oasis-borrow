import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardCollateralLocked } from 'components/vault/detailsSection/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentFooterItemsBorrow } from 'components/vault/detailsSection/ContentFooterItemsBorrow'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenVaultState } from '../pipes/openVault'

export function OpenVaultDetails(props: OpenVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    generateAmount,
    afterFreeCollateral,
    maxGenerateAmountCurrentPrice,
    token,
    inputAmountsEmpty,
    stage,
    ilkData: { liquidationRatio },
  } = props
  const { t } = useTranslation()

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero
  const collateralizationRatio = zero

  const afterDepositAmountUSD = props.depositAmountUSD
  const depositAmountUSD = zero

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const daiYieldFromTotalCollateral = maxGenerateAmountCurrentPrice.minus(generateAmount || zero)

  return (
    <>
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
            <ContentCardCollateralizationRatio
              collateralizationRatio={collateralizationRatio}
              afterCollateralizationRatio={afterCollateralizationRatio}
              changeVariant={changeVariant}
            />
            <ContentCardCollateralLocked
              token={token}
              lockedCollateralUSD={depositAmountUSD}
              afterLockedCollateralUSD={afterDepositAmountUSD}
              changeVariant={changeVariant}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              token={token}
              debt={zero}
              freeCollateral={zero}
              afterDebt={generateAmount || zero}
              afterFreeCollateral={afterFreeCollateral}
              daiYieldFromLockedCollateral={zero}
              daiYieldFromTotalCollateral={daiYieldFromTotalCollateral}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
    </>
  )
}
