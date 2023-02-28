import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/common/components/AjnaPositionViewPlaceholders'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { AjnaPositionView } from 'features/ajna/common/views/AjnaPositionView'
import { AjnaEarnFormController } from 'features/ajna/earn/controls/AjnaEarnFormController'
import { AjnaEarnOverviewController } from 'features/ajna/earn/controls/AjnaEarnOverviewController'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function AjnaEarnPositionController() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
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
        {
          label: t('ajna.borrow.common.headline.current-market-price', { collateralToken }),
          value: `${formatCryptoBalance(
            quotePrice.dividedBy(collateralPrice),
          )} ${quoteToken}/${collateralToken}`,
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
