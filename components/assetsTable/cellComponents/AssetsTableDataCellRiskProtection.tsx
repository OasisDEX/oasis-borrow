import { AppLink } from 'components/Links'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'theme-ui'

interface AssetsTableDataRiskProtectionProps {
  isOwner?: boolean
  level: number
  link: string
}

export function AssetsTableDataCellProtection({
  isOwner,
  level,
  link,
}: AssetsTableDataRiskProtectionProps) {
  const { t } = useTranslation()

  return (
    <>
      <AppLink href={link} hash={VaultViewMode.Protection}>
        <Button variant={level > 0 ? 'actionActiveGreen' : 'action'}>
          {level > 0
            ? t('discover.table.protection-value', { protection: level })
            : isOwner
              ? t('discover.table.activate')
              : t('discover.table.inactive')}
        </Button>
      </AppLink>
    </>
  )
}
