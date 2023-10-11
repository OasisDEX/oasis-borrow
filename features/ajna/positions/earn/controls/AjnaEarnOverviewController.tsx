import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { AjnaEarnOverviewManageController } from 'features/ajna/positions/earn/controls/AjnaEarnOverviewManageController'
import { AjnaEarnOverviewOpenController } from 'features/ajna/positions/earn/controls/AjnaEarnOverviewOpenController'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaEarnOverviewController() {
  const {
    environment: { collateralToken, flow, quoteToken },
  } = useProtocolGeneralContext()
  const {
    position: {
      currentPosition: {
        position: { pool, price },
      },
    },
  } = useAjnaProductContext('earn')

  const isPriceBelowLup =
    price.lt(pool.lowestUtilizedPrice) && !pool.lowestUtilizedPriceIndex.isZero()

  return (
    <Grid gap={2}>
      {flow === 'open' && <AjnaEarnOverviewOpenController />}
      {flow === 'manage' && <AjnaEarnOverviewManageController />}
      {isPoolWithRewards({ collateralToken, quoteToken }) && (
        <AjnaTokensBannerController flow={flow} isPriceBelowLup={isPriceBelowLup} />
      )}
    </Grid>
  )
}
