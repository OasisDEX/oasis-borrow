import { useTranslation } from 'next-i18next'
import React from 'react'
import { Container, Grid } from 'theme-ui'

import { ALLOWED_AUTOMATION_ILKS } from '../../blockchain/tokensMetadata'
import { TriggersData } from '../../features/automation/protection/triggers/AutomationTriggersData'
import { useStopLossStateInitializator } from '../../features/automation/protection/useStopLossStateInitializator'
import { VaultBannersView } from '../../features/banners/VaultsBannersView'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from '../../features/generalManageVault/GeneralManageVaultView'
import { VaultType } from '../../features/generalManageVault/vaultType'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { GenericAnnouncement } from '../Announcement'
import { VaultTabSwitch, VaultViewMode } from '../VaultTabSwitch'
import { DefaultVaultHeaderControl } from './DefaultVaultHeaderControl'
import { HistoryControl } from './HistoryControl'
import { ProtectionControl } from './ProtectionControl'
import { VaultHeadline } from './VaultHeadline'
import { VaultInformationControl } from './VaultInformationControl'

interface GeneralManageLayoutProps {
  generalManageVault: GeneralManageVaultState
  autoTriggersData: TriggersData
}

export function GeneralManageLayout({
  generalManageVault,
  autoTriggersData,
}: GeneralManageLayoutProps) {
  const { t } = useTranslation()
  const { ilkData, vault, account, priceInfo } = generalManageVault.state
  const showProtectionTab = ALLOWED_AUTOMATION_ILKS.includes(vault.ilk)
  const automationBasicBuyAndSellEnabled = useFeatureToggle('AutomationBasicBuyAndSell')
  const isStopLossEnabled = useStopLossStateInitializator(ilkData, vault, autoTriggersData)

  const vaultHeadingKey =
    generalManageVault.type === VaultType.Insti ? 'vault.insti-header' : 'vault.header'

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      {generalManageVault?.state.vault.ilk === 'CRVV1ETHSTETH-A' && (
        <Container variant="announcement">
          <GenericAnnouncement
            text="Generating DAI against CRVV1ETHSTETH-A and withdrawing collateral (unless the debt is fully paid back) isn't possible at Oasis.app at the moment. Users can add collateral and pay back DAI."
            link="https://forum.makerdao.com/t/14th-april-emergency-executive/14642"
            linkText="Visit Maker Forum for details"
            disableClosing={true}
          />
        </Container>
      )}
      <VaultBannersView id={vault.id} />
      <VaultTabSwitch
        defaultMode={VaultViewMode.Overview}
        heading={t(vaultHeadingKey, { ilk: vault.ilk, id: vault.id })}
        headline={
          <VaultHeadline
            header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
            token={vault.token}
            priceInfo={priceInfo}
          />
        }
        // TODO this prop to be removed when automationBasicBuyAndSellEnabled wont be needed anymore
        headerControl={
          !automationBasicBuyAndSellEnabled ? (
            <DefaultVaultHeaderControl vault={vault} ilkData={ilkData} />
          ) : (
            <></>
          )
        }
        overViewControl={
          <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />
        }
        historyControl={<HistoryControl generalManageVault={generalManageVault} />}
        protectionControl={<ProtectionControl vault={vault} ilkData={ilkData} account={account} />}
        vaultInfo={<VaultInformationControl generalManageVault={generalManageVault} />}
        showProtectionTab={showProtectionTab}
        protectionEnabled={isStopLossEnabled}
      />
    </Grid>
  )
}
