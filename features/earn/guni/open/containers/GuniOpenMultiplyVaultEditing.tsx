import { VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex, Grid, Text } from 'theme-ui'

import { OpenGuniVaultState } from '../pipes/openGuniVault'
import { GuniOpenMultiplyVaultChangesInformation } from './GuniOpenMultiplyVaultChangesInformation'

export function GuniOpenMultiplyVaultEditing(props: OpenGuniVaultState) {
  const { t } = useTranslation()
  const newComponentsEnabled = useFeatureToggle('NewComponents')

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
        {newComponentsEnabled && (
          <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
            <Trans
              i18nKey="vault-form.subtext.edit-multiply-dai"
              values={{ token: 'GUNIV3DAIUSDC' }}
            >
              This vault can be created by simply <strong>depositing DAI</strong>. The transaction
              will create the GUNIV3DAIUSDC position for you based on this DAI deposit
            </Trans>
          </Text>
        )}
        <VaultActionInput
          action="Deposit"
          token="DAI"
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
            borderColor: 'primary',
            borderRadius: 'large',
            justifyContent: 'center',
            py: '10px',
          }}
        >
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', color: 'primary' }}>
            {maxMultiple.toNumber().toFixed(2)}x {token}
          </Text>
        </Flex>
      </Grid>
      {!inputAmountsEmpty && <Divider />}
      <GuniOpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
