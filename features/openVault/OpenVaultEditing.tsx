import { VaultActionInput } from 'components/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import React from 'react'
import { Grid } from 'theme-ui'

import { OpenVaultState } from './openVault'

export function OpenVaultEditing(props: OpenVaultState) {
  const {
    token,
    depositAmount,
    generateAmount,
    maxDepositAmount,
    maxGenerateAmount,
    updateDeposit,
    updateDepositMax,
    updateDepositUSD,
    depositAmountUSD,
    maxDepositAmountUSD,
    updateGenerate,
    updateGenerateMax,
  } = props

  return (
    <Grid>
      <Grid gap={1}>
        <VaultActionInput
          action="Deposit"
          token={token}
          showMax={true}
          hasAuxiliary={true}
          onSetMax={updateDepositMax!}
          amount={depositAmount}
          auxiliaryAmount={depositAmountUSD}
          onChange={handleNumericInput(updateDeposit!)}
          onAuxiliaryChange={handleNumericInput(updateDepositUSD!)}
          maxAmount={maxDepositAmount}
          maxAuxiliaryAmount={maxDepositAmountUSD}
          maxAmountLabel={'Balance'}
          hasError={false}
        />
        <VaultActionInput
          action="Generate"
          amount={generateAmount}
          token={'DAI'}
          showMax={true}
          maxAmount={maxGenerateAmount}
          maxAmountLabel={'Maximum'}
          onSetMax={updateGenerateMax}
          onChange={handleNumericInput(updateGenerate!)}
          hasError={false}
        />
      </Grid>
    </Grid>
  )
}
