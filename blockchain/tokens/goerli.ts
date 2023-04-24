import { ADDRESSES } from '@oasisdex/addresses'
import * as eth from 'blockchain/abi/ds-eth-token.json'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networksConfig'
import { ContractDesc } from 'features/web3Context'
import { Dictionary } from 'ts-essentials'

import { supportedIlks } from './mainnet'

export const ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI = 8420373
export const AAVE_V3_POOL_GENESIS_GOERLI = 8294332
export const AAVE_V2_LENDING_POOL_GENESIS_GOERLI = 7480475

const { goerli } = ADDRESSES

export const tokensGoerli = {
  ...getCollateralTokens(goerli.common, supportedIlks),
  GUNIV3DAIUSDC1: contractDesc(guniToken, goerli.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, goerli.common.GUNIV3DAIUSDC2),
  WETH: contractDesc(eth, goerli.common.ETH),
  DAI: contractDesc(erc20, goerli.common.DAI),
  LDO: contractDesc(erc20, goerli.common.LDO),
  MKR: contractDesc(erc20, goerli.maker.common.McdGov),
  STETH: contractDesc(erc20, goerli.common.STETH),
  USDP: contractDesc(erc20, goerli.common.PAXUSD),
  WSTETH: contractDesc(erc20, goerli.common.WSTETH),
  WBTC: contractDesc(erc20, goerli.common.WBTC),
  RENBTC: contractDesc(erc20, goerli.common.RENBTC),
} as Dictionary<ContractDesc>
