import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatBigNumber, formatCryptoBalance } from 'helpers/formatters/format'
import { calculateTokenPrecisionByValue } from 'helpers/tokens'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { one, zero } from 'helpers/zero'
import React, { ChangeEvent, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Grid, Text } from 'theme-ui'

type VaultAction = 'Deposit' | 'Withdraw' | 'Generate' | 'Payback' | 'Sell' | 'Buy'

export const PlusIcon = () => (
  <Icon
    name="plus"
    color="inherit"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

export const MinusIcon = () => (
  <Icon
    name="minus"
    color="inherit"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

interface VaultActionInputProps {
  action: VaultAction
  token: string
  tokenUsdPrice?: BigNumber
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  amount?: BigNumber

  hasAuxiliary?: boolean
  auxiliaryAmount?: BigNumber
  auxiliaryToken?: string
  onAuxiliaryChange?: (e: ChangeEvent<HTMLInputElement>) => void
  minAuxiliaryAmount?: BigNumber
  maxAuxiliaryAmount?: BigNumber
  auxiliaryUsdPrice?: BigNumber

  showMin?: boolean
  onSetMin?: () => void
  minAmount?: BigNumber
  minAmountLabel?: string

  showMax?: boolean
  onSetMax?: () => void
  maxAmount?: BigNumber
  maxAmountLabel?: string

  hasError: boolean
  collapsed?: boolean
}

export function VaultActionInput({
  action,
  token,
  tokenUsdPrice = one,
  amount,
  onChange,
  disabled,

  showMin,
  onSetMin,
  minAmount,
  minAmountLabel,

  showMax,
  onSetMax,
  maxAmount,
  maxAmountLabel,

  hasAuxiliary,
  auxiliaryAmount,
  auxiliaryToken,
  onAuxiliaryChange,
  maxAuxiliaryAmount,
  minAuxiliaryAmount,
  auxiliaryUsdPrice,

  hasError,
  collapsed,
}: VaultActionInputProps) {
  const [auxiliaryFlag, setAuxiliaryFlag] = useState<boolean>(false)
  const { symbol: tokenSymbol } = getToken(token)
  const { symbol: auxiliarySymbol } = auxiliaryToken ? getToken(auxiliaryToken) : { symbol: 'USD' }
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  const tokenDigits = calculateTokenPrecisionByValue({
    token: token,
    usdPrice: tokenUsdPrice,
  })

  const auxiliaryDigits = auxiliaryToken
    ? calculateTokenPrecisionByValue({
        token: auxiliaryToken,
        usdPrice: auxiliaryUsdPrice!,
      })
    : 2

  function handleAuxiliarySwitch() {
    setAuxiliaryFlag(!auxiliaryFlag)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        opacity: disabled ? '0.5' : '1',
        cursor: disabled ? 'not-allowed' : 'default',
        transition: 'opacity 200ms',
        ...(collapsed && {
          variant: 'styles.collapsedContentContainer',
        }),
      }}
    >
      <Grid
        columns="1fr 2fr"
        sx={{
          paddingTop: !newComponentsEnabled ? 2 : 0,
          paddingBottom: 2,
        }}
      >
        <Text variant="paragraph4" sx={{ fontWeight: 'semiBold' }}>
          {action} {token}
        </Text>
        {(showMin || showMax) && (
          <Text
            variant="paragraph4"
            sx={{
              fontWeight: 'semiBold',
              textAlign: 'right',
              color: 'text.subtitle',
            }}
          >
            {showMin && (
              <>
                {minAmountLabel}{' '}
                <Text
                  as="span"
                  sx={{
                    cursor: 'pointer',
                  }}
                  onClick={!disabled ? onSetMin : () => null}
                >
                  {auxiliaryFlag && BigNumber.isBigNumber(minAuxiliaryAmount)
                    ? formatCryptoBalance(minAuxiliaryAmount)
                    : !auxiliaryFlag && BigNumber.isBigNumber(minAmount)
                    ? formatCryptoBalance(minAmount)
                    : null}
                </Text>
              </>
            )}
            {showMax && maxAmount?.isGreaterThan(minAmount || zero) && (
              <>
                {showMin && ' - '}
                {maxAmountLabel}{' '}
                <Text
                  as="span"
                  sx={{
                    cursor: 'pointer',
                  }}
                  onClick={!disabled ? onSetMax : () => null}
                >
                  {auxiliaryFlag && BigNumber.isBigNumber(maxAuxiliaryAmount)
                    ? formatCryptoBalance(maxAuxiliaryAmount)
                    : !auxiliaryFlag && BigNumber.isBigNumber(maxAmount)
                    ? formatCryptoBalance(maxAmount)
                    : null}
                </Text>
              </>
            )}{' '}
            {tokenSymbol}
          </Text>
        )}
      </Grid>

      <Grid
        columns={hasAuxiliary ? '5fr 1fr' : 'auto'}
        sx={{
          border: '1px solid',
          borderRadius: 'medium',
          alignItems: 'center',
          borderColor: hasError ? 'onError' : 'border',
          transition: `
            box-shadow 200ms,
            border-color 200ms
          `,
          ...(disabled
            ? {}
            : {
                '&:hover, &:focus-within': {
                  borderColor: hasError ? 'onError' : 'borderSelected',
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
              value={amount ? formatBigNumber(amount, tokenDigits) : ''}
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
              value={auxiliaryAmount ? formatBigNumber(auxiliaryAmount, auxiliaryDigits) : ''}
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
                ? `~ ${
                    auxiliarySymbol === 'USD'
                      ? formatAmount(auxiliaryAmount || zero, 'USD')
                      : formatCryptoBalance(auxiliaryAmount || zero)
                  } ${auxiliarySymbol}`
                : `${formatCryptoBalance(amount || zero)} ${tokenSymbol}`}
            </Text>
          )}
        </Grid>
        {!disabled && hasAuxiliary && !!onAuxiliaryChange ? (
          <Box
            onClick={handleAuxiliarySwitch}
            sx={{
              cursor: 'pointer',
              textAlign: 'right',
              pr: 3,
              '& svg': {
                transform: 'rotate(90deg)',
                transition: 'color 200ms',
                color: 'lightIcon',
                '&:hover': {
                  color: 'borderSelected',
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
