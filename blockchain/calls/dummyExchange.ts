import BigNumber from 'bignumber.js'
import * as dummyExchange from 'blockchain/abi/dummy-exchange.json'
import { getNetworkContracts } from 'blockchain/contracts'
import { contractDesc } from 'blockchain/networksConfig'
import { amountToWei } from 'blockchain/utils'
import { DummyExchange } from 'types/web3-v1-contracts'

import { CallDef } from './callsHelpers'

export const setExchangePrice: CallDef<{ price: BigNumber }, any> = {
  call: (_, { contract, chainId }) => {
    return contract<DummyExchange>(
      contractDesc(dummyExchange, getNetworkContracts(chainId).defaultExchange.address),
    ).methods.setPrice
  },
  prepareArgs: ({ price }: { price: BigNumber }) => [amountToWei(price, 'DAI').toFixed(0)],
}
