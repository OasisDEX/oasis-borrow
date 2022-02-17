import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { VaultViewMode } from 'components/TabSwitchLayout'
import { TextWithCheckmark } from 'components/TextWithCheckmark'
import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { TAB_CHANGE_SUBJECT } from 'features/automation/common/UITypes/TabChange'
import { ManageVaultFormHeader } from 'features/borrow/manage/containers/ManageVaultFormHeader'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Divider, Grid, Text } from 'theme-ui'

import { ManageVaultCollateralAllowance } from '../../../../components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from '../../../../components/vault/commonMultiply/ManageVaultDaiAllowance'
import { DefaultVaultHeader } from '../../../../components/vault/DefaultVaultHeader'
import { VaultErrors } from '../../../../components/vault/VaultErrors'
import { VaultWarnings } from '../../../../components/vault/VaultWarnings'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { VaultHistoryEvent } from '../../../vaultHistory/vaultHistory'
import { VaultHistoryView } from '../../../vaultHistory/VaultHistoryView'
import { ManageVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'
import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultConfirmation, ManageVaultConfirmationStatus } from './ManageVaultConfirmation'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultEditing } from './ManageVaultEditing'

function ManageVaultMultiplyTransition({ stage, vault }: ManageVaultState) {
  const { t } = useTranslation()
  return stage === 'multiplyTransitionEditing' ? (
    <Grid mt={-3}>
      <Grid variant="text.paragraph3" sx={{ color: 'text.subtitle' }}>
        <TextWithCheckmark>
          {t('borrow-to-multiply.checkmark1', { token: vault.token.toUpperCase() })}
        </TextWithCheckmark>
        <TextWithCheckmark>{t('borrow-to-multiply.checkmark2')}</TextWithCheckmark>
        <TextWithCheckmark>{t('borrow-to-multiply.checkmark3')}</TextWithCheckmark>
        <TextWithCheckmark>{t('borrow-to-multiply.checkmark4')}</TextWithCheckmark>
      </Grid>
      <Divider />
      <Grid gap={2}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {t('borrow-to-multiply.subheader2')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
          {t('borrow-to-multiply.paragraph2')}
        </Text>
      </Grid>
    </Grid>
  ) : (
    <Box>
      <Icon name="multiply_transition" size="auto" />
    </Box>
  )
}

export function ManageVaultForm(props: ManageVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    isMultiplyTransitionStage,
    accountIsConnected,
    daiAllowanceTxHash,
    collateralAllowanceTxHash,
    vault: { token },
    stage,
  } = props

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <ManageVaultFormHeader {...props} />
      {isEditingStage && <ManageVaultEditing {...props} />}
      {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
      {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
      {isManageStage && <ManageVaultConfirmation {...props} />}
      {isMultiplyTransitionStage && <ManageVaultMultiplyTransition {...props} />}
      {accountIsConnected && (
        <>
          <VaultErrors {...props} />
          <VaultWarnings {...props} />
          {stage === 'manageSuccess' && <VaultChangesWithADelayCard />}
          <ManageVaultButton {...props} />
        </>
      )}
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isCollateralAllowanceStage && (
        <VaultAllowanceStatus
          {...props}
          allowanceTxHash={collateralAllowanceTxHash}
          token={token}
        />
      )}
      {isDaiAllowanceStage && (
        <VaultAllowanceStatus {...props} allowanceTxHash={daiAllowanceTxHash} token={'DAI'} />
      )}
      {isManageStage && <ManageVaultConfirmationStatus {...props} />}
    </VaultFormContainer>
  )
}

export function ManageVaultContainer({
  manageVault,
  vaultHistory,
}: {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const { manageVault$, context$, uiChanges } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
  } = manageVault
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !automationEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!automationEnabled && (
        <DefaultVaultHeader {...manageVault} header={t('vault.header', { ilk, id })} id={id} />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageVaultDetails
            {...manageVault}
            onBannerButtonClickHandler={() => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Protection })
            }}
          />
          {!automationEnabled && <VaultHistoryView vaultHistory={vaultHistory} />}
        </Grid>
        <Box>
          <ManageVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
