import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/positions/common/components/AjnaPositionViewPlaceholders'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
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
    environment: { collateralToken },
  } = useAjnaGeneralContext()
  const {
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('earn')

  const apy7Days = position.getApyPerDays({
    amount: position.pool.depositSize,
    days: 7,
  })

  const apy90Days = position.getApyPerDays({
    amount: position.pool.depositSize,
    days: 90,
  })

  return (
    <AjnaPositionView
      headlineDetails={[
        {
          label: t('ajna.earn.common.headline.current-yield', { collateralToken }),
          value: apy7Days ? formatDecimalAsPercent(apy7Days) : '-',
        },
        {
          label: t('ajna.earn.common.headline.90-day-avg', { collateralToken }),
          value: apy90Days ? formatDecimalAsPercent(apy90Days) : '-',
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
