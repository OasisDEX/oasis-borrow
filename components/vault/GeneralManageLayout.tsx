import { TriggerType } from '@oasisdex/automation'
import { getNetworkName } from '@oasisdex/web3-context'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useStopLossStateInitializator } from 'features/automation/protection/useStopLossStateInitializator'
import { useBasicBSstateInitialization } from 'features/automation/useBasicSellStateInitializator'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from 'features/generalManageVault/GeneralManageVaultView'
import { VaultType } from 'features/generalManageVault/vaultType'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultTabSwitch, VaultViewMode } from '../VaultTabSwitch'
import { HistoryControl } from './HistoryControl'
import { OptimizationControl } from './OptimizationControl'
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
  const { ilkData, vault, account, priceInfo, balanceInfo, vaultHistory } = generalManageVault.state

  const showProtectionTab = isSupportedAutomationIlk(getNetworkName(), vault.ilk)
  const isStopLossEnabled = useStopLossStateInitializator(ilkData, vault, autoTriggersData)
  const isBasicSellEnabled = useBasicBSstateInitialization(
    ilkData,
    vault,
    autoTriggersData,
    TriggerType.BasicSell,
  )
  const isBasicBuyEnabled = useBasicBSstateInitialization(
    ilkData,
    vault,
    autoTriggersData,
    TriggerType.BasicBuy,
  )

  const vaultHeadingKey =
    generalManageVault.type === VaultType.Insti ? 'vault.insti-header' : 'vault.header'

  const headlineElement =
    generalManageVault.type === VaultType.Earn ? (
      <GuniVaultHeader {...generalManageVault.state} token={vault.token} />
    ) : (
      <VaultHeadline
        header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        token={vault.token}
        priceInfo={priceInfo}
      />
    )
  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultBannersView id={vault.id} />
      <VaultTabSwitch
        defaultMode={VaultViewMode.Overview}
        heading={t(vaultHeadingKey, { ilk: vault.ilk, id: vault.id })}
        headline={headlineElement}
        overViewControl={
          <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />
        }
        historyControl={<HistoryControl vaultHistory={vaultHistory} />}
        protectionControl={
          <ProtectionControl
            vault={vault}
            ilkData={ilkData}
            account={account}
            balanceInfo={balanceInfo}
          />
        }
        optimizationControl={<OptimizationControl vault={vault} />}
        vaultInfo={<VaultInformationControl generalManageVault={generalManageVault} />}
        showProtectionTab={showProtectionTab}
        protectionEnabled={isStopLossEnabled || isBasicSellEnabled}
        optimizationEnabled={isBasicBuyEnabled}
      />
    </Grid>
  )
}
