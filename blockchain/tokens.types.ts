import type BigNumber from 'bignumber.js'

export type TokenBalances = Record<string, { balance: BigNumber; price: BigNumber }>
