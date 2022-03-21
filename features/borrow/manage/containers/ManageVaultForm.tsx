import { Icon } from '@makerdao/dai-ui-icons'
import { TextWithCheckmark } from 'components/TextWithCheckmark'
import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { ManageVaultFormHeader } from 'features/borrow/manage/containers/ManageVaultFormHeader'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useState } from 'react'
import { Box, Divider, Grid, Text } from 'theme-ui'

import { ManageVaultCollateralAllowance } from '../../../../components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from '../../../../components/vault/commonMultiply/ManageVaultDaiAllowance'
import { VaultErrors } from '../../../../components/vault/VaultErrors'
import { VaultWarnings } from '../../../../components/vault/VaultWarnings'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { StopLossTriggeredFormControl } from '../../../automation/controls/StopLossTriggeredFormControl'
import { ManageStandardBorrowVaultState } from '../pipes/manageVault'
import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultConfirmation, ManageVaultConfirmationStatus } from './ManageVaultConfirmation'
import { ManageVaultEditing } from './ManageVaultEditing'

function ManageVaultMultiplyTransition({ stage, vault }: ManageStandardBorrowVaultState) {
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

export function ManageVaultForm(
  props: ManageStandardBorrowVaultState & { hideMultiply?: boolean; extraInfo?: ReactNode },
) {
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
    stopLossTriggered,
    vaultHistory,
  } = props
  const automationEnabled = useFeatureToggle('Automation')
  const [reopenPositionClicked, setReopenPositionClicked] = useState(false)

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      {stopLossTriggered && !reopenPositionClicked && automationEnabled ? (
        <StopLossTriggeredFormControl
          vaultHistory={vaultHistory}
          onClick={() => setReopenPositionClicked(true)}
        />
      ) : (
        <>
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
        </>
      )}
    </VaultFormContainer>
  )
}
