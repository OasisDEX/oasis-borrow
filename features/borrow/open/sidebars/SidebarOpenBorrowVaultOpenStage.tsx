import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { StopLossTwoTxRequirement } from 'features/aave/components'
import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import type { OpenVaultState } from 'features/borrow/open/pipes/openVault.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Text } from 'theme-ui'

export function SidebarOpenBorrowVaultOpenStage(props: OpenVaultState) {
  const { t } = useTranslation()
  const { stage, openFlowWithStopLoss } = props

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          {openFlowWithStopLoss && <StopLossTwoTxRequirement typeKey="system.vault" />}
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
