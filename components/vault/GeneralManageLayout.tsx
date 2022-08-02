import { TriggerType } from '@oasisdex/automation'
import { getNetworkName } from '@oasisdex/web3-context'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { AggregtedTriggersData } from 'features/automation/protection/triggers/aggregatedTriggersData'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useBasicBSstateInitialization } from 'features/automation/protection/useBasicSellStateInitializator'
import { useConstantMultipleStateInitialization } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { useStopLossStateInitializator } from 'features/automation/protection/useStopLossStateInitializator'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultNoticesView } from 'features/notices/VaultsNoticesView'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

import { GeneralManageTabBar } from './GeneralManageTabBar'
import { VaultHeadline } from './VaultHeadline'

interface GeneralManageLayoutProps {
  generalManageVault: GeneralManageVaultState
  autoTriggersData: TriggersData
}

export function GeneralManageLayout({
  generalManageVault,
  autoTriggersData,
}: GeneralManageLayoutProps) {
  const { t } = useTranslation()
  const { ilkData, vault, priceInfo } = generalManageVault.state

  const showAutomationTabs = isSupportedAutomationIlk(getNetworkName(), vault.ilk)
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

  const isConstantMultipleEnabled = useConstantMultipleStateInitialization(
    ilkData,
    vault,
    autoTriggersData,
    {} as AggregtedTriggersData,
  )

  const headlineElement =
    generalManageVault.type === VaultType.Earn ? (
      <GuniVaultHeader token={ilkData.token} ilk={ilkData.ilk} />
    ) : (
      <VaultHeadline
        header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        token={vault.token}
        priceInfo={priceInfo}
      />
    )

  const protectionEnabled = isStopLossEnabled || isBasicSellEnabled
  const optimizationEnabled = isBasicBuyEnabled || isConstantMultipleEnabled
  const positionInfo =
    generalManageVault.type === VaultType.Earn ? <Card variant="faq">{guniFaq}</Card> : undefined

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultNoticesView id={vault.id} />
      <Box sx={{ zIndex: 0, mt: 4 }}>{headlineElement}</Box>
      <GeneralManageTabBar
        positionInfo={positionInfo}
        generalManageVault={generalManageVault}
        showAutomationTabs={showAutomationTabs}
        protectionEnabled={protectionEnabled}
        optimizationEnabled={optimizationEnabled}
      />
    </Grid>
  )
}
