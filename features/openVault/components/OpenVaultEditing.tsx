import { MinusIcon, PlusIcon, VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { pick } from 'helpers/pick'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Divider, Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'
import { OpenVaultChangesInformation } from './OpenVaultChangesInformation'
import { OpenBorrowVaultContext } from './OpenVaultView'

export function OpenVaultEditing() {
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
    currentCollateralPrice,
    props,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(
      ctx,
      'token',
      'depositAmount',
      'generateAmount',
      'maxDepositAmount',
      'maxGenerateAmount',
      'updateDeposit',
      'updateDepositMax',
      'updateDepositUSD',
      'depositAmountUSD',
      'maxDepositAmountUSD',
      'updateGenerate',
      'updateGenerateMax',
      'showGenerateOption',
      'toggleGenerateOption',
    ),
    currentCollateralPrice: ctx.priceInfo.currentCollateralPrice,
    props: ctx,
  }))

  const showGenerateOptionButton = depositAmount && !depositAmount.isZero()

  return (
    <Grid gap={4}>
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
          <Box>
            <Button
              variant={`actionOption${showGenerateOption ? 'Opened' : ''}`}
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

            {showGenerateOption && (
              <VaultActionInput
                collapsed
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
        )}
      </Box>
      {showGenerateOptionButton && <Divider />}
      <OpenVaultChangesInformation />
    </Grid>
  )
}
