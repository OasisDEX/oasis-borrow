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
import { Box } from 'theme-ui'

import { ContentCardEarningsToDate } from '../../../../../components/vault/detailsSection/ContentCardEarningsToDate'
import { ContentCardNetAPY } from '../../../../../components/vault/detailsSection/ContentCardNetAPY'

import { ManageEarnVaultState } from '../pipes/manageGuniVault'

export function GuniManageMultiplyVaultDetails(props: ManageEarnVaultState) {
  const { t } = useTranslation()
  const {
    vault: { debt, token, lockedCollateral, lockedCollateralUSD },
    inputAmountsEmpty,
    stage,
    netValueUSD,
    afterNetValueUSD,
    currentPnL,
    totalGasSpentUSD,
    priceInfo,
    marketPrice,
    multiply,
    afterDebt,
    afterLockedCollateral,
    afterMultiply,
    earningsToDate,
    earningsToDateAfterFees,
    netAPY,
  } = props
  const afterCollRatioColor = 'onSuccess'
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const oraclePrice = priceInfo.currentCollateralPrice
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined

  return (
    <Box>
      (
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardNetValue
              token={token}
              oraclePrice={oraclePrice}
              marketPrice={marketPrice}
              netValueUSD={netValueUSD}
              afterNetValueUSD={afterNetValueUSD}
              totalGasSpentUSD={totalGasSpentUSD}
              currentPnL={currentPnL}
              lockedCollateral={lockedCollateral}
              lockedCollateralUSD={lockedCollateralUSD}
              debt={debt}
              changeVariant={changeVariant}
            />
            <ContentCardEarningsToDate
              earningsToDate={earningsToDate}
              earningsToDateAfterFees={earningsToDateAfterFees}
            />

            <ContentCardNetAPY netAPY={netAPY} />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsMultiply
              token={token}
              debt={debt}
              lockedCollateral={lockedCollateral}
              multiply={multiply}
              afterDebt={afterDebt}
              afterLockedCollateral={afterLockedCollateral}
              afterMultiply={afterMultiply}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      )
    </Box>
  )
}
