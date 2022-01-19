import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Radio } from 'components/forms/Radio'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Grid, Text } from 'theme-ui'

import { AllVaultStages } from './types/AllVaultStages'

type ManageVaultDaiAllowanceProps = {
  stage: AllVaultStages
  daiAllowanceAmount?: BigNumber
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  selectedDaiAllowanceRadio: SelectedDaiAllowanceRadio
  paybackAmount?: BigNumber
}

export type SelectedDaiAllowanceRadio = 'unlimited' | 'paybackAmount' | 'custom'

export function ManageVaultDaiAllowance({
  stage,
  daiAllowanceAmount,
  updateDaiAllowanceAmount,
  setDaiAllowanceAmountUnlimited,
  setDaiAllowanceAmountToPaybackAmount,
  resetDaiAllowanceAmount,
  selectedDaiAllowanceRadio,
  paybackAmount,
}: ManageVaultDaiAllowanceProps) {
  const canSelectRadio = stage === 'daiAllowanceWaitingForConfirmation'

  const { t } = useTranslation()

  const isUnlimited = selectedDaiAllowanceRadio === 'unlimited'
  const isPayback = selectedDaiAllowanceRadio === 'paybackAmount'
  const isCustom = selectedDaiAllowanceRadio === 'custom'

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Radio
            onChange={setDaiAllowanceAmountUnlimited!}
            name="manage-vault-dai-allowance"
            checked={isUnlimited}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </Radio>
          <Radio
            onChange={setDaiAllowanceAmountToPaybackAmount!}
            name="manage-vault-dai-allowance"
            checked={isPayback}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('dai-paying-back', { amount: formatCryptoBalance(paybackAmount!) })}
            </Text>
          </Radio>
          <Radio onChange={resetDaiAllowanceAmount!} name="allowance-open-form" checked={isCustom}>
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
                  daiAllowanceAmount && isCustom
                    ? formatAmount(daiAllowanceAmount, getToken('DAI').symbol)
                    : undefined
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
          </Radio>
        </>
      )}
    </Grid>
  )
}
