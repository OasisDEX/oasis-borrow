import { FieldDepositDai } from 'components/vault/sidebar/SidebarFields'
import { GuniOpenMultiplyVaultChangesInformation } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultChangesInformation'
import { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault'
import { Trans } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarOpenGuniVaultEditingState(props: OpenGuniVaultState) {
  const {
    balanceInfo: { daiBalance },
    depositAmount,
    maxMultiple,
    token,
    updateDeposit,
    updateDepositMax,
  } = props

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
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
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {maxMultiple.toNumber().toFixed(2)}x {token}
      </Text>
      <GuniOpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
