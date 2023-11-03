import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Text } from 'theme-ui'

export function SidebarManageMultiplyVaultManageStage(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const { stage, vaultType, otherAction } = props

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
          {vaultType === VaultType.Multiply ||
          props.originalEditingStage === 'adjustPosition' ||
          (props.originalEditingStage === 'otherActions' && otherAction === 'closeVault') ? (
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
          {vaultType === VaultType.Multiply ||
          props.originalEditingStage === 'adjustPosition' ||
          (props.originalEditingStage === 'otherActions' && 'closeVault') ? (
            <ManageMultiplyVaultChangesInformation {...props} />
          ) : (
            <ManageVaultChangesInformation {...props} />
          )}
        </>
      )
  }
}
