import { BigNumber } from 'bignumber.js'
import { getToken, TokenConfig } from 'blockchain/tokensMetadata'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'i18n'
import React, { ChangeEvent } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Text, Grid, Flex, Button } from 'theme-ui'

type VaultAction = 'Deposit' | 'Withdraw' | 'Generate' | 'Payback'

interface VaultActionInputProps {
  balance?: BigNumber
  disabled?: boolean
  token: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  showMax?: boolean
  onSetMax?: () => void
  hasError: boolean
  action: VaultAction
  amount?: BigNumber
}

export function VaultActionInput({
  action,
  disabled,
  balance,
  token,
  onChange,
  hasError,
  showMax = false,
  onSetMax = () => null,
  amount,
}: VaultActionInputProps) {
  const { t } = useTranslation()

  const { symbol, digits } = getToken(token)
  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid',
        borderRadius: 'medium',
      }}
    >
      <Grid columns="1fr 2fr" p={2}>
        <Text sx={{ fontSize: 1 }}>
          {action} {token}
        </Text>
        {BigNumber.isBigNumber(balance) ? (
          <Text onClick={onSetMax} sx={{ fontSize: 1, textAlign: 'right', cursor: 'pointer' }}>
            Balance {formatAmount(balance, symbol)} {symbol}
          </Text>
        ) : null}
      </Grid>

      <BigNumberInput
        type="text"
        disabled={disabled}
        mask={createNumberMask({
          allowDecimal: true,
          decimalLimit: digits,
          prefix: '',
        })}
        onChange={onChange}
        value={
          BigNumber.isBigNumber(amount) && !amount.eq(zero) ? formatAmount(amount, symbol) : null
        }
        placeholder={`0 ${symbol}`}
        sx={{ border: 'none' }}
      />

      {showMax ? (
        <Flex
          sx={{
            position: 'absolute',
            alignItems: 'center',
            transform: 'translateY(-125%)',
            right: 3,
          }}
        >
          <Button variant="secondary" onClick={onSetMax}>
            {t('max')}
          </Button>
        </Flex>
      ) : null}
    </Box>
  )
}
