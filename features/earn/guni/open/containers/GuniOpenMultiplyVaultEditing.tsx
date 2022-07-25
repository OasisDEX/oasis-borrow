import { VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex, Grid, Text } from 'theme-ui'

import { OpenGuniVaultState } from '../pipes/openGuniVault'
import { GuniOpenMultiplyVaultChangesInformation } from './GuniOpenMultiplyVaultChangesInformation'

export function GuniOpenMultiplyVaultEditing(props: OpenGuniVaultState) {
  const { t } = useTranslation()

  const {
    token,
    depositAmount,
    balanceInfo: { daiBalance },
    updateDeposit,
    updateDepositMax,
    inputAmountsEmpty,
    maxMultiple,
  } = props

  return (
    <Grid gap={4}>
      <Grid gap={4}>
        <VaultActionInput
          action="Deposit"
          currencyCode="DAI"
          showMax={true}
          hasAuxiliary={false}
          onSetMax={updateDepositMax!}
          amount={depositAmount}
          onChange={handleNumericInput(updateDeposit!)}
          maxAmount={daiBalance}
          maxAmountLabel={t('balance')}
          hasError={false}
        />
        <Flex
          sx={{
            border: '1px solid',
            borderColor: 'primary100',
            borderRadius: 'large',
            justifyContent: 'center',
            py: '10px',
          }}
        >
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', color: 'primary100' }}>
            {maxMultiple.toNumber().toFixed(2)}x {token}
          </Text>
        </Flex>
      </Grid>
      {!inputAmountsEmpty && <Divider />}
      <GuniOpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
