import { EventTypes, trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { ManualChange } from 'features/dsr/helpers/dsrDeposit'

export function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    const amount = value === '' ? undefined : new BigNumber(value)

    if (amount) {
      trackingEvents.daiSavingsRate(EventTypes.InputChange, { depositAmount: amount.toNumber() })
    }

    change({
      kind: 'amount',
      amount,
    })
  }
}
