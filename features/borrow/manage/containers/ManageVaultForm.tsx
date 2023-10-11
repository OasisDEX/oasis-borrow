import { Icon } from 'components/Icon'
import { TextWithCheckmark } from 'components/TextWithCheckmark'
import { ManageVaultCollateralAllowance } from 'components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from 'components/vault/commonMultiply/ManageVaultDaiAllowance'
import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyContentBox, VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ManageVaultFormHeader } from 'features/borrow/manage/containers/ManageVaultFormHeader'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Divider, Grid, Text } from 'theme-ui'
import { multiply_transition } from 'theme/icons'

import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultConfirmation, ManageVaultConfirmationStatus } from './ManageVaultConfirmation'
import { ManageVaultEditing } from './ManageVaultEditing'

function ManageVaultMultiplyTransition({ stage, vault }: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()
  return stage === 'multiplyTransitionEditing' ? (
    <Grid mt={-3}>
      <Grid variant="text.paragraph3" sx={{ color: 'neutral80' }}>
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
        <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('borrow-to-multiply.paragraph2')}
        </Text>
      </Grid>
    </Grid>
  ) : (
    <Box>
      <Icon icon={multiply_transition} size="auto" />
    </Box>
  )
}

export function ManageVaultForm(
  props: ManageStandardBorrowVaultState & { hideMultiplyTab?: boolean; txnCostDisplay?: ReactNode },
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
  } = props

  const gasData = extractGasDataFromState(props)

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <ManageVaultFormHeader {...props} />
      {isProxyStage && <VaultProxyContentBox stage={stage} gasData={gasData} />}
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
