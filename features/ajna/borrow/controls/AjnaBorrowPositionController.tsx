import { AjnaBorrowFormController } from 'features/ajna/borrow/controls/AjnaBorrowFormController'
import { AjnaBorrowOverviewController } from 'features/ajna/borrow/controls/AjnaBorrowOverviewController'
import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/common/components/AjnaPositionViewPlaceholders'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { AjnaPositionView } from 'features/ajna/common/views/AjnaPositionView'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function AjnaBorrowPositionController() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useAjnaGeneralContext()

  return (
    <AjnaPositionView
      headlineDetails={[
        {
          label: t('ajna.borrow.common.headline.current-market-price', { collateralToken }),
          value: `${formatCryptoBalance(
            collateralPrice.dividedBy(quotePrice),
          )} ${collateralToken}/${quoteToken}`,
        },
      ]}
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <AjnaBorrowOverviewController />
            <AjnaBorrowFormController />
          </Grid>
        ),
        info: <AjnaPositionViewInfoPlaceholder />,
        history: <AjnaPositionViewHistoryPlaceholder />,
      }}
    />
  )
}
