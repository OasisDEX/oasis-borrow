import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/positions/common/components/AjnaPositionViewPlaceholders'
import { AjnaPositionView } from 'features/ajna/positions/common/views/AjnaPositionView'
import { AjnaEarnFormController } from 'features/ajna/positions/earn/controls/AjnaEarnFormController'
import { AjnaEarnOverviewController } from 'features/ajna/positions/earn/controls/AjnaEarnOverviewController'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function AjnaEarnPositionController() {
  const { t } = useTranslation()

  return (
    <AjnaPositionView
      headlineDetails={[
        // TODO: replace with data from library
        {
          label: t('ajna.position-page.earn.common.headline.current-yield'),
          value: '12.23%',
        },
        {
          label: t('ajna.position-page.earn.common.headline.90-day-avg'),
          value: '8.92',
        },
      ]}
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <AjnaEarnOverviewController />
            <AjnaEarnFormController />
          </Grid>
        ),
        info: <AjnaPositionViewInfoPlaceholder />,
        history: <AjnaPositionViewHistoryPlaceholder />,
      }}
    />
  )
}
