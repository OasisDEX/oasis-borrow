import BigNumber from 'bignumber.js'
import { FIAT_PRECISION } from 'components/constants'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatBigNumber } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { FC, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Text } from 'theme-ui'

interface AjnaEarnInputButtonProps {
  variant: '-' | '+'
}

const AjnaEarnInputButton: FC<AjnaEarnInputButtonProps> = ({ variant }) => {
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
        transition: 'border-color 200ms',
        '&:hover': {
          borderColor: 'neutral70',
          bg: 'neutral10',
          '&::before, &::after': {
            width: '12px',
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
    />
  )
}

export const AjnaEarnInput: FC = () => {
  const { t } = useTranslation()
  const {
    environment: { priceFormat, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { price },
    },
  } = useAjnaProductContext('earn')
  console.log('refreshed')
  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [manualAmount, setManualAmount] = useState<BigNumber>(price || zero)

  return (
    <>
      <Text as="p" variant="paragraph4" sx={{ textAlign: 'center' }}>
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
          '&:hover': {
            borderColor: 'neutral70',
          },
        }}
      >
        <BigNumberInput
          type="text"
          mask={createNumberMask({
            allowDecimal: true,
            decimalLimit: FIAT_PRECISION,
            prefix: '$',
          })}
          onFocus={() => {
            setIsFocus(true)
          }}
          onBlur={() => {
            setIsFocus(false)
          }}
          onChange={handleNumericInput((n) => {
            console.log(`value: ${n}`)
          })}
          value={manualAmount ? formatBigNumber(manualAmount, FIAT_PRECISION) : ''}
          sx={{ px: 5, pt: 3, pb: '40px', border: 'none', fontSize: 4, textAlign: 'center' }}
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
            pointerEvents: 'none',
          }}
        >
          {priceFormat} {t('ajna.position-page.earn.common.form.lending-price')}
        </Text>
        <AjnaEarnInputButton variant="-" />
        <AjnaEarnInputButton variant="+" />
      </Box>
    </>
  )
}
