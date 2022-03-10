import BigNumber from 'bignumber.js'
import { one, zero } from 'helpers/zero'

import { VaultHistoryEvent } from '../../features/vaultHistory/vaultHistory'

// based on https://docs.google.com/spreadsheets/d/144cmXYXe89tzjUOrgj8eK7B2pU2WSQBdZr6s1GeXnms/edit#gid=0
const multiplyBaseEvent = {
  token: 'ETH',
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

  timestamp: '',
  hash: '0x',
  id: '0',

  rate: one,
}

export const mockedMultiplyEvents: VaultHistoryEvent[] = [
  {
    ...multiplyBaseEvent,
    kind: 'OPEN_MULTIPLY_VAULT',
    bought: zero,
    depositCollateral: new BigNumber(10),
    oraclePrice: new BigNumber(2000),
    ethPrice: new BigNumber(2650),
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
    ethPrice: new BigNumber(2650),
    marketPrice: new BigNumber(2005),
    depositDai: new BigNumber(0),
    gasFee: new BigNumber(0.0375),
  },
  {
    token: 'ETH',
    kind: 'DEPOSIT',
    collateralAmount: new BigNumber(5),
    oraclePrice: new BigNumber(2700),
    ethPrice: new BigNumber(2650),
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
    ethPrice: new BigNumber(2650),
    marketPrice: new BigNumber(2700),
    gasFee: new BigNumber(0.02225),
  },
  {
    token: 'ETH',
    kind: 'WITHDRAW',
    collateralAmount: new BigNumber(-2),
    oraclePrice: new BigNumber(2705),
    ethPrice: new BigNumber(2650),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
  {
    token: 'ETH',
    kind: 'GENERATE',
    daiAmount: new BigNumber(1000),
    oraclePrice: new BigNumber(2650),
    ethPrice: new BigNumber(2650),
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
    ethPrice: new BigNumber(2650),
    marketPrice: new BigNumber(2650),
    gasFee: new BigNumber(0.02825),
  },
]
