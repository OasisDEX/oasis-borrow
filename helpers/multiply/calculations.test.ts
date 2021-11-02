import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { VaultEvent } from 'features/vaultHistory/vaultHistoryEvents'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { calculatePNL } from 'helpers/multiply/calculations'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

// based on https://docs.google.com/spreadsheets/d/144cmXYXe89tzjUOrgj8eK7B2pU2WSQBdZr6s1GeXnms/edit#gid=0
const multiplyBaseEvent = {
  marketPrice: zero,
  oraclePrice: zero,

  beforeDebt: zero,
  debt: zero,

  beforeLockedCollateral: zero,
  lockedCollateral: zero,

  beforeCollateralizationRatio: zero,
  collateralizationRatio: zero,

  multiple: zero,
  beforeMultiple: zero,

  urn: '0x',
  logIndex: 1,

  netValue: zero,

  liquidationRatio: zero,
  beforeLiquidationPrice: zero,
  liquidationPrice: zero,

  loanFee: zero,
  oazoFee: zero,
  totalFee: zero,
  gasFee: zero, // in wei
}

const mockedMultiplyEvents: VaultEvent[] = [
  {
    ...multiplyBaseEvent,
    kind: 'OPEN_MULTIPLY_VAULT',
    bought: zero,
    depositCollateral: new BigNumber(10),
    oraclePrice: new BigNumber(2000),
    marketPrice: new BigNumber(2000),
    depositDai: new BigNumber(0),
    gasFee: new BigNumber(0.01),
  },
  {
    ...multiplyBaseEvent,
    kind: 'INCREASE_MULTIPLE',
    bought: new BigNumber(5),
    depositCollateral: new BigNumber(0),
    oraclePrice: new BigNumber(2005),
    marketPrice: new BigNumber(2005),
    depositDai: new BigNumber(0),
    gasFee: new BigNumber(0.0375),
  },
  {
    kind: 'DEPOSIT',
    collateralAmount: new BigNumber(5),
    oraclePrice: new BigNumber(2700),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
  {
    ...multiplyBaseEvent,
    kind: 'INCREASE_MULTIPLE',
    bought: new BigNumber(7),
    depositCollateral: new BigNumber(0),
    depositDai: new BigNumber(0),
    oraclePrice: new BigNumber(2700),
    marketPrice: new BigNumber(2700),
    gasFee: new BigNumber(0.02225),
  },
  {
    kind: 'WITHDRAW',
    collateralAmount: new BigNumber(-2),
    oraclePrice: new BigNumber(2705),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
  {
    kind: 'GENERATE',
    daiAmount: new BigNumber(1000),
    oraclePrice: new BigNumber(2650),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
  {
    ...multiplyBaseEvent,
    kind: 'DECREASE_MULTIPLE',
    sold: new BigNumber(5),
    withdrawnDai: new BigNumber(0),
    withdrawnCollateral: new BigNumber(0),
    oraclePrice: new BigNumber(2650),
    marketPrice: new BigNumber(2650),
    gasFee: new BigNumber(0.02825),
  },
]

describe('Multiply calculations', () => {
  it('Calculates PNL correctly', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('20'),
          debt: new BigNumber('16680'),
        },
        priceInfo: {
          ethPrice: new BigNumber('2650'),
          collateralPrice: new BigNumber('2650'),
        },
        exchangeQuote: {
          marketPrice: new BigNumber('2650'),
        },
      }),
    )

    const pnl = calculatePNL(mockedMultiplyEvents, state().netValueUSD)

    expect(pnl).to.be.deep.equal(new BigNumber('0.26865298507462686567'))
  })
})
