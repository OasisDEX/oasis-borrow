import { TriggerType } from '@oasisdex/automation'
import { getNetworkName } from '@oasisdex/web3-context'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { useAutoBSstateInitialization } from 'features/automation/common/state/useAutoBSStateInitializator'
import { useAutoTakeProfitStateInitializator } from 'features/automation/optimization/autoTakeProfit/state/useAutoTakeProfitStateInitializator'
import { useConstantMultipleStateInitialization } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization'
import { useStopLossStateInitializator } from 'features/automation/protection/stopLoss/state/useStopLossStateInitializator'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultNoticesView } from 'features/notices/VaultsNoticesView'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

import { DefaultVaultHeadline } from './DefaultVaultHeadline'
import { GeneralManageTabBar } from './GeneralManageTabBar'

interface GeneralManageLayoutProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralManageLayout({ generalManageVault }: GeneralManageLayoutProps) {
  const {
    stopLossTriggerData,
    autoSellTriggerData,
    autoBuyTriggerData,
    constantMultipleTriggerData,
    autoTakeProfitTriggerData,
  } = useAutomationContext()
  const { t } = useTranslation()
  const { ilkData, vault, priceInfo } = generalManageVault.state

  const colRatioPercnentage = vault.collateralizationRatio.times(100).toFixed(2)

  const showAutomationTabs = isSupportedAutomationIlk(getNetworkName(), vault.ilk)
  const isStopLossEnabled = useStopLossStateInitializator(ilkData, vault, stopLossTriggerData)
  const isAutoSellEnabled = useAutoBSstateInitialization(
    ilkData,
    vault,
    autoSellTriggerData,
    stopLossTriggerData,
    TriggerType.BasicSell,
  )
  const isAutoBuyEnabled = useAutoBSstateInitialization(
    ilkData,
    vault,
    autoBuyTriggerData,
    stopLossTriggerData,
    TriggerType.BasicBuy,
  )
  const isConstantMultipleEnabled = useConstantMultipleStateInitialization(
    ilkData,
    vault,
    constantMultipleTriggerData,
    autoBuyTriggerData,
    autoSellTriggerData,
    stopLossTriggerData,
  )
  const isAutoTakeProfitEnabled = useAutoTakeProfitStateInitializator(
    vault,
    autoTakeProfitTriggerData,
  )

  const headlineElement =
    generalManageVault.type === VaultType.Earn ? (
      <GuniVaultHeader token={ilkData.token} ilk={ilkData.ilk} />
    ) : (
      <DefaultVaultHeadline
        header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        token={[vault.token]}
        priceInfo={priceInfo}
        colRatio={colRatioPercnentage}
      />
    )

  const protectionEnabled = isStopLossEnabled || isAutoSellEnabled
  const optimizationEnabled =
    isAutoBuyEnabled || isConstantMultipleEnabled || isAutoTakeProfitEnabled
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
