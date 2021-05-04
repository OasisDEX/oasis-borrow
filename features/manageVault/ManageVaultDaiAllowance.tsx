import { getToken } from 'blockchain/tokensMetadata'
import { AllowanceOption } from 'features/openVault/OpenVaultAllowance'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'features/openVault/TxStatusCard'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Flex, Grid, Radio, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultDaiAllowance({
  stage,
  daiAllowanceAmount,
  paybackAmount,
  updateDaiAllowanceAmount,
  setDaiAllowanceAmountUnlimited,
  setDaiAllowanceAmountToPaybackAmount,
  resetDaiAllowanceAmount,
  selectedDaiAllowanceRadio,
}: ManageVaultState) {
  const canSelectRadio = stage === 'daiAllowanceWaitingForConfirmation'

  const { t } = useTranslation()

  const isUnlimited = selectedDaiAllowanceRadio === 'unlimited'
  const isPayback = selectedDaiAllowanceRadio === 'paybackAmount'
  const isCustom = selectedDaiAllowanceRadio === 'custom'

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <AllowanceOption onClick={setDaiAllowanceAmountUnlimited!}>
            <Radio name="manage-vault-dai-allowance" defaultChecked checked={isUnlimited} />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </AllowanceOption>
          <AllowanceOption onClick={setDaiAllowanceAmountToPaybackAmount!}>
            <Radio name="manage-vault-dai-allowance" checked={isPayback} />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('dai-paying-back', { amount: formatCryptoBalance(paybackAmount!) })}
            </Text>
          </AllowanceOption>
          <AllowanceOption onClick={resetDaiAllowanceAmount!}>
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
                    daiAllowanceAmount && isCustom
                      ? formatAmount(daiAllowanceAmount, getToken('DAI').symbol)
                      : null
                  }
                  mask={createNumberMask({
                    allowDecimal: true,
                    decimalLimit: getToken('DAI').digits,
                    prefix: '',
                  })}
                  onChange={handleNumericInput(updateDaiAllowanceAmount!)}
                />
                <Text sx={{ fontSize: 1 }}>DAI</Text>
              </Grid>
            </Flex>
          </AllowanceOption>
        </>
      )}
    </Grid>
  )
}

export function ManageVaultDaiAllowanceStatus({
  stage,
  daiAllowanceTxHash,
  etherscan,
}: ManageVaultState) {
  const { t } = useTranslation()

  if (stage === 'daiAllowanceInProgress') {
    return (
      <TxStatusCardProgress
        text={t('setting-allowance-for', { token: 'DAI' })}
        etherscan={etherscan!}
        txHash={daiAllowanceTxHash!}
      />
    )
  }
  if (stage === 'daiAllowanceSuccess') {
    return (
      <TxStatusCardSuccess
        text={t('set-allowance-for', { token: 'DAI' })}
        etherscan={etherscan!}
        txHash={daiAllowanceTxHash!}
      />
    )
  }
  return null
}
