import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { ChangeEvent, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Grid, Text } from 'theme-ui'

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

  return (
    <Box
      sx={{
        position: 'relative',
        opacity: disabled ? '0.3' : '1.0',
        cursor: disabled ? 'not-allowed' : 'default',
      }}
    >
      <Grid columns="1fr 2fr" py={2}>
        <Text variant="paragraph4" sx={{ fontWeight: 'semiBold' }}>
          {action} {token}
        </Text>
        {!auxiliaryFlag && BigNumber.isBigNumber(maxAmount) && showMax ? (
          <Text
            onClick={!disabled ? onSetMax : () => null}
            variant="paragraph4"
            sx={{
              fontWeight: 'semiBold',
              textAlign: 'right',
              cursor: 'pointer',
              color: 'text.subtitle',
            }}
          >
            {maxAmountLabel} {formatAmount(maxAmount, tokenSymbol)} {tokenSymbol}
          </Text>
        ) : null}
        {auxiliaryFlag && BigNumber.isBigNumber(maxAuxiliaryAmount) && showMax ? (
          <Text
            onClick={!disabled ? onSetMax : () => null}
            variant="paragraph4"
            sx={{
              fontWeight: 'semiBold',
              textAlign: 'right',
              cursor: 'pointer',
              color: 'text.subtitle',
            }}
          >
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
          transition: `
            box-shadow ease-in 0.2s,
            border-color ease-in 0.2s
          `,
          ...(disabled
            ? {}
            : {
                '&:hover, &:focus-within': {
                  boxShadow: 'surface',
                  borderColor: hasError ? 'onError' : 'primary',
                },
              }),
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
            <Text
              variant="paragraph4"
              sx={{
                fontWeight: 'semiBold',
                color: 'text.subtitle',
                px: 3,
                pb: 2,
                pt: 1,
              }}
            >
              {!auxiliaryFlag
                ? `~${formatAmount(auxiliaryAmount || zero, auxiliarySymbol)} ${auxiliarySymbol}`
                : `~${formatAmount(amount || zero, tokenSymbol)} ${tokenSymbol}`}
            </Text>
          )}
        </Grid>
        {!disabled && hasAuxiliary && !!onAuxiliaryChange ? (
          <Box
            onClick={handleAuxiliarySwitch}
            sx={{
              cursor: 'pointer',
              '& svg': {
                transform: 'rotate(90deg)',
                transition: 'color 0.2s ease-in',
                color: 'lightIcon',
                '&:hover': {
                  color: 'lavender',
                },
              },
            }}
          >
            <Icon name="exchange" size={25} />
          </Box>
        ) : undefined}
      </Grid>
    </Box>
  )
}
