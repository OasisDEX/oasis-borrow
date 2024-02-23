import { Icon } from 'components/Icon'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { warning } from 'theme/icons'

export function DisabledAutomationForMigrationControl() {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" icon={warning} />}
      withClose={false}
      header={t('migrate.vault-banners.automation.title')}
      subheader={t('migrate.vault-banners.automation.description')}
      color="primary100"
    />
  )
}
