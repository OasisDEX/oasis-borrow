import { TriggerType } from '@oasisdex/automation'
import { getNetworkName } from '@oasisdex/web3-context'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useStopLossStateInitializator } from 'features/automation/protection/useStopLossStateInitializator'
import { useBasicBSstateInitialization } from 'features/automation/useBasicSellStateInitializator'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
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
  const optimizationEnabled = isBasicBuyEnabled
  const positionInfo =
    generalManageVault.type === VaultType.Earn ? <Card variant="faq">{guniFaq}</Card> : undefined

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultBannersView id={vault.id} />
      <Box sx={{ zIndex: 0, mt: 4 }}>{headlineElement}</Box>
      <GeneralManageTabBar
        positionInfo={positionInfo}
        generalManageVault={generalManageVault}
        showProtectionTab={showProtectionTab}
        protectionEnabled={protectionEnabled}
        optimizationEnabled={optimizationEnabled}
      />
    </Grid>
  )
}
