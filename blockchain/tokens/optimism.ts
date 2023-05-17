import { ADDRESSES, Tokens } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import { contractDesc } from 'blockchain/networksConfig'
import { ContractDesc } from 'features/web3Context'

const { optimism } = ADDRESSES

const tokens = Object.entries(optimism.common).reduce((acc, [key, value]) => {
  return {
    ...acc,
    [key]: contractDesc(erc20, value),
  }
}, {}) as Record<Tokens, ContractDesc>

export const tokensOptimism: Record<string, ContractDesc> = {
  ...tokens,
}
