import { getNetworkName } from '@oasisdex/web3-context'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { TriggersData } from '../../features/automation/protection/triggers/AutomationTriggersData'
import { useStopLossStateInitializator } from '../../features/automation/protection/useStopLossStateInitializator'
import { VaultBannersView } from '../../features/banners/VaultsBannersView'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from '../../features/generalManageVault/GeneralManageVaultView'
import { VaultType } from '../../features/generalManageVault/vaultType'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { VaultTabSwitch, VaultViewMode } from '../VaultTabSwitch'
import { DefaultVaultHeaderControl } from './DefaultVaultHeaderControl'
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
  const {
    ilkData,
    vault,
    account,
    priceInfo,
    collateralizationRatioAtNextPrice,
    balanceInfo,
    vaultHistory,
  } = generalManageVault.state

  const showProtectionTab = isSupportedAutomationIlk(getNetworkName(), vault.ilk)
  const newComponentsEnabled = useFeatureToggle('NewComponents')
  const isStopLossEnabled = useStopLossStateInitializator(ilkData, vault, autoTriggersData)

  const vaultHeadingKey =
    generalManageVault.type === VaultType.Insti ? 'vault.insti-header' : 'vault.header'

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
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
        // TODO this prop to be removed when newComponentsEnabled wont be needed anymore
        headerControl={
          !newComponentsEnabled ? (
            <DefaultVaultHeaderControl vault={vault} ilkData={ilkData} />
          ) : (
            <></>
          )
        }
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
            collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
          />
        }
        optimizationControl={<OptimizationControl vault={vault} />}
        vaultInfo={<VaultInformationControl generalManageVault={generalManageVault} />}
        showProtectionTab={showProtectionTab}
        protectionEnabled={isStopLossEnabled}
      />
    </Grid>
  )
}
