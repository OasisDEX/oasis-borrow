import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { handleNumericInput } from 'helpers/input'
import React, { useEffect } from 'react'
import { Grid } from 'theme-ui'

import { VaultActionInput } from '../VaultActionInput'

export function SideBarOpenBorrowVaultContent(props: OpenVaultState) {
  const {
    stage,
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
    showGenerateOption,
    toggleGenerateOption,
    ilkData: { debtFloor },
    priceInfo: { currentCollateralPrice },
  } = props

  useEffect(() => {
    if (!showGenerateOption) toggleGenerateOption!()
  }, [showGenerateOption, depositAmount])

  return (
    <Grid gap={3}>
      <span>stage: {stage}</span>
      <VaultActionInput
        action="Deposit"
        token={token}
        tokenUsdPrice={currentCollateralPrice}
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
        showMin={true}
        minAmount={debtFloor}
        minAmountLabel={'From'}
        showMax={true}
        maxAmount={maxGenerateAmount}
        onSetMax={updateGenerateMax}
        onChange={handleNumericInput(updateGenerate!)}
        hasError={false}
      />
      <OpenVaultChangesInformation {...props} />
    </Grid>
  )
}
