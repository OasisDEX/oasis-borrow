import BigNumber from 'bignumber.js'
import { TokenConfig } from 'blockchain/config'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'i18n'
import React, { ChangeEvent } from 'react'
import { borderRadius } from 'react-select/src/theme'
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons'
import { Text, Box, Button, Flex, Grid } from 'theme-ui'

interface InputWithSuffixProps {
  input: React.ReactElement<HTMLInputElement>
  suffix: JSX.Element | null
}

interface InputWithMaxProps {
  disabled?: boolean
  disabledMax?: boolean
  token: TokenConfig
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSetMax: () => void
  hasError: boolean
  amount?: BigNumber
}

export function InputWithSuffix({ input, suffix }: InputWithSuffixProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {input}
      {suffix ? (
        <Flex
          sx={{
            position: 'absolute',
            alignItems: 'center',
            top: '50%',
            transform: 'translateY(-50%)',
            right: 3,
          }}
        >
          {suffix}
        </Flex>
      ) : null}
    </Box>
  )
}

export function InputWithMax({
  disabled,
  disabledMax,
  token,
  onChange,
  onSetMax,
  hasError,
  amount,
}: InputWithMaxProps) {
  const { t } = useTranslation()

  return (
    <InputWithSuffix
      input={
        <BigNumberInput
          type="text"
          disabled={disabled}
          mask={createNumberMask({
            allowDecimal: true,
            decimalLimit: token.digits,
            prefix: '',
          })}
          onChange={onChange}
          value={amount ? formatAmount(amount!, token.symbol) : null}
          placeholder={`0 ${token.symbol}`}
          variant={hasError ? 'inputError' : 'input'}
        />
      }
      suffix={
        <Button variant="secondary" disabled={disabledMax} onClick={onSetMax}>
          {t('max')}
        </Button>
      }
    />
  )
}

interface AmountInputProps {
  action: string
  balance: BigNumber
  disabled?: boolean

  token: TokenConfig
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  showMax?: boolean
  onSetMax?: () => void
  hasError: boolean
  amount?: BigNumber
}

export function AmountInput({
  action,
  disabled,
  balance,
  token,
  onChange,
  hasError,
  amount,
  showMax = false,
  onSetMax = () => null,
}: AmountInputProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ position: 'relative', border: '1px solid', borderRadius: 'medium' }}>
      <Grid columns="1fr 1fr" p={2}>
        <Text sx={{ fontSize: 1 }}>{action}</Text>
        <Text sx={{ fontSize: 1, textAlign: 'right' }}>
          Balance: {formatAmount(balance, token)}
        </Text>
      </Grid>

      <BigNumberInput
        type="text"
        disabled={disabled}
        mask={createNumberMask({
          allowDecimal: true,
          decimalLimit: token.digits,
          prefix: '',
        })}
        onChange={onChange}
        value={amount ? formatAmount(amount!, token.symbol) : null}
        placeholder={`0 ${token.symbol}`}
        variant={hasError ? 'inputError' : 'input'}
        sx={{ border: 'none' }}
      />

      {showMax ? (
        <Flex
          sx={{
            position: 'absolute',
            alignItems: 'center',
            top: '50%',
            transform: 'translateY(-50%)',
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
