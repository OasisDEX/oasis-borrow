import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { AjnaEarnOverviewManage } from 'features/ajna/positions/earn/overview/AjnaEarnOverviewManage'
import { AjnaEarnOverviewOpen } from 'features/ajna/positions/earn/overview/AjnaEarnOverviewOpen'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaEarnOverviewController() {
  const {
    environment: { flow },
  } = useAjnaGeneralContext()

  return (
    <Grid gap={2}>
      {flow === 'open' && <AjnaEarnOverviewOpen />}
      {flow === 'manage' && <AjnaEarnOverviewManage />}
      <AjnaTokensBannerController />
    </Grid>
  )
}
