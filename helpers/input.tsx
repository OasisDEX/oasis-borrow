import BigNumber from 'bignumber.js'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ChangeEvent } from 'react'
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons'
import { Box, Button, Flex } from 'theme-ui'

import { TokenConfig } from '../blockchain/tokensMetadata'

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
          value={amount ? formatAmount(amount!, token.symbol) : undefined}
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

export function handleNumericInput(fn: (n?: BigNumber) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    const amount = value !== '' ? new BigNumber(value) : undefined
    fn(amount)
  }
}
