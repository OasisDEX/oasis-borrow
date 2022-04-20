import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Container, Grid } from 'theme-ui'

import { ALLOWED_MULTIPLY_TOKENS } from '../../blockchain/tokensMetadata'
import {
  getInitialVaultCollRatio,
  getStartingSlRatio,
} from '../../features/automation/common/helpers'
import { extractStopLossData } from '../../features/automation/common/StopLossTriggerDataExtractor'
import { ADD_FORM_CHANGE } from '../../features/automation/common/UITypes/AddFormChange'
import {
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
} from '../../features/automation/common/UITypes/ProtectionFormModeChange'
import { REMOVE_FORM_CHANGE } from '../../features/automation/common/UITypes/RemoveFormChange'
import { TriggersData } from '../../features/automation/triggers/AutomationTriggersData'
import { VaultBannersView } from '../../features/banners/VaultsBannersView'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from '../../features/generalManageVault/GeneralManageVaultView'
import { useUIChanges } from '../../helpers/uiChangesHook'
import { GenericAnnouncement } from '../Announcement'
import { useAppContext } from '../AppContextProvider'
import { VaultTabSwitch, VaultViewMode } from '../VaultTabSwitch'
import { DefaultVaultHeaderControl } from './DefaultVaultHeaderControl'
import { HistoryControl } from './HistoryControl'
import { ProtectionControl } from './ProtectionControl'
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
  const { uiChanges } = useAppContext()
  const { ilkData, vault, account, priceInfo } = generalManageVault.state
  const showProtectionTab = ALLOWED_MULTIPLY_TOKENS.includes(vault.token)
  const { stopLossLevel, isStopLossEnabled, isToCollateral } = extractStopLossData(autoTriggersData)
  const [currentForm] = useUIChanges<ProtectionModeChange>(PROTECTION_MODE_CHANGE_SUBJECT)

  const initialVaultCollRatio = getInitialVaultCollRatio({
    liquidationRatio: generalManageVault.state.ilkData.liquidationRatio,
    collateralizationRatio: generalManageVault.state.vault.collateralizationRatio,
  })

  const startingSlRatio = getStartingSlRatio({
    stopLossLevel,
    isStopLossEnabled,
    initialVaultCollRatio,
  })

  useEffect(() => {
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'stop-loss',
      stopLoss: startingSlRatio.multipliedBy(100),
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(REMOVE_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [currentForm])

  useEffect(() => {
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'stop-loss',
      stopLoss: startingSlRatio.multipliedBy(100),
    })
  }, [isStopLossEnabled])

  const protectionEnabled = !!generalManageVault.state.stopLossData?.isStopLossEnabled

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
        heading={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        headline={
          <VaultHeadline
            header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
            token={vault.token}
            priceInfo={priceInfo}
          />
        }
        headerControl={<DefaultVaultHeaderControl vault={vault} ilkData={ilkData} />}
        overViewControl={
          <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />
        }
        historyControl={<HistoryControl generalManageVault={generalManageVault} />}
        protectionControl={<ProtectionControl vault={vault} ilkData={ilkData} account={account} />}
        showProtectionTab={showProtectionTab}
        protectionEnabled={protectionEnabled}
      />
    </Grid>
  )
}
