import BigNumber from 'bignumber.js'
import * as dummyExchange from 'blockchain/abi/dummy-exchange.json'
import { contractDesc } from 'blockchain/config'
import { amountToWei } from 'blockchain/utils'
import { DummyExchange } from 'types/web3-v1-contracts/dummy-exchange'

import { CallDef } from './callsHelpers'

export const setExchangePrice: CallDef<{ price: BigNumber }, any> = {
  call: (_, { contract, defaultExchange }) => {
    return contract<DummyExchange>(contractDesc(dummyExchange, defaultExchange.address)).methods
      .setPrice
  },
  prepareArgs: ({ price }: { price: BigNumber }) => [amountToWei(price, 'DAI').toFixed(0)],
}
