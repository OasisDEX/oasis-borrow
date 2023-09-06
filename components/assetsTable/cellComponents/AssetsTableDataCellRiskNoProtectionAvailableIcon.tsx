import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'theme-ui'

export function AssetsTableDataCellRiskNoProtectionAvailableIcon() {
  const { t } = useTranslation()

  return (
    <Button
      variant="action"
      sx={{
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    >
      {t('discover.table.unavailable')}
    </Button>
  )
}
