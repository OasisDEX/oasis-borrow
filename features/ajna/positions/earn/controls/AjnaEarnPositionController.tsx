import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/positions/common/components/AjnaPositionViewPlaceholders'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaPositionView } from 'features/ajna/positions/common/views/AjnaPositionView'
import { AjnaEarnFormController } from 'features/ajna/positions/earn/controls/AjnaEarnFormController'
import { AjnaEarnOverviewController } from 'features/ajna/positions/earn/controls/AjnaEarnOverviewController'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function AjnaEarnPositionController() {
  const { t } = useTranslation()
  const {
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('earn')

  return (
    <AjnaPositionView
      headlineDetails={[
        {
          label: t('ajna.position-page.earn.common.headline.current-yield'),
          value: position.poolApy.per7d ? formatDecimalAsPercent(position.poolApy.per7d) : '-',
        },
        {
          label: t('ajna.position-page.earn.common.headline.90-day-avg'),
          value: position.poolApy.per90d ? formatDecimalAsPercent(position.poolApy.per90d) : '-',
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
