import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { GuniManageMultiplyVaultChangesInformation } from 'features/earn/guni/manage/containers/GuniManageMultiplyVaultChangesInformation'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Text } from 'theme-ui'

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
