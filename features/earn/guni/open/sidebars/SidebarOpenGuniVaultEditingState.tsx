import { FieldDepositDai } from 'components/vault/sidebar/SidebarFields'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { GuniOpenMultiplyVaultChangesInformation } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultChangesInformation'
import { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault'
import {
  extractCommonErrors,
  extractCommonWarnings,
  extractGenerateErrors,
} from 'helpers/messageMappers'
import { Trans } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarOpenGuniVaultEditingState(props: OpenGuniVaultState) {
  const {
    balanceInfo: { daiBalance },
    depositAmount,
    errorMessages,
    ilkData,
    maxMultiple,
    token,
    updateDeposit,
    updateDepositMax,
    warningMessages,
    maxGenerateAmount,
  } = props

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="vault-form.subtext.edit-multiply-dai"
          values={{ token }}
          components={{
            1: <strong />,
          }}
        />
      </Text>
      <FieldDepositDai
        depositDaiAmount={depositAmount}
        maxAmountLabelKey="balance"
        maxDepositDaiAmount={daiBalance}
        updateDepositDaiAmountMax={updateDepositMax!}
        updateDepositDaiAmount={updateDeposit!}
        errorMessages={errorMessages}
        warningMessages={warningMessages}
        ilkData={ilkData}
      />
      <VaultErrors
        {...props}
        errorMessages={[
          ...extractCommonErrors(errorMessages),
          ...extractGenerateErrors(errorMessages),
        ]}
        maxGenerateAmount={maxGenerateAmount}
      />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {maxMultiple.toNumber().toFixed(2)}x {token}
      </Text>
      <GuniOpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
