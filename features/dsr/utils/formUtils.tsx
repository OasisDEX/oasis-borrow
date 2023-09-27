import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelEventTypes } from 'analytics/types'
import BigNumber from 'bignumber.js'
import type { ManualChange } from 'features/dsr/helpers/dsrDeposit.types'

export function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    const amount = value === '' ? undefined : new BigNumber(value)
    if (amount) {
      trackingEvents.daiSavingsRate(MixpanelEventTypes.InputChange, {
        depositAmount: amount.toNumber(),
      })
    }

    change({
      kind: 'amount',
      amount,
    })
  }
}
