import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { GuniManageMultiplyVaultChangesInformation } from '../containers/GuniManageMultiplyVaultChangesInformation'

export function SidebarManageGuniVaultManageStage(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const { stage } = props

  const [vaultChange, setVaultChanges] = useState<ManageMultiplyVaultState>(props)

  useEffect(() => {
    if (props.stage !== 'manageSuccess') setVaultChanges(props)
  }, [props])

  switch (stage) {
    case 'manageInProgress':
      return <OpenVaultAnimation />
    case 'manageSuccess':
      return (
        <>
          <GuniManageMultiplyVaultChangesInformation {...vaultChange} />
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <GuniManageMultiplyVaultChangesInformation {...props} />
        </>
      )
  }
}
