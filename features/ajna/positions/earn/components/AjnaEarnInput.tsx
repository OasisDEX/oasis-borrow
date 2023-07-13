import BigNumber from 'bignumber.js'
import { FIAT_PRECISION } from 'components/constants'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { resolveLendingPriceIfOutsideRange } from 'features/ajna/positions/earn/helpers/resolveLendingPriceIfOutsideRange'
import {
  mappedAjnaBuckets,
  snapToPredefinedValues,
} from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatBigNumber } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { FC, KeyboardEvent, useEffect, useState } from 'react'
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
  range: BigNumber[]
}

const AjnaEarnInputButton: FC<AjnaEarnInputButtonProps> = ({ disabled, variant, onClick }) => {
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

export const AjnaEarnInput: FC<AjnaEarnInputProps> = ({ disabled, range }) => {
  const { t } = useTranslation()
  const {
    environment: { priceFormat, quoteToken, isShort },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { price },
      updateState,
    },
  } = useAjnaProductContext('earn')
  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [manualAmount, setManualAmount] = useState<BigNumber>(price || zero)

  const clickHandler = (variant: AjnaEarnInputButtonVariant) => {
    const snappedValue = snapToPredefinedValues(manualAmount)
    let index = mappedAjnaBuckets.indexOf(snappedValue)
    if (variant === '+') index = Math.max(0, index - 1)
    if (variant === '-') index = Math.max(range.length - 1, index + 1)

    const selectedValue = mappedAjnaBuckets.at(index) || zero

    setManualAmount(selectedValue)
    updateState('price', selectedValue)
  }

  const enterPressedHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const value = resolveLendingPriceIfOutsideRange({ manualAmount })

      setManualAmount(value)
      updateState('price', value)
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
            updateState('price', value)
          }
        }}
      >
        <BigNumberInput
          type="text"
          mask={createNumberMask({
            allowDecimal: true,
            decimalLimit: FIAT_PRECISION,
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
              ? formatBigNumber(isShort ? one.div(manualAmount) : manualAmount, FIAT_PRECISION)
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
        <AjnaEarnInputButton disabled={disabled} variant="-" onClick={clickHandler} />
        <AjnaEarnInputButton disabled={disabled} variant="+" onClick={clickHandler} />
      </Box>
    </>
  )
}
