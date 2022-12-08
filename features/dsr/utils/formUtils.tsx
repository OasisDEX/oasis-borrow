import BigNumber from "bignumber.js"
import { ManualChange } from "../pipes/dsrDeposit"

export function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')

    change({
      kind: 'amount',
      amount: value === '' ? undefined : new BigNumber(value),
    })
  }
}