import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { OpenMultiplyVaultChangesInformation } from 'features/multiply/open/containers/OpenMultiplyVaultChangesInformation'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function SidebarOpenMultiplyVaultOpenStage(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  const { stage } = props

  switch (stage) {
    case 'txInProgress':
      return <OpenVaultAnimation />
    case 'txSuccess':
      return (
        <>
          <OpenMultiplyVaultChangesInformation {...props} />
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <OpenMultiplyVaultChangesInformation {...props} />
        </>
      )
  }
}
