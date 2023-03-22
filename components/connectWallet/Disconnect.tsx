import { Web3Context } from 'features/web3Context'

export function disconnect(web3Context: Web3Context | undefined) {
  if (web3Context?.status === 'connected') {
    web3Context.deactivate()
  }
}
