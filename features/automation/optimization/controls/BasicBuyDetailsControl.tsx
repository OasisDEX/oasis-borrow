import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { BasicBuyDetailsLayout } from 'features/automation/optimization/controls/BasicBuyDetailsLayout'
import { PriceInfo } from 'features/shared/priceInfo'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicBuyDetailsControlProps {
  vault: Vault
  basicBuyTriggerData: BasicBSTriggerData
  priceInfo: PriceInfo
}

export function BasicBuyDetailsControl({
  vault,
  basicBuyTriggerData,
  priceInfo,
}: BasicBuyDetailsControlProps) {
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice } = basicBuyTriggerData
  const isDebtZero = vault.debt.isZero()

  if (readOnlyBasicBSEnabled) {
    return null
  }

  if (isDebtZero) {
    return null
  }

  return (
    <Grid>
      <BasicBuyDetailsLayout
        token={vault.token}
        triggerColRatio={execCollRatio}
        nextBuyPrice={priceInfo.nextCollateralPrice}
        targetColRatio={targetCollRatio}
        threshold={maxBuyOrMinSellPrice}
        basicBuyTriggerData={basicBuyTriggerData}
      />
    </Grid>
  )
}
