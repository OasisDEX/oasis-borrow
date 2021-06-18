import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Grid, Text } from 'theme-ui'

import { Radio } from '../../../components/forms/Radio'
import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

export function OpenMultiplyVaultAllowance({
  stage,
  token,
  depositAmount,
  allowanceAmount,
  updateAllowanceAmount,
  setAllowanceAmountUnlimited,
  setAllowanceAmountToDepositAmount,
  setAllowanceAmountCustom,
  selectedAllowanceRadio,
}: OpenMultiplyVaultState) {
  const canSelectRadio = stage === 'allowanceWaitingForConfirmation'

  const isUnlimited = selectedAllowanceRadio === 'unlimited'
  const isDeposit = selectedAllowanceRadio === 'depositAmount'
  const isCustom = selectedAllowanceRadio === 'custom'
  const { t } = useTranslation()

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Radio
            onChange={setAllowanceAmountUnlimited!}
            name="allowance-open-form"
            checked={isUnlimited}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </Radio>
          <Radio
            onChange={setAllowanceAmountToDepositAmount}
            name="allowance-open-form"
            checked={isDeposit}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </Radio>
          <Radio onChange={setAllowanceAmountCustom} name="allowance-open-form" checked={isCustom}>
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
                  allowanceAmount && isCustom
                    ? formatAmount(allowanceAmount, getToken(token).symbol)
                    : null
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken(token).digits,
                  prefix: '',
                })}
                onChange={handleNumericInput(updateAllowanceAmount!)}
              />
              <Text sx={{ fontSize: 1 }}>{token}</Text>
            </Grid>
          </Radio>
        </>
      )}
    </Grid>
  )
}

export function OpenMultiplyVaultAllowanceStatus({
  stage,
  allowanceTxHash,
  etherscan,
  token,
}: OpenMultiplyVaultState) {
  const { t } = useTranslation()

  if (stage === 'allowanceInProgress') {
    return (
      <TxStatusCardProgress
        text={t('setting-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={allowanceTxHash!}
      />
    )
  }
  if (stage === 'allowanceSuccess') {
    return (
      <TxStatusCardSuccess
        text={t('setting-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={allowanceTxHash!}
      />
    )
  }
  return null
}
