import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Flex, Grid, Radio, Text } from 'theme-ui'

import { AllowanceOption } from '../../components/forms/AllowanceOption'
import { OpenVaultState } from './openVault'
import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

export function OpenVaultAllowance({
  stage,
  token,
  depositAmount,
  allowanceAmount,
  updateAllowanceAmount,
  setAllowanceAmountUnlimited,
  setAllowanceAmountToDepositAmount,
  setAllowanceAmountCustom,
  selectedAllowanceRadio,
}: OpenVaultState) {
  const canSelectRadio = stage === 'allowanceWaitingForConfirmation'

  const isUnlimited = selectedAllowanceRadio === 'unlimited'
  const isDeposit = selectedAllowanceRadio === 'depositAmount'
  const isCustom = selectedAllowanceRadio === 'custom'
  const { t } = useTranslation()

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <AllowanceOption onClick={setAllowanceAmountUnlimited!}>
            <Radio sx={{ mr: 3 }} name="allowance-open-form" defaultChecked checked={isUnlimited} />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </AllowanceOption>
          <AllowanceOption onClick={setAllowanceAmountToDepositAmount}>
            <Radio sx={{ mr: 3 }} name="allowance-open-form" checked={isDeposit} />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </AllowanceOption>
          <AllowanceOption onClick={setAllowanceAmountCustom}>
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
            </Flex>
          </AllowanceOption>
        </>
      )}
    </Grid>
  )
}

export function OpenVaultAllowanceStatus({
  stage,
  allowanceTxHash,
  etherscan,
  token,
}: OpenVaultState) {
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
