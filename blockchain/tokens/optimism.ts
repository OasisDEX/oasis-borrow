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
  USDC: contractDesc(erc20, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'),
  ETH: contractDesc(erc20, '0x4200000000000000000000000000000000000006'),
  WETH: contractDesc(erc20, '0x4200000000000000000000000000000000000006'),
}
