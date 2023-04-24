import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { AaveV3Oracle } from 'types/web3-v1-contracts/'
export interface AaveV3AssetsPricesParameters {
  tokens: string[]
  baseCurrencyUnit: BigNumber
}

export const getAaveV3OracleBaseCurrencyUnit: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<AaveV3Oracle>(getNetworkContracts(chainId).aaveV3Oracle).methods.BASE_CURRENCY_UNIT,
  prepareArgs: () => [],
  postprocess: (baseCurrencyUnit) => new BigNumber(baseCurrencyUnit),
}

export const getAaveV3AssetsPrices: CallDef<AaveV3AssetsPricesParameters, BigNumber[]> = {
  call: (_, { contract, chainId }) =>
    contract<AaveV3Oracle>(getNetworkContracts(chainId).aaveV3Oracle).methods.getAssetsPrices,
  prepareArgs: ({ tokens }, { chainId }) => [
    tokens.map((token) => getNetworkContracts(chainId).tokens[token].address),
  ],
  // tokenPrice needs BASE_CURRENCY_UNIT
  postprocess: (tokenPrices, args) =>
    tokenPrices.map((tokenPrice) => new BigNumber(tokenPrice).div(args.baseCurrencyUnit)),
}

export type AaveV3OracleAssetPriceDataParameters = {
  token: string
  baseCurrencyUnit: BigNumber
}

export const getAaveV3OracleAssetPriceData$: CallDef<
  AaveV3OracleAssetPriceDataParameters,
  BigNumber
> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV3Oracle>(getNetworkContracts(chainId).aaveV3Oracle).methods.getAssetPrice
  },
  prepareArgs: ({ token }, { chainId }) => {
    return [getNetworkContracts(chainId).tokens[token].address]
  },
  postprocess: (result, args) => {
    return new BigNumber(result).div(args.baseCurrencyUnit)
  },
}
