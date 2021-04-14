import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import React from 'react'
import { useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Card, Flex, Grid, Label, Link, Radio, Spinner, Text } from 'theme-ui'
import { OpenVaultState } from './openVault'

export function OpenVaultAllowance({
  stage,
  allowanceTxHash,
  etherscan,
  token,
  balanceInfo: { collateralBalance },
  allowanceAmount,
  updateAllowanceAmount,
  setAllowanceAmountUnlimited,
  setAllowanceAmountToDepositAmount,
  resetAllowanceAmount,
}: OpenVaultState) {
  const [isCustom, setIsCustom] = useState<Boolean>(false)

  const canSelectRadio = stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFailure'

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      setAllowanceAmountUnlimited!()
    }
  }

  function handleDeposit() {
    if (canSelectRadio) {
      setIsCustom(false)
      setAllowanceAmountToDepositAmount!()
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      resetAllowanceAmount!()
      setIsCustom(true)
    }
  }

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleUnlimited}>
            <Radio name="dark-mode" value="true" defaultChecked={true} />
            <Text sx={{ fontSize: 2 }}>Unlimited Allowance</Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleDeposit}>
            <Radio name="dark-mode" value="true" />
            <Text sx={{ fontSize: 2 }}>
              {token} in wallet ({formatCryptoBalance(collateralBalance)})
            </Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleCustom}>
            <Radio name="dark-mode" value="true" />
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 2 }}>Custom</Text>
              <BigNumberInput
                sx={{ p: 1, borderRadius: 'small', width: '100px', fontSize: 1 }}
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
          </Label>
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
