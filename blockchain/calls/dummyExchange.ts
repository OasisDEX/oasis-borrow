import BigNumber from 'bignumber.js'
import * as dummyExchange from 'blockchain/abi/dummy-exchange.json'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { contractDesc, NetworkIds } from 'blockchain/networks'
import { amountToWei } from 'blockchain/utils'
import { DummyExchange } from 'types/web3-v1-contracts'

export const setExchangePrice: CallDef<{ price: BigNumber }, any> = {
  call: (_, { contract, chainId }) => {
    return contract<DummyExchange>(
      contractDesc(
        dummyExchange,
        getNetworkContracts(NetworkIds.MAINNET, chainId).defaultExchange.address,
      ),
    ).methods.setPrice
  },
  prepareArgs: ({ price }: { price: BigNumber }) => [amountToWei(price, 'DAI').toFixed(0)],
}
