// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'

const PlusIcon = () => (
  <Icon
    name="plus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)
const MinusIcon = () => (
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
  } = props

  const showGenerateOptionButton = depositAmount && !depositAmount.isZero()

  return (
    <Grid>
      <Box>
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
        {showGenerateOptionButton && (
          <Text
            mt={3}
            sx={{
              cursor: 'pointer',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: 'onSuccess',
              userSelect: 'none',
              lineHeight: 1.25,
            }}
            onClick={toggleGenerateOption!}
          >
            {showGenerateOption ? <MinusIcon /> : <PlusIcon />}
            {t('manage-vault.action-option', {
              action: t('vault-actions.generate'),
              token: 'DAI',
            })}
          </Text>
        )}

        {showGenerateOption && (
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
        )}
      </Box>
    </Grid>
  )
}
