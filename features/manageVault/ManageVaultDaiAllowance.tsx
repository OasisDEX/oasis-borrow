import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AllowanceOption } from 'features/openVault/OpenVaultAllowance'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Card, Flex, Grid, Link, Radio, Spinner, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultDaiAllowance({
  stage,
  daiAllowanceTxHash,
  etherscan,
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
      {stage === 'daiAllowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('setting-allowance-for', { token: 'DAI' })}
              </Text>
              <Link
                href={`${etherscan}/tx/${daiAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'daiAllowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('set-allowance-for', { token: 'DAI' })}
              </Text>
              <Link
                href={`${etherscan}/tx/${daiAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}
