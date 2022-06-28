import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { BasicBuyDetailsLayout } from 'features/automation/optimization/controls/BasicBuyDetailsLayout'
import { PriceInfo } from 'features/shared/priceInfo'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicBuyDetailsControlProps {
  token: string
  basicBuyTriggerData: BasicBSTriggerData
  priceInfo: PriceInfo
}

export function BasicBuyDetailsControl({
  token,
  basicBuyTriggerData,
  priceInfo,
}: BasicBuyDetailsControlProps) {
  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice } = basicBuyTriggerData

  return (
    <Grid>
      <BasicBuyDetailsLayout
        token={token}
        triggerColRatio={execCollRatio}
        nextBuyPrice={priceInfo.nextCollateralPrice}
        targetColRatio={targetCollRatio}
        threshold={maxBuyOrMinSellPrice}
        basicBuyTriggerData={basicBuyTriggerData}
      />
    </Grid>
  )
}
