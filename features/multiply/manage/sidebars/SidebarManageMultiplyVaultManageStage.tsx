import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { VaultType } from 'features/generalManageVault/vaultType'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function SidebarManageMultiplyVaultManageStage(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const { stage, vaultType } = props

  const [, setVaultChanges] = useState<ManageMultiplyVaultState>(props)

  useEffect(() => {
    if (props.stage !== 'manageSuccess') setVaultChanges(props)
  }, [props])

  switch (stage) {
    case 'manageInProgress':
      return <OpenVaultAnimation />
    case 'manageSuccess':
      return (
        <>
          {vaultType === VaultType.Multiply ? (
            <ManageMultiplyVaultChangesInformation {...props} />
          ) : (
            <ManageVaultChangesInformation {...props} />
          )}
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          {vaultType === VaultType.Multiply ? (
            <ManageMultiplyVaultChangesInformation {...props} />
          ) : (
            <ManageVaultChangesInformation {...props} />
          )}
        </>
      )
  }
}
