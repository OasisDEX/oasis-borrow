import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { mockedStopLossTrigger } from 'helpers/mocks/stopLoss.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'

import { legacyToggle } from './legacyToggle'

// TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
describe.skip('manageVaultOtherActionsValidations', () => {
  beforeAll(() => {
    // TODO: remove after mainnet deployment
    window.location.search = ['?network=goerli'] as any
  })

  afterAll(() => {
    window.location.search = [] as any
  })

  it('validates if deposit amount exceeds collateral balance or depositing all ETH', () => {
    const depositAmountExceeds = new BigNumber('2')
    const depositAmountAll = new BigNumber('1')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        balanceInfo: {
          collateralBalance: new BigNumber('1'),
        },
        vault: {
          ilk: 'ETH-A',
        },
      }),
    )

    legacyToggle(state())
    state().updateDepositAmount!(depositAmountExceeds)
    expect(state().errorMessages).toEqual(['depositAmountExceedsCollateralBalance'])
    state().updateDepositAmount!(depositAmountAll)
    expect(state().errorMessages).toEqual(['depositingAllEthBalance'])
  })

  it(`validates if generate doesn't exceeds debt ceiling, debt floor`, () => {
    const generateAmountAboveCeiling = new BigNumber('30')
    const generateAmountBelowFloor = new BigNumber('9')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtCeiling: new BigNumber('8000025'),
          debtFloor: new BigNumber('2000'),
        },
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber(-0.1),
        },
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('withdrawDai')
    state().updateGenerateAmount!(generateAmountAboveCeiling)
    expect(state().errorMessages).toEqual(['generateAmountExceedsDebtCeiling'])

    state().updateGenerateAmount!(generateAmountBelowFloor)
    expect(state().errorMessages).toEqual(['generateAmountLessThanDebtFloor'])
  })

  it(`validates if generate amount is putting vault at risk, danger or exceeding day yield`, () => {
    const generateAmountExceedsYield = new BigNumber(1200)
    const generateAmountWarning = new BigNumber(100)
    const generateAmountDanger = new BigNumber(700)

    const generateAmountExceedsYieldNextPrice = new BigNumber(1000)
    const generateAmountWarningNextPrice = new BigNumber(40)
    const generateAmountDangerNextPrice = new BigNumber(500)

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3.4'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber('-0.05'),
        },
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('withdrawDai')
    state().updateGenerateAmount!(generateAmountExceedsYield)
    expect(state().errorMessages).toEqual(['generateAmountExceedsDaiYieldFromTotalCollateral'])

    state().updateGenerateAmount!(generateAmountWarning)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarning'])

    state().updateGenerateAmount!(generateAmountDanger)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelDanger'])

    state().updateGenerateAmount!(generateAmountExceedsYieldNextPrice)
    expect(state().errorMessages).toEqual([
      'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
    ])

    state().updateGenerateAmount!(generateAmountWarningNextPrice)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

    state().updateGenerateAmount!(generateAmountDangerNextPrice)
    expect(state().warningMessages).toEqual([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])
  })

  it(`validates if withdraw amount is putting vault at risk, danger or exceeding free collateral`, () => {
    const withdrawAmountExceedsFreeCollateral = new BigNumber(1.2)
    const withdrawAmountWarning = new BigNumber(0.4)
    const withdrawAmountDanger = new BigNumber(0.85)

    const withdrawAmountExceedsFreeCollateralAtNextPrice = new BigNumber(1.1)
    const withdrawAmountWarningNextPrice = new BigNumber(0.05)
    const withdrawAmountDangerNextPrice = new BigNumber(0.65)

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3.4'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber('-0.05'),
        },
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('withdrawCollateral')
    state().updateWithdrawAmount!(withdrawAmountExceedsFreeCollateral)
    expect(state().errorMessages).toEqual(['withdrawAmountExceedsFreeCollateral'])

    state().updateWithdrawAmount!(withdrawAmountWarning)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarning'])

    state().updateWithdrawAmount!(withdrawAmountDanger)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelDanger'])

    state().updateWithdrawAmount!(withdrawAmountExceedsFreeCollateralAtNextPrice)
    expect(state().errorMessages).toEqual(['withdrawAmountExceedsFreeCollateralAtNextPrice'])

    state().updateWithdrawAmount!(withdrawAmountWarningNextPrice)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

    state().updateWithdrawAmount!(withdrawAmountDangerNextPrice)
    expect(state().warningMessages).toEqual([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])
  })

  it('validates custom allowance setting for collateral', () => {
    const depositAmount = new BigNumber('100')
    const customAllowanceAmount = new BigNumber('99')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        collateralAllowance: zero,
      }),
    )

    legacyToggle(state())
    state().updateDepositAmount!(depositAmount)

    state().progress!()
    expect(state().stage).toEqual('collateralAllowanceWaitingForConfirmation')
    state().resetCollateralAllowanceAmount!()
    state().updateCollateralAllowanceAmount!(customAllowanceAmount)
    expect(state().collateralAllowanceAmount!).toEqual(customAllowanceAmount)
    expect(state().errorMessages).toEqual(['customCollateralAllowanceAmountLessThanDepositAmount'])

    state().updateCollateralAllowanceAmount!(maxUint256.plus(new BigNumber('1')))
    expect(state().errorMessages).toEqual(['customCollateralAllowanceAmountExceedsMaxUint256'])
  })

  it('validates custom allowance setting for dai', () => {
    const paybackAmount = new BigNumber('100')
    const customAllowanceAmount = new BigNumber('99')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        daiAllowance: zero,
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('paybackDai')
    state().updatePaybackAmount!(paybackAmount)

    state().progress!()
    expect(state().stage).toEqual('daiAllowanceWaitingForConfirmation')
    state().resetDaiAllowanceAmount!()
    state().updateDaiAllowanceAmount!(customAllowanceAmount)
    expect(state().daiAllowanceAmount!).toEqual(customAllowanceAmount)
    expect(state().errorMessages).toEqual(['customDaiAllowanceAmountLessThanPaybackAmount'])

    state().updateDaiAllowanceAmount!(maxUint256.plus(new BigNumber('1')))
    expect(state().errorMessages).toEqual(['customDaiAllowanceAmountExceedsMaxUint256'])
  })

  it('validates payback amount', () => {
    const paybackAmountExceedsVaultDebt = new BigNumber('100')
    const paybackAmountNotEnough = new BigNumber('20')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('30'),
        },
        vault: {
          debt: new BigNumber('40'),
        },
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('paybackDai')
    state().updatePaybackAmount!(paybackAmountExceedsVaultDebt)

    expect(state().errorMessages).toEqual(['paybackAmountExceedsVaultDebt'])

    state().updatePaybackAmount!(paybackAmountNotEnough)
    expect(state().errorMessages).toEqual(['debtWillBeLessThanDebtFloor'])
  })

  it('validates if dai allowance is enough to payback whole amount and account debt offset', () => {
    const paybackAmount = new BigNumber('500')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        vault: {
          collateral: new BigNumber('31'),
          debt: new BigNumber('2000'),
        },
        daiAllowance: paybackAmount,
        priceInfo: {
          collateralPrice: new BigNumber('100'),
        },
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('paybackDai')
    state().updatePaybackAmount!(paybackAmount.plus(state().vault.debtOffset))
    expect(state().insufficientDaiAllowance).toBe(true)

    state().updatePaybackAmount!(paybackAmount.minus(state().vault.debtOffset))
    expect(state().insufficientDaiAllowance).toBe(false)

    state().updatePaybackAmount!(paybackAmount)
    expect(state().insufficientDaiAllowance).toBe(true)

    state().progress!()
    expect(state().stage).toEqual('daiAllowanceWaitingForConfirmation')
  })

  it('should show meaningful message when trying to withdraw collateral on dusty vault', () => {
    const withdrawAmount = new BigNumber('5')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber(1000),
        },
        vault: {
          debt: new BigNumber(100),
          collateral: new BigNumber(10),
        },
        balanceInfo: {
          daiBalance: new BigNumber(1000),
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        daiAllowance: zero,
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('withdrawCollateral')

    state().updateWithdrawAmount!(withdrawAmount)
    expect(state().errorMessages).toEqual(['withdrawCollateralOnVaultUnderDebtFloor'])
  })

  it('validates if vault has no collateral and show correct error message', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: zero,
        },
      }),
    )

    expect(state().errorMessages).toEqual([])
    state().setOtherAction!('withdrawCollateral')
    expect(state().errorMessages).toEqual(['hasToDepositCollateralOnEmptyVault'])
    expect(state().canProgress).toEqual(false)
  })

  it('validates if next coll ratio on collateral withdraw is below stop loss level', () => {
    localStorage.setItem('features', '{"Automation":true}')
    const withdrawAmountStopLossError = new BigNumber(0.05)

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3.4'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        _automationTriggersData$: of(mockedStopLossTrigger),
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('withdrawCollateral')
    state().updateWithdrawAmount!(withdrawAmountStopLossError)
    expect(state().errorMessages).toEqual(['afterCollRatioBelowStopLossRatio'])
  })

  it('validates if next coll ratio on dai withdraw is below stop loss level', () => {
    localStorage.setItem('features', '{"Automation":true}')
    const withdrawAmountStopLossError = new BigNumber(500)

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3.4'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        _automationTriggersData$: of(mockedStopLossTrigger),
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('withdrawDai')
    state().updateGenerateAmount!(withdrawAmountStopLossError)
    expect(state().errorMessages).toEqual(['afterCollRatioBelowStopLossRatio'])
  })
})
