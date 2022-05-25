import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { VaultChangesWithADelayCard } from '../VaultChangesWithADelayCard'

export function SidebarManageBorrowVaultManageStage(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()
  const { stage } = props
  const [vaultChange, setVaultChanges] = useState<ManageStandardBorrowVaultState>(props)

  useEffect(() => {
    if (props.stage !== 'manageSuccess') setVaultChanges(props)
  }, [props])

  switch (stage) {
    case 'manageInProgress':
      return <OpenVaultAnimation />
    case 'manageSuccess':
      return (
        <>
          <ManageVaultChangesInformation {...vaultChange} />
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <ManageVaultChangesInformation {...props} />
        </>
      )
  }
}
