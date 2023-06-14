import BigNumber from 'bignumber.js'

export const snapToPredefinedValues = (value: BigNumber, predefinedSteps: BigNumber[]) => {
  return predefinedSteps.reduce((prev, curr) => {
    return curr.minus(value).abs().lt(prev.minus(value).abs()) ? curr : prev
  })
}
