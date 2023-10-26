import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { mockManageVault, mockManageVault$ } from 'helpers/mocks/manageVault.mock'
import { mockedStopLossTrigger } from 'helpers/mocks/stopLoss.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'

// TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
describe.skip('manageVaultValidations', () => {
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
      mockManageVault$({
        balanceInfo: {
          collateralBalance: new BigNumber('1'),
        },
        vault: {
          ilk: 'ETH-A',
        },
      }),
    )

    state().updateDeposit!(depositAmountExceeds)
    expect(state().errorMessages).toEqual(['depositAmountExceedsCollateralBalance'])
    state().updateDeposit!(depositAmountAll)
    expect(state().errorMessages).toEqual(['depositingAllEthBalance'])
  })

  it(`validates if generate doesn't exceeds debt ceiling, debt floor`, () => {
    const depositAmount = new BigNumber('2001')
    const generateAmountAboveCeiling = new BigNumber('30000000')
    const generateAmountBelowFloor = new BigNumber('9')

    const state = getStateUnpacker(
      mockManageVault$({
        balanceInfo: {
          collateralBalance: new BigNumber('100000'),
        },
        ilkData: {
          debtCeiling: new BigNumber('8000025'),
          debtFloor: new BigNumber('2000'),
        },
        vault: {
          collateral: new BigNumber('9999'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber(-0.1),
        },
      }),
    )

    state().updateDeposit!(depositAmount)
    state().toggleDepositAndGenerateOption!()
    state().updateGenerate!(generateAmountAboveCeiling)
    expect(state().errorMessages).toEqual(['generateAmountExceedsDebtCeiling'])

    state().updateGenerate!(generateAmountBelowFloor)
    expect(state().errorMessages).toEqual(['generateAmountLessThanDebtFloor'])
  })

  it(`validates if generate or withdraw amounts are putting vault at risk, danger or exceeding day yield`, () => {
    const withdrawAmount = new BigNumber('0.1')
    const generateAmountExceedsYield = new BigNumber(60)
    const generateAmountWarnings = new BigNumber(20)

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber(-0.25),
        },
      }),
    )

    state().setMainAction!('withdrawPayback')
    state().updateWithdraw!(withdrawAmount)
    expect(state().errorMessages).toEqual(['withdrawAmountExceedsFreeCollateralAtNextPrice'])

    state().setMainAction!('depositGenerate')
    state().updateDeposit!(zero)
    state().toggleDepositAndGenerateOption!()
    state().updateGenerate!(generateAmountExceedsYield)
    expect(state().errorMessages).toEqual([
      'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
    ])

    state().updateGenerate!(generateAmountWarnings)
    expect(state().warningMessages).toEqual([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])
  })

  it(`validates if generate will result in warning at next price`, () => {
    const generateAmountWarnings = new BigNumber(20)

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('1690'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber(-0.1),
        },
      }),
    )

    state().updateDeposit!(zero)
    state().toggleDepositAndGenerateOption!()

    state().updateGenerate!(generateAmountWarnings)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarningAtNextPrice'])
  })

  it('validates custom allowance setting for collateral', () => {
    const depositAmount = new BigNumber('100')
    const customAllowanceAmount = new BigNumber('99')

    const state = getStateUnpacker(
      mockManageVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        collateralAllowance: zero,
      }),
    )

    state().updateDeposit!(depositAmount)

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
      mockManageVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        daiAllowance: zero,
      }),
    )

    state().toggle!('daiEditing')

    state().setMainAction!('withdrawPayback')
    state().updatePayback!(paybackAmount)

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
      mockManageVault$({
        vault: {
          debt: new BigNumber('40'),
        },
      }),
    )

    state().toggle!('daiEditing')
    state().setMainAction!('withdrawPayback')
    state().updatePayback!(paybackAmountExceedsVaultDebt)
    expect(state().errorMessages).toEqual(['paybackAmountExceedsVaultDebt'])

    state().updatePayback!(paybackAmountNotEnough)
    expect(state().errorMessages).toEqual(['debtWillBeLessThanDebtFloor'])
  })

  it('validates if dai allowance is enough to payback whole amount and account debt offset', () => {
    const paybackAmount = new BigNumber('500')

    const state = mockManageVault({
      proxyAddress: DEFAULT_PROXY_ADDRESS,
      vault: {
        collateral: new BigNumber('31'),
        debt: new BigNumber('2000'),
      },
      daiAllowance: paybackAmount,
      priceInfo: {
        collateralPrice: new BigNumber('100'),
      },
    })

    state().toggle!('daiEditing')
    state().setMainAction!('withdrawPayback')
    state().updatePayback!(paybackAmount.plus(state().vault.debtOffset))
    expect(state().insufficientDaiAllowance).toBe(true)

    state().updatePayback!(paybackAmount.minus(state().vault.debtOffset))
    expect(state().insufficientDaiAllowance).toBe(false)

    state().updatePayback!(paybackAmount)
    expect(state().insufficientDaiAllowance).toBe(true)

    state().progress!()
    expect(state().stage).toEqual('daiAllowanceWaitingForConfirmation')
  })

  it('should show meaningful message when trying to withdraw collateral on dusty vault', () => {
    const withdrawAmount = new BigNumber('5')

    const state = getStateUnpacker(
      mockManageVault$({
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

    state().setMainAction!('withdrawPayback')
    state().updateWithdraw!(withdrawAmount)
    expect(state().errorMessages).toEqual(['withdrawCollateralOnVaultUnderDebtFloor'])
    state().toggle!('daiEditing')
    state().setMainAction!('depositGenerate')
    state().updatePaybackMax!()
    expect(state().errorMessages).toEqual([])
  })

  it('should show meaningful message when trying to deposit to vault still being under dust limit (debt floor)', () => {
    const depositAmount = new BigNumber('1')

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {
          debtFloor: new BigNumber(10000),
        },
        vault: {
          debt: new BigNumber(5000),
          collateral: new BigNumber(6),
        },
        balanceInfo: {
          daiBalance: new BigNumber(1000),
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        daiAllowance: zero,
      }),
    )

    state().updateDeposit!(depositAmount)
    expect(state().errorMessages).toEqual(['depositCollateralOnVaultUnderDebtFloor'])
  })

  it('validates if next coll ratio on dai generate action is below stop loss level', () => {
    localStorage.setItem('features', '{"Automation":true}')
    const generateAmountStopLossError = new BigNumber(500)

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {
          debtFloor: new BigNumber(1500),
        },
        vault: {
          collateral: new BigNumber(4.5),
          debt: new BigNumber(1990),
          ilk: 'ETH-A',
        },
        _automationTriggersData$: of(mockedStopLossTrigger),
      }),
    )

    state().toggle!('daiEditing')
    state().setMainAction!('depositGenerate')
    state().updateGenerate!(generateAmountStopLossError)
    expect(state().errorMessages).toEqual(['afterCollRatioBelowStopLossRatio'])
  })

  it('validates if next coll ratio on collateral withdraw action is below stop loss level', () => {
    localStorage.setItem('features', '{"Automation":true}')
    const withdrawCollateralStopLossError = new BigNumber(0.5)

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {
          debtFloor: new BigNumber(1500),
        },
        vault: {
          collateral: new BigNumber(4.5),
          debt: new BigNumber(1990),
          ilk: 'ETH-A',
        },
        _automationTriggersData$: of(mockedStopLossTrigger),
      }),
    )

    state().setMainAction!('withdrawPayback')
    state().updateWithdraw!(withdrawCollateralStopLossError)
    expect(state().errorMessages).toEqual(['afterCollRatioBelowStopLossRatio'])
  })

  it('validates if deposit amount leads to potential insufficient ETH funds for tx (ETH ilk case)', () => {
    const depositAlmostAll = new BigNumber(10.9999)

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {},
        vault: {
          ilk: 'ETH-A',
          debt: new BigNumber(5000),
          collateral: new BigNumber(6),
        },
        balanceInfo: {
          ethBalance: new BigNumber(11),
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        gasEstimationUsd: new BigNumber(30),
      }),
    )

    state().updateDeposit!(depositAlmostAll)
    expect(state().warningMessages).toEqual(['potentialInsufficientEthFundsForTx'])
  })

  it('validates if deposit amount leads to potential insufficient ETH funds for tx (ETH ilk case)', () => {
    const depositAmount = new BigNumber(5)

    const state = getStateUnpacker(
      mockManageVault$({
        ilkData: {},
        vault: {
          ilk: 'WBTC-A',
          debt: new BigNumber(50000),
          collateral: new BigNumber(6),
        },
        balanceInfo: {
          ethBalance: new BigNumber(0.001),
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        gasEstimationUsd: new BigNumber(30),
      }),
    )

    state().updateDeposit!(depositAmount)
    expect(state().warningMessages).toEqual(['potentialInsufficientEthFundsForTx'])
  })
})
