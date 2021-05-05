import { getToken } from 'blockchain/tokensMetadata'
import { Radio } from 'components/forms/Radio'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'features/openVault/TxStatusCard'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Grid, Text } from 'theme-ui'

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
          <Radio
            onChange={setCollateralAllowanceAmountUnlimited!}
            name="manage-vault-allowance"
            checked={isUnlimited}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </Radio>
          <Radio
            name="manage-vault-allowance"
            checked={isDeposit}
            onChange={setCollateralAllowanceAmountToDepositAmount!}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </Radio>
          <Radio
            onChange={resetCollateralAllowanceAmount!}
            name="allowance-open-form"
            checked={isCustom}
          >
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center', my: 2 }}>
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
          </Radio>
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
      <TxStatusCardSuccess
        text={t('set-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={collateralAllowanceTxHash!}
      />
    )
  }

  return null
}
