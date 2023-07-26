import { ADDRESSES } from '@oasisdex/addresses'
import * as erc20 from 'blockchain/abi/erc20.json'
import * as guniToken from 'blockchain/abi/guni-token.json'
import { getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { contractDesc } from 'blockchain/networks'
import { ContractDesc } from 'features/web3Context'

import { supportedIlks } from './mainnet'

export const ACCOUNT_GUARD_FACTORY_GENESIS_GOERLI = 8420373
export const AAVE_V3_POOL_GENESIS_GOERLI = 8294332
export const AAVE_V2_LENDING_POOL_GENESIS_GOERLI = 7480475

const { goerli } = ADDRESSES

export const tokensGoerli = {
  ...getCollateralTokens({ ...goerli.maker.pips, ...goerli.common }, supportedIlks),
  CBETH: contractDesc(erc20, goerli.common.CBETH),
  CRVV1ETHSTETH: contractDesc(guniToken, goerli.common.CRVV1ETHSTETH),
  DAI: contractDesc(erc20, goerli.common.DAI),
  GHO: contractDesc(erc20, goerli.common.GHO),
  GUNIV3DAIUSDC1: contractDesc(guniToken, goerli.common.GUNIV3DAIUSDC1),
  GUNIV3DAIUSDC2: contractDesc(guniToken, goerli.common.GUNIV3DAIUSDC2),
  LDO: contractDesc(erc20, goerli.common.LDO),
  MKR: contractDesc(erc20, goerli.maker.common.McdGov),
  RENBTC: contractDesc(erc20, goerli.common.RENBTC),
  STETH: contractDesc(erc20, goerli.common.STETH),
  USDC: contractDesc(erc20, goerli.common.USDC),
  USDP: contractDesc(erc20, goerli.common.PAXUSD),
  WBTC: contractDesc(erc20, goerli.common.WBTC),
  WETH: contractDesc(erc20, goerli.common.WETH),
  WLD: contractDesc(erc20, goerli.common.WLD),
  WSTETH: contractDesc(erc20, goerli.common.WSTETH),
} as Record<string, ContractDesc>
