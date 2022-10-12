import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { warningsAutoTakeProfitValidation } from 'features/automation/optimization/autoTakeProfit/validators'
import { zero } from 'helpers/zero'

const autoTakeProfitBaseData = {
  token: 'ETH',
  ethBalance: new BigNumber(30),
  ethPrice: new BigNumber(1500),
  executionPrice: new BigNumber(1500),
  isAutoBuyEnabled: false,
  isConstantMultipleEnabled: false,
  autoBuyTriggerPrice: zero,
  constantMultipleBuyTriggerPrice: zero,
  gasEstimationUsd: new BigNumber(5),
}

describe('auto take profit warnings', () => {
  it('should show warning about potentially insufficient eth funds for transaction', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitBaseData,
      ethBalance: new BigNumber(0.0001),
      autoBuyTriggerPrice: new BigNumber(1400),
      isAutoBuyEnabled: true,
    })

    expect(warnings).to.be.deep.eq(['potentialInsufficientEthFundsForTx'])
  })
  it('should show warning that ATP is lower than auto-buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitBaseData,
      autoBuyTriggerPrice: new BigNumber(2000),
      isAutoBuyEnabled: true,
    })

    expect(warnings).to.be.deep.eq(['autoTakeProfitTriggerLowerThanAutoBuyTrigger'])
  })
  it('should show warning that ATP is lower than constant-multiple buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitBaseData,
      isConstantMultipleEnabled: true,
      constantMultipleBuyTriggerPrice: new BigNumber(2000),
    })

    expect(warnings).to.be.deep.eq(['autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger'])
  })
  it('should return empty warning array when auto-buy and constant-multiple triggers not created', () => {
    const warnings = warningsAutoTakeProfitValidation(autoTakeProfitBaseData)

    expect(warnings).to.be.deep.eq([])
  })
  it('should return empty warning array when auto-buy enabled and auto-take profit trigger greater than auto-buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitBaseData,
      isAutoBuyEnabled: true,
      autoBuyTriggerPrice: new BigNumber(1300),
    })

    expect(warnings).to.be.deep.eq([])
  })
  it('should return empty warning array when constant-multiple enabled and auto-take profit trigger greater than constant-multiple buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitBaseData,
      isConstantMultipleEnabled: true,
      constantMultipleBuyTriggerPrice: new BigNumber(1300),
    })

    expect(warnings).to.be.deep.eq([])
  })
})
