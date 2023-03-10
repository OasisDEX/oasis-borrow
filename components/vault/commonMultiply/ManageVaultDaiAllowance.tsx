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

import { AllVaultStages } from '../../../features/types/vaults/AllVaultStages'
import { zero } from '../../../helpers/zero'

type ManageVaultDaiAllowanceProps = {
  stage: AllVaultStages
  daiAllowanceAmount?: BigNumber
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  setDaiAllowanceAmountToDepositDaiAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  selectedDaiAllowanceRadio: SelectedDaiAllowanceRadio
  paybackAmount?: BigNumber
  depositDaiAmount?: BigNumber
}

export type SelectedDaiAllowanceRadio = 'unlimited' | 'actionAmount' | 'custom'

export function ManageVaultDaiAllowance({
  stage,
  daiAllowanceAmount,
  updateDaiAllowanceAmount,
  setDaiAllowanceAmountUnlimited,
  setDaiAllowanceAmountToPaybackAmount,
  setDaiAllowanceAmountToDepositDaiAmount,
  resetDaiAllowanceAmount,
  selectedDaiAllowanceRadio,
  paybackAmount,
  depositDaiAmount,
}: ManageVaultDaiAllowanceProps) {
  const canSelectRadio = stage === 'daiAllowanceWaitingForConfirmation'

  const { t } = useTranslation()

  const isUnlimited = selectedDaiAllowanceRadio === 'unlimited'
  const isPayback = selectedDaiAllowanceRadio === 'actionAmount'
  const isCustom = selectedDaiAllowanceRadio === 'custom'

  const actionDaiAmount = depositDaiAmount?.gt(zero) ? depositDaiAmount : paybackAmount
  const actionDaiAmountKey = depositDaiAmount?.gt(zero) ? 'dai-depositing' : 'dai-paying-back'

  const onChangeHandler = depositDaiAmount?.gt(zero)
    ? setDaiAllowanceAmountToDepositDaiAmount
    : setDaiAllowanceAmountToPaybackAmount

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
          <Radio onChange={onChangeHandler!} name="manage-vault-dai-allowance" checked={isPayback}>
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t(actionDaiAmountKey, { amount: formatCryptoBalance(actionDaiAmount!) })}
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
                  borderColor: 'secondary100',
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
