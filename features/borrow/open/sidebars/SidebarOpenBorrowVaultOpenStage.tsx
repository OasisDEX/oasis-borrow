import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function SidebarOpenBorrowVaultOpenStage(props: OpenVaultState) {
  const { t } = useTranslation()
  const { stage, openFlowWithStopLoss } = props

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          {openFlowWithStopLoss && (
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('open-vault-two-tx-setup-requirement')}
            </Text>
          )}
          <OpenVaultAnimation />
        </>
      )
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
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <OpenVaultChangesInformation {...props} />
        </>
      )
  }
}
