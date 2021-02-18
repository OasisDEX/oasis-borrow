import { Icon } from '@makerdao/dai-ui-icons'

import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { ChangeEvent, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

type VaultAction = 'Deposit' | 'Withdraw' | 'Generate' | 'Payback'

interface VaultActionInputProps {
  action: VaultAction
  token: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  amount?: BigNumber

  hasAuxiliary?: boolean
  auxiliaryAmount?: BigNumber
  auxiliaryToken?: string
  onAuxiliaryChange?: (e: ChangeEvent<HTMLInputElement>) => void
  maxAuxiliaryAmount?: BigNumber

  showMax?: boolean
  onSetMax?: () => void
  maxAmount?: BigNumber
  maxAmountLabel?: string

  hasError: boolean
}

export function VaultActionInput({
  action,
  token,
  amount,
  onChange,
  disabled,

  showMax,
  onSetMax,
  maxAmount,
  maxAmountLabel,

  hasAuxiliary,
  auxiliaryAmount,
  auxiliaryToken,
  onAuxiliaryChange,
  maxAuxiliaryAmount,

  hasError,
}: VaultActionInputProps) {
  const [auxiliaryFlag, setAuxiliaryFlag] = useState<boolean>(false)

  const { symbol: tokenSymbol, digits: tokenDigits } = getToken(token)
  const { symbol: auxiliarySymbol, digits: auxiliaryDigits } = auxiliaryToken
    ? getToken(auxiliaryToken)
    : { symbol: 'USD', digits: 2 }

  function handleAuxiliarySwitch() {
    setAuxiliaryFlag(!auxiliaryFlag)
  }

  console.log(!!auxiliaryFlag)
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Grid columns="1fr 2fr" py={2}>
        <Text sx={{ fontSize: 1 }}>
          {action} {token}
        </Text>
        {!auxiliaryFlag && BigNumber.isBigNumber(maxAmount) && showMax ? (
          <Text onClick={onSetMax} sx={{ fontSize: 1, textAlign: 'right', cursor: 'pointer' }}>
            {maxAmountLabel} {formatAmount(maxAmount, tokenSymbol)} {tokenSymbol}
          </Text>
        ) : null}
        {auxiliaryFlag && BigNumber.isBigNumber(maxAuxiliaryAmount) && showMax ? (
          <Text onClick={onSetMax} sx={{ fontSize: 1, textAlign: 'right', cursor: 'pointer' }}>
            {maxAmountLabel} ~{formatAmount(maxAuxiliaryAmount, auxiliarySymbol)} {auxiliarySymbol}
          </Text>
        ) : null}
      </Grid>

      <Grid
        columns={hasAuxiliary ? '5fr 1fr' : 'auto'}
        sx={{
          border: '1px solid',
          borderRadius: 'medium',
          alignItems: 'center',
          borderColor: hasError ? 'onError' : 'primaryAlt',
        }}
      >
        <Grid gap={0}>
          {!auxiliaryFlag ? (
            <BigNumberInput
              type="text"
              disabled={disabled}
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: tokenDigits,
                prefix: '',
              })}
              onChange={onChange}
              value={amount ? formatAmount(amount, tokenSymbol) : null}
              placeholder={`0 ${tokenSymbol}`}
              sx={hasAuxiliary ? { border: 'none', px: 3, pt: 3, pb: 1 } : { border: 'none', p: 3 }}
            />
          ) : (
            <BigNumberInput
              type="text"
              disabled={disabled}
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: auxiliaryDigits,
                prefix: '',
              })}
              onChange={onAuxiliaryChange}
              value={auxiliaryAmount ? formatAmount(auxiliaryAmount, auxiliarySymbol) : null}
              placeholder={`0 ${auxiliarySymbol}`}
              sx={hasAuxiliary ? { border: 'none', px: 3, pt: 3, pb: 1 } : { border: 'none', p: 3 }}
            />
          )}
          {hasAuxiliary && (
            <Text sx={{ fontSize: 2, px: 3, pb: 2, pt: 1 }}>
              {!auxiliaryFlag
                ? `~${formatAmount(auxiliaryAmount || zero, auxiliarySymbol)} ${auxiliarySymbol}`
                : `~${formatAmount(amount || zero, tokenSymbol)} ${tokenSymbol}`}
            </Text>
          )}
        </Grid>
        {hasAuxiliary && !!onAuxiliaryChange ? (
          <Box onClick={handleAuxiliarySwitch} sx={{ cursor: 'pointer' }}>
            <Icon name="exchange" size={25} sx={{ transform: 'rotate(90deg)' }} />
          </Box>
        ) : undefined}
      </Grid>
    </Box>
  )
}
