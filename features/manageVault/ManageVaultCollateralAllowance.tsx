import { getToken } from 'blockchain/tokensMetadata'
import { AllowanceOption } from 'components/forms/AllowanceOption'
import { TxStatusCardProgress } from 'features/openVault/TxStatusCard'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Flex, Grid, Radio, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultCollateralAllowance({
  stage,
  vault: { token },
  collateralAllowanceAmount,
  depositAmount,
  updateCollateralAllowanceAmount,
  setCollateralAllowanceAmountUnlimited,
  setCollateralAllowanceAmountToDepositAmount,
  resetCollateralAllowanceAmount,
  selectedCollateralAllowanceRadio,
}: ManageVaultState) {
  const canSelectRadio = stage === 'collateralAllowanceWaitingForConfirmation'

  const isUnlimited = selectedCollateralAllowanceRadio === 'unlimited'
  const isDeposit = selectedCollateralAllowanceRadio === 'depositAmount'
  const isCustom = selectedCollateralAllowanceRadio === 'custom'

  const { t } = useTranslation()

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <AllowanceOption onClick={setCollateralAllowanceAmountUnlimited!}>
            <Radio name="manage-vault-allowance" defaultChecked checked={isUnlimited} />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </AllowanceOption>
          <AllowanceOption onClick={setCollateralAllowanceAmountToDepositAmount!}>
            <Radio name="manage-vault-allowance" checked={isDeposit} />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </AllowanceOption>
          <AllowanceOption onClick={resetCollateralAllowanceAmount!}>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <Radio sx={{ mr: 3 }} name="allowance-open-form" checked={isCustom} />
              <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
                <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
                  {t('custom')}
                </Text>
                <BigNumberInput
                  sx={{
                    p: 1,
                    borderRadius: 'small',
                    borderColor: 'light',
                    width: '100px',
                    fontSize: 1,
                    px: 3,
                    py: '12px',
                  }}
                  disabled={!isCustom}
                  value={
                    collateralAllowanceAmount && isCustom
                      ? formatAmount(collateralAllowanceAmount, getToken(token).symbol)
                      : null
                  }
                  mask={createNumberMask({
                    allowDecimal: true,
                    decimalLimit: getToken(token).digits,
                    prefix: '',
                  })}
                  onChange={handleNumericInput(updateCollateralAllowanceAmount!)}
                />
                <Text sx={{ fontSize: 1 }}>{token}</Text>
              </Grid>
            </Flex>
          </AllowanceOption>
        </>
      )}
    </Grid>
  )
}

export function ManageVaultCollateralAllowanceStatus({
  stage,
  collateralAllowanceTxHash,
  etherscan,
  vault: { token },
}: ManageVaultState) {
  const { t } = useTranslation()

  if (stage === 'collateralAllowanceInProgress') {
    return (
      <TxStatusCardProgress
        text={t('setting-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={collateralAllowanceTxHash!}
      />
    )
  }

  if (stage === 'collateralAllowanceSuccess') {
    return (
      <TxStatusCardProgress
        text={t('set-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={collateralAllowanceTxHash!}
      />
    )
  }

  return null
}
