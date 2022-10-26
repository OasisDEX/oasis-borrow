import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import {
  errorsAutoTakeProfitValidation,
  warningsAutoTakeProfitValidation,
} from 'features/automation/optimization/autoTakeProfit/validators'
import { zero } from 'helpers/zero'

const autoTakeProfitWarningsValidationBaseData = {
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

const autoTakeProfitErrorsValidationBaseData = {
  nextCollateralPrice: new BigNumber(1500),
  executionPrice: new BigNumber(1600),
  txError: undefined,
}

describe('auto take profit warnings', () => {
  it('should show warning about potentially insufficient eth funds for transaction', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      ethBalance: new BigNumber(0.0001),
      autoBuyTriggerPrice: new BigNumber(1400),
      isAutoBuyEnabled: true,
    })

    expect(warnings).to.be.deep.eq(['potentialInsufficientEthFundsForTx'])
  })
  it('should show warning that ATP is lower than auto-buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      autoBuyTriggerPrice: new BigNumber(2000),
      isAutoBuyEnabled: true,
    })

    expect(warnings).to.be.deep.eq(['autoTakeProfitTriggerLowerThanAutoBuyTrigger'])
  })
  it('should show warning that ATP is equal to auto-buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      autoBuyTriggerPrice: new BigNumber(1500),
      isAutoBuyEnabled: true,
    })

    expect(warnings).to.be.deep.eq(['autoTakeProfitTriggerLowerThanAutoBuyTrigger'])
  })
  it('should show warning that ATP is lower than constant-multiple buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      isConstantMultipleEnabled: true,
      constantMultipleBuyTriggerPrice: new BigNumber(2000),
    })

    expect(warnings).to.be.deep.eq(['autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger'])
  })
  it('should show warning that ATP is equal to constant-multiple buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      isConstantMultipleEnabled: true,
      constantMultipleBuyTriggerPrice: new BigNumber(1500),
    })

    expect(warnings).to.be.deep.eq(['autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger'])
  })
  it('should return empty warning array when auto-buy and constant-multiple triggers not created', () => {
    const warnings = warningsAutoTakeProfitValidation(autoTakeProfitWarningsValidationBaseData)

    expect(warnings).to.be.deep.eq([])
  })
  it('should return empty warning array when auto-buy enabled and auto-take profit trigger greater than auto-buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      isAutoBuyEnabled: true,
      autoBuyTriggerPrice: new BigNumber(1300),
    })

    expect(warnings).to.be.deep.eq([])
  })
  it('should return empty warning array when constant-multiple enabled and auto-take profit trigger greater than constant-multiple buy trigger', () => {
    const warnings = warningsAutoTakeProfitValidation({
      ...autoTakeProfitWarningsValidationBaseData,
      isConstantMultipleEnabled: true,
      constantMultipleBuyTriggerPrice: new BigNumber(1300),
    })

    expect(warnings).to.be.deep.eq([])
  })
})

describe('auto take profit errors', () => {
  it('should show error about insufficient eth funds for transaction', () => {
    const errors = errorsAutoTakeProfitValidation({
      ...autoTakeProfitErrorsValidationBaseData,
      txError: { name: '', message: 'insufficient funds for gas * price + value' },
    })

    expect(errors).to.be.deep.eq(['insufficientEthFundsForTx'])
  })
  it('should return empty error array when no errors', () => {
    const errors = errorsAutoTakeProfitValidation(autoTakeProfitErrorsValidationBaseData)

    expect(errors).to.be.deep.eq([])
  })
  it('should show error saying that auto-take profit trigger will be executed immediately', () => {
    const errors = errorsAutoTakeProfitValidation({
      ...autoTakeProfitErrorsValidationBaseData,
      nextCollateralPrice: new BigNumber(1900),
    })

    expect(errors).to.be.deep.eq(['autoTakeProfitTriggeredImmediately'])
  })
})
