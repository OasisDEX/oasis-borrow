import { Icon } from '@makerdao/dai-ui-icons'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'

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

export function OpenVaultEditing(props: OpenVaultState) {
  const { t } = useTranslation()

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
    showGenerateOption,
    toggleGenerateOption,
    priceInfo: { currentCollateralPrice },
  } = props

  const showGenerateOptionButton = depositAmount && !depositAmount.isZero()

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
          maxAmountLabel={'Balance'}
          hasError={false}
        />
        {showGenerateOptionButton && (
          <Button
            variant="actionOption"
            mt={3}
            onClick={() => {
              toggleGenerateOption!()
            }}
          >
            {showGenerateOption ? <MinusIcon /> : <PlusIcon />}
            <Text pr={1}>
              {t('manage-vault.action-option', {
                action: t('vault-actions.generate'),
                token: 'DAI',
              })}
            </Text>
          </Button>
        )}

        {showGenerateOption && (
          <VaultActionInput
            action="Generate"
            amount={generateAmount}
            token={'DAI'}
            showMax={true}
            maxAmount={maxGenerateAmount}
            maxAmountLabel={'Max'}
            onSetMax={updateGenerateMax}
            onChange={handleNumericInput(updateGenerate!)}
            hasError={false}
          />
        )}
      </Box>
    </Grid>
  )
}
