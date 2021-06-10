import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
// import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Slider } from 'theme-ui'

import { LeverageVaultState } from '../leverageVault'

export const PlusIcon = () => (
  <Icon
    name="plus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

export const MinusIcon = () => (
  <Icon
    name="minus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

export function LeverageVaultEditing(props: LeverageVaultState) {
  // const { t } = useTranslation()

  const {
    token,
    depositAmount,
    maxDepositAmount,
    updateDeposit,
    updateDepositMax,
    updateDepositUSD,
    depositAmountUSD,
    maxDepositAmountUSD,
    updateLeverage,
    leverage, // TODO improve leverage editing
    priceInfo: { currentCollateralPrice },
    canAdjustRisk,
  } = props

  return (
    <Grid>
      <Box>
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
          maxAmountLabel={'Balance'} // TODO add translation
          hasError={false}
        />
        <Box>leverage: {leverage?.toString()}</Box>
        <Slider
          disabled={!canAdjustRisk}
          step={10}
          value={leverage?.toNumber() || 0}
          onChange={(e) => {
            updateLeverage && updateLeverage(new BigNumber(e.target.value))
          }}
        />
      </Box>
    </Grid>
  )
}
