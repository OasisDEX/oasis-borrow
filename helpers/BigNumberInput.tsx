import { BigNumber } from 'bignumber.js'
import React, { useRef } from 'react'
import { default as MaskedInput } from 'react-text-mask'
import { Input } from 'theme-ui'

export const BigNumberInput = ({ value, pipe, onChange, ...props }: any) => {
  const lastValue = useRef<string | undefined>()
  const changed = (e: React.ChangeEvent<HTMLInputElement>): void => {
    lastValue.current = e.target.value
    if (e.target.value !== '0._') {
      onChange(e)
    }
  }

  const currentValue: string | undefined = value
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

  const maskPipe = [allowOnlyOneDot, ...(pipe ? [pipe] : [])].reduce(composePipes, (v: any) => v)

  return (
    <MaskedInput
      {...props}
      onChange={changed}
      value={maskValue}
      guide={false}
      defaultValue=""
      pipe={maskPipe}
      render={(ref, xprops) => <Input ref={ref} {...xprops} />}
    />
  )
}

type Pipe = (v: string, config: any) => string | false
export const composePipes = (p1: Pipe, p2: Pipe) => (v: string, config: any) => {
  const tmp = p1(v, config)
  return tmp === false ? tmp : p2(tmp, config)
}

export const lessThanOrEqual = (max: BigNumber): Pipe => (value: string) => {
  if (!value) {
    return value
  }
  return new BigNumber(value.replace(/,/g, '')).lte(max) ? value : false
}
