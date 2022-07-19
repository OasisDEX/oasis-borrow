import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatBigNumber, formatCryptoBalance } from 'helpers/formatters/format'
import { calculateTokenPrecisionByValue } from 'helpers/tokens'
import { one, zero } from 'helpers/zero'
import React, { ChangeEvent, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Grid, Text } from 'theme-ui'

export type VaultAction = 'Deposit' | 'Withdraw' | 'Generate' | 'Payback' | 'Sell' | 'Buy'
const FIAT_PRECISION = 2

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
  currencyCode: string
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

  showToggle?: boolean
  toggleOnLabel?: string
  toggleOffLabel?: string
  toggleOffPlaceholder?: string
  onToggle?: (toggleStatus: boolean) => void
  defaultToggle?: boolean

  hasError: boolean
  collapsed?: boolean
}

export function VaultActionInput({
  action,
  currencyCode,
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
  auxiliaryToken: auxiliaryCurrencyCode,
  onAuxiliaryChange,
  maxAuxiliaryAmount,
  minAuxiliaryAmount,
  auxiliaryUsdPrice,

  showToggle,
  toggleOnLabel,
  toggleOffLabel,
  toggleOffPlaceholder,
  onToggle,
  defaultToggle = true,

  hasError,
  collapsed,
}: VaultActionInputProps) {
  const [auxiliaryFlag, setAuxiliaryFlag] = useState<boolean>(false)
  const [toggleStatus, setToggleStatus] = useState<boolean>(defaultToggle)
  const tokenSymbol = currencyCode !== 'USD' ? getToken(currencyCode).symbol : 'USD'
  const auxiliarySymbol = auxiliaryCurrencyCode ? getToken(auxiliaryCurrencyCode).symbol : 'USD'

  const toggleResolved = typeof defaultToggle === 'boolean' ? defaultToggle : toggleStatus

  const currencyDigits =
    currencyCode !== 'USD'
      ? calculateTokenPrecisionByValue({
          token: currencyCode,
          usdPrice: tokenUsdPrice,
        })
      : FIAT_PRECISION

  const auxiliaryDigits = auxiliaryCurrencyCode
    ? calculateTokenPrecisionByValue({
        token: auxiliaryCurrencyCode,
        usdPrice: auxiliaryUsdPrice!,
      })
    : FIAT_PRECISION

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
          paddingTop: 0,
          paddingBottom: 2,
        }}
      >
        <Text variant="paragraph4" sx={{ fontWeight: 'semiBold' }}>
          {action} {currencyCode}
        </Text>
        {(showMin || showMax || showToggle) && (
          <Text
            variant="paragraph4"
            sx={{
              fontWeight: 'semiBold',
              textAlign: 'right',
              color: 'neutral80',
            }}
          >
            {showMin && (
              <>
                {minAmountLabel}{' '}
                <Text
                  as="span"
                  sx={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
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
                    cursor: disabled ? 'not-allowed' : 'pointer',
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
            {(maxAmount?.isGreaterThan(zero) || minAmount?.isGreaterThan(zero)) &&
              (auxiliaryFlag ? auxiliarySymbol : tokenSymbol)}
            {showToggle && !disabled && (
              <Text
                as="span"
                sx={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (onToggle) onToggle(!toggleResolved)
                  setToggleStatus(!toggleResolved)
                }}
              >
                {toggleResolved ? toggleOnLabel : toggleOffLabel}
              </Text>
            )}
          </Text>
        )}
      </Grid>

      <Grid
        columns={hasAuxiliary ? '5fr 1fr' : 'auto'}
        sx={{
          border: '1px solid',
          borderRadius: 'medium',
          alignItems: 'center',
          borderColor: hasError ? 'critical100' : 'neutral20',
          transition: `
            box-shadow 200ms,
            border-color 200ms
          `,
          opacity: !toggleResolved && !disabled ? '0.5' : '1',
          ...(!disabled &&
            toggleResolved && {
              '&:hover, &:focus-within': {
                borderColor: hasError ? 'critical100' : 'neutral70',
              },
            }),
        }}
      >
        <Grid gap={0}>
          {!auxiliaryFlag ? (
            <BigNumberInput
              type="text"
              disabled={disabled || !toggleResolved}
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: currencyDigits,
                prefix: '',
              })}
              onChange={onChange}
              value={amount ? formatBigNumber(amount, currencyDigits) : ''}
              placeholder={toggleResolved ? `0 ${tokenSymbol}` : toggleOffPlaceholder}
              sx={hasAuxiliary ? { border: 'none', px: 3, pt: 3, pb: 1 } : { border: 'none', p: 3 }}
            />
          ) : (
            <BigNumberInput
              type="text"
              disabled={disabled || !toggleResolved}
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: auxiliaryDigits,
                prefix: '',
              })}
              onChange={onAuxiliaryChange}
              value={auxiliaryAmount ? formatBigNumber(auxiliaryAmount, auxiliaryDigits) : ''}
              placeholder={toggleResolved ? `0 ${auxiliarySymbol}` : toggleOffPlaceholder}
              sx={hasAuxiliary ? { border: 'none', px: 3, pt: 3, pb: 1 } : { border: 'none', p: 3 }}
            />
          )}
          {hasAuxiliary && (
            <Text
              variant="paragraph4"
              sx={{
                fontWeight: 'semiBold',
                color: 'neutral80',
                px: 3,
                pb: 2,
                pt: 1,
              }}
            >
              {toggleResolved ? (
                <>
                  {!auxiliaryFlag
                    ? `~ ${
                        auxiliarySymbol === 'USD'
                          ? formatAmount(auxiliaryAmount || zero, 'USD')
                          : formatBigNumber(auxiliaryAmount || zero, auxiliaryDigits)
                      } ${auxiliarySymbol}`
                    : `${formatBigNumber(amount || zero, currencyDigits)} ${tokenSymbol}`}
                </>
              ) : (
                toggleOffPlaceholder
              )}
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
              ...(!toggleResolved && { pointerEvents: 'none' }),
              '& svg': {
                transform: 'rotate(90deg)',
                transition: 'color 200ms',
                color: 'neutral60',
                '&:hover': {
                  color: 'neutral70',
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
