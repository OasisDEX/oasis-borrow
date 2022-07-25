import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { GuniOpenMultiplyVaultChangesInformation } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultChangesInformation'
import { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function SidebarOpenGuniVaultOpenStage(props: OpenGuniVaultState) {
  const { t } = useTranslation()
  const { stage } = props

  switch (stage) {
    case 'txInProgress':
      return <OpenVaultAnimation />
    case 'txSuccess':
      return (
        <>
          <GuniOpenMultiplyVaultChangesInformation {...props} />
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <GuniOpenMultiplyVaultChangesInformation {...props} />
        </>
      )
  }
}
