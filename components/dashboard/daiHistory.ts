import padStart from 'lodash/padStart'
import { fromPromise } from 'rxjs/internal-compatibility'

import { ContextConnected } from '../blockchain/network'

// const EVENT_ERC20_TRANSFER = funcSigTopic('transfer(address,uint256)');

export function createTransferHistory$(context: ContextConnected, address: string) {
  // 8600000 is 2019-09-22 on mainnet and 2018-09-04 on kovan
  const fromBlock = [1, 42].includes(context.chainId) ? 8600000 : 1

  return fromPromise(
    context.web3ProviderGetPastLogs.eth.getPastLogs({
      address: context.tokens.DAI.address,
      topics: [null, null, '0x' + padStart(address.slice(2), 64, '0').toLowerCase()],
      fromBlock,
    }),
  )
}
