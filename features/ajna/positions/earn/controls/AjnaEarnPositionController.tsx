import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFaqController } from 'features/ajna/positions/common/controls/AjnaFaqController'
import { AjnaPositionHistoryController } from 'features/ajna/positions/common/controls/AjnaPositionHistoryController'
import { AjnaPositionView } from 'features/ajna/positions/common/views/AjnaPositionView'
import { AjnaEarnFormController } from 'features/ajna/positions/earn/controls/AjnaEarnFormController'
import { AjnaEarnOverviewController } from 'features/ajna/positions/earn/controls/AjnaEarnOverviewController'
import en from 'features/content/faqs/ajna/earn/en'
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
          value: position.pool.lendApr ? formatDecimalAsPercent(position.pool.lendApr) : '-',
        },
        {
          label: t('ajna.position-page.earn.common.headline.30-day-avg'),
          value: position.poolApy.per30d
            ? formatDecimalAsPercent(position.pool.apr30dAverage)
            : '-',
        },
      ]}
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <AjnaEarnOverviewController />
            <AjnaEarnFormController />
          </Grid>
        ),
        info: <AjnaFaqController content={{ en }} />,
        history: <AjnaPositionHistoryController />,
      }}
    />
  )
}
