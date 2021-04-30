import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Card, Flex, Grid, Label, Link, Radio, Spinner, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'

function Option(props: React.PropsWithChildren<{ onClick?: () => void }>) {
  return (
    <Label
      sx={{
        border: 'light',
        borderRadius: 'mediumLarge',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        boxSizing: 'border-box',
      }}
      onClick={props.onClick}
    >
      {props.children}
    </Label>
  )
}

export function OpenVaultAllowance({
  stage,
  allowanceTxHash,
  etherscan,
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
          <Option onClick={setAllowanceAmountUnlimited!}>
            <Radio
              sx={{ mr: 3 }}
              name="allowance-open-form"
              value="true"
              defaultChecked={isUnlimited}
            />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </Option>
          <Option onClick={setAllowanceAmountToDepositAmount}>
            <Radio
              sx={{ mr: 3 }}
              name="allowance-open-form"
              value="true"
              defaultChecked={isDeposit}
            />
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </Option>
          <Option onClick={setAllowanceAmountCustom}>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <Radio
                sx={{ mr: 3 }}
                name="allowance-open-form"
                value="true"
                defaultChecked={isCustom}
              />
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
          </Option>
        </>
      )}

      {stage === 'allowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                Setting Allowance for {token}
              </Text>
              <Link
                href={`${etherscan}/tx/${allowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'allowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                Set Allowance for {token}
              </Text>
              <Link
                href={`${etherscan}/tx/${allowanceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}
