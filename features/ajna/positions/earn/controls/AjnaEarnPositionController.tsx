import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/positions/common/components/AjnaPositionViewPlaceholders'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaPositionView } from 'features/ajna/positions/common/views/AjnaPositionView'
import { AjnaEarnFormController } from 'features/ajna/positions/earn/controls/AjnaEarnFormController'
import { AjnaEarnOverviewController } from 'features/ajna/positions/earn/controls/AjnaEarnOverviewController'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function AjnaEarnPositionController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken },
  } = useAjnaGeneralContext()

  return (
    <AjnaPositionView
      headlineDetails={[
        // TODO: replace with data from library
        {
          label: t('ajna.earn.common.headline.current-yield', { collateralToken }),
          value: '12.23%',
        },
        {
          label: t('ajna.earn.common.headline.90-day-avg', { collateralToken }),
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
