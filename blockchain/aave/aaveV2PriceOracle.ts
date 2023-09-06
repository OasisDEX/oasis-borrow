import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { amountFromWei } from 'blockchain/utils'
import { one } from 'helpers/zero'
import { AaveV2PriceOracle__factory } from 'types/ethers-contracts'

export type AaveV2AssetsPricesParameters = {
  tokens: string[]
}

export type AaveV2GetAssetPriceParameters = {
  token: string
  amount?: BigNumber
}

const factory = AaveV2PriceOracle__factory
const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
const { address } = getNetworkContracts(NetworkIds.MAINNET).aaveV2PriceOracle
const contract = factory.connect(address, rpcProvider)
const tokenMappings = getNetworkContracts(NetworkIds.MAINNET).tokens

export function getAaveV2AssetsPrices({
  tokens,
}: AaveV2AssetsPricesParameters): Promise<BigNumber[]> {
  const tokenAddresses = tokens.map((token) => tokenMappings[token].address)

  return contract.getAssetsPrices(tokenAddresses).then((result) => {
    return result.map((tokenPriceInEth) =>
      amountFromWei(new BigNumber(tokenPriceInEth.toString()), 'ETH'),
    )
  })
}

export function getAaveV2OracleAssetPrice({
  token,
  amount = one,
}: AaveV2GetAssetPriceParameters): Promise<BigNumber> {
  if (token === 'ETH') return Promise.resolve(new BigNumber(1).times(amount))

  return contract.getAssetPrice(tokenMappings[token].address).then((result) => {
    return amountFromWei(new BigNumber(result.toString()).times(amount), 'ETH')
  })
}
