import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { resolveLendingPriceIfOutsideRange } from 'features/ajna/positions/earn/helpers/resolveLendingPriceIfOutsideRange'
import {
  mappedAjnaBuckets,
  snapToPredefinedValues,
} from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC, KeyboardEvent } from 'react'
import React, { useEffect, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Text } from 'theme-ui'

type AjnaEarnInputButtonVariant = '-' | '+'

interface AjnaEarnInputButtonProps {
  disabled?: boolean
  variant: AjnaEarnInputButtonVariant
  onClick: (variant: AjnaEarnInputButtonVariant) => void
}
interface AjnaEarnInputProps {
  disabled?: boolean
}

const AjnaOmniEarnInputButton: FC<AjnaEarnInputButtonProps> = ({ disabled, variant, onClick }) => {
  return (
    <Button
      sx={{
        position: 'absolute',
        top: '12px',
        ...(variant === '-' && {
          left: '20px',
        }),
        ...(variant === '+' && {
          right: '20px',
        }),
        height: '28px',
        width: '28px',
        p: 0,
        color: 'primary100',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'ellipse',
        bg: 'neutral10',
        fontSize: 6,
        fontWeight: 'regular',
        lineHeight: '26px',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        transition: 'border-color 200ms, opacity 200ms',
        '&:hover': {
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: disabled ? 'neutral20' : 'neutral70',
          bg: 'neutral10',
          '&::before, &::after': {
            width: disabled ? '10px' : '12px',
          },
        },
        '&::before, &::after': {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: '10px',
          height: '2px',
          m: 'auto',
          borderRadius: '2px',
          bg: 'primary100',
        },
        '&::before': {
          content: '""',
        },
        '&::after': {
          transform: 'rotate(90deg)',
          ...(variant === '+' && {
            content: '""',
          }),
        },
      }}
      onClick={() => {
        if (!disabled) onClick(variant)
      }}
    />
  )
}

export const AjnaOmniEarnInput: FC<AjnaEarnInputProps> = ({ disabled }) => {
  const { t } = useTranslation()
  const {
    environment: { isOracless, isShort, priceFormat, quoteToken },
  } = useOmniGeneralContext()

  const {
    state: { price },
    dispatch,
  } = useAjnaCustomState()

  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [manualAmount, setManualAmount] = useState<BigNumber>(price || zero)

  const clickHandler = (variant: AjnaEarnInputButtonVariant) => {
    const snappedValue = snapToPredefinedValues(manualAmount)
    let index = mappedAjnaBuckets.indexOf(snappedValue)

    if (variant === '+') index = index - 1
    if (variant === '-') index = index + 1

    const selectedValue = mappedAjnaBuckets.at(index) || zero

    setManualAmount(selectedValue)
    dispatch({ type: 'price-change', price: selectedValue })
  }

  const enterPressedHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const value = resolveLendingPriceIfOutsideRange({ manualAmount })

      setManualAmount(value)
      dispatch({ type: 'price-change', price: value })
    }
  }

  useEffect(() => {
    setManualAmount(price || zero)
  }, [price])

  return (
    <>
      <Text
        as="p"
        variant="paragraph4"
        sx={{ textAlign: 'center', opacity: disabled ? 0.5 : 1, transition: 'opacity 200ms' }}
      >
        {t('ajna.position-page.earn.common.form.input-lending-price', { quoteToken })}
      </Text>
      <Box
        sx={{
          position: 'relative',
          mt: 2,
          border: '1px solid',
          borderColor: isFocus ? 'neutral70' : 'neutral20',
          borderRadius: 'medium',
          transition: 'border-color 200ms',
          cursor: disabled ? 'not-allowed' : 'default',
          '&:hover': {
            borderColor: disabled ? 'neutral20' : 'neutral70',
          },
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node) && manualAmount !== price) {
            const value = resolveLendingPriceIfOutsideRange({
              manualAmount,
            })

            setManualAmount(value)
            dispatch({ type: 'price-change', price: value })
          }
        }}
      >
        <BigNumberInput
          type="text"
          mask={createNumberMask({
            allowDecimal: true,
            decimalLimit: isOracless
              ? DEFAULT_TOKEN_DIGITS
              : formatCryptoBalance(manualAmount).split('.')[1]?.length || 0,
            prefix: '',
          })}
          onFocus={() => {
            setIsFocus(true)
          }}
          onBlur={() => {
            setIsFocus(false)
          }}
          onChange={handleNumericInput((n = zero) => {
            setManualAmount(isShort ? one.div(n) : n)
          })}
          onKeyPress={enterPressedHandler}
          value={
            manualAmount
              ? isOracless
                ? (isShort ? one.div(manualAmount) : manualAmount)
                    .dp(DEFAULT_TOKEN_DIGITS)
                    .toString()
                : formatCryptoBalance(isShort ? one.div(manualAmount) : manualAmount)
              : ''
          }
          sx={{
            px: 5,
            pt: 3,
            pb: '40px',
            border: 'none',
            fontSize: 4,
            textAlign: 'center',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
            transition: 'opacity 200ms',
          }}
        />
        <Text
          as="span"
          variant="paragraph4"
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 3,
            left: 0,
            textAlign: 'center',
            color: 'neutral80',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: 'none',
            transition: 'opacity 200ms',
          }}
        >
          {priceFormat} {t('ajna.position-page.earn.common.form.lending-price')}
        </Text>
        <AjnaOmniEarnInputButton disabled={disabled} variant="-" onClick={clickHandler} />
        <AjnaOmniEarnInputButton disabled={disabled} variant="+" onClick={clickHandler} />
      </Box>
    </>
  )
}
