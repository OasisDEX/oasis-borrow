import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { VaultChangesWithADelayCard } from '../VaultChangesWithADelayCard'

export function SidebarOpenBorrowVaultOpenStage(props: OpenVaultState) {
  const { t } = useTranslation()
  const { stage } = props

  switch (stage) {
    case 'txInProgress':
      return <OpenVaultAnimation />
    case 'txSuccess':
      return (
        <>
          <OpenVaultChangesInformation {...props} />
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <OpenVaultChangesInformation {...props} />
        </>
      )
  }
}
