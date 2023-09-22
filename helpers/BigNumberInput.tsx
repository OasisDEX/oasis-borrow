import { BigNumber } from 'bignumber.js'
import type { ChangeEvent } from 'react'
import React, { useRef } from 'react'
import type { MaskedInputProps } from 'react-text-mask'
import { default as MaskedInput } from 'react-text-mask'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Input } from 'theme-ui'

export const BigNumberInput = ({
  value,
  pipe,
  onChange,
  sx,
  ...props
}: MaskedInputProps & {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  variant?: string
  pipe?: Pipe
  sx?: ThemeUIStyleObject
}) => {
  const lastValue = useRef<string | undefined>()
  const changed = (e: React.ChangeEvent<HTMLInputElement>): void => {
    lastValue.current = e.target.value
    if (e.target.value !== '0._' && onChange) {
      onChange(e)
    }
  }

  const currentValue = value as string | undefined
  let maskValue: string | undefined
  if (
    lastValue.current &&
    currentValue &&
    new BigNumber(lastValue.current.replace(/,/g, '')).eq(
      new BigNumber(currentValue.replace(/,/g, '')),
    )
  ) {
    maskValue = lastValue.current
  } else {
    maskValue = currentValue
  }

  const allowOnlyOneDot = (v: string, { rawValue }: { rawValue: string }) =>
    rawValue.match(/\..*\./) ? false : v

  const maskPipe = [allowOnlyOneDot, ...(pipe ? [pipe] : [])].reduce(composePipes, (v: string) => v)

  return (
    <MaskedInput
      {...props}
      onChange={changed}
      value={maskValue}
      guide={false}
      defaultValue=""
      pipe={maskPipe}
      render={(ref, xprops) => (
        <Input
          ref={ref}
          {...xprops}
          sx={{
            color: 'primary100',
            fontWeight: 'semiBold',
            '&::placeholder': { color: 'neutral80' },
            ...sx,
          }}
        />
      )}
    />
  )
}

type Pipe = (v: string, config: { rawValue: string }) => string | false
export const composePipes = (p1: Pipe, p2: Pipe) => (v: string, config: { rawValue: string }) => {
  const tmp = p1(v, config)
  return tmp === false ? tmp : p2(tmp, config)
}

export const lessThanOrEqual =
  (max: BigNumber): Pipe =>
  (value: string) => {
    if (!value) {
      return value
    }
    return new BigNumber(value.replace(/,/g, '')).lte(max) ? value : false
  }
