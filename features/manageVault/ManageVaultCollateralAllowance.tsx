import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AllowanceOption } from 'features/openVault/OpenVaultAllowance'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Card, Flex, Grid, Label, Link, Radio, Spinner, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultCollateralAllowance({
  stage,
  collateralAllowanceTxHash,
  etherscan,
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

      {stage === 'collateralAllowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('setting-allowance-for', { token })}
              </Text>
              <Link
                href={`${etherscan}/tx/${collateralAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'collateralAllowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('set-allowance-for', { token })}
              </Text>
              <Link
                href={`${etherscan}/tx/${collateralAllowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}
