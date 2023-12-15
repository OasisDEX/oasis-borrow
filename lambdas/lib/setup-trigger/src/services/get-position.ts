import { PositionLike, PRICE_DECIMALS, TokenBalance } from '~types'
import { Address, ChainId } from 'shared/domain-types'
import { PublicClient } from 'viem'
import { Addresses } from './get-addresses'
import { aavePoolDataProviderAbi, aaveOracleAbi, erc20Abi } from '~abi'
import { calculateLtv } from './calculate-ltv'
import { Logger } from '@aws-lambda-powertools/logger'

export interface GetPositionParams {
  dpm: Address
  collateral: Address
  debt: Address
}
export async function getPosition(
  { dpm, collateral, debt }: GetPositionParams,
  publicClient: PublicClient,
  addresses: Addresses,
  logger?: Logger,
): Promise<PositionLike> {
  const [
    collateralData,
    debtData,
    oraclePrices,
    collateralDecimals,
    collateralSymbol,
    debtDecimals,
    debtSymbol,
  ] = await publicClient.multicall({
    contracts: [
      {
        abi: aavePoolDataProviderAbi,
        address: addresses.AaveDataPoolProvider,
        functionName: 'getUserReserveData',
        args: [collateral, dpm],
      },
      {
        abi: aavePoolDataProviderAbi,
        address: addresses.AaveDataPoolProvider,
        functionName: 'getUserReserveData',
        args: [debt, dpm],
      },
      {
        abi: aaveOracleAbi,
        address: addresses.AaveOracle,
        functionName: 'getAssetsPrices',
        args: [[collateral, debt]],
      },
      {
        abi: erc20Abi,
        address: collateral,
        functionName: 'decimals',
      },
      {
        abi: erc20Abi,
        address: collateral,
        functionName: 'symbol',
      },
      {
        abi: erc20Abi,
        address: debt,
        functionName: 'decimals',
      },
      {
        abi: erc20Abi,
        address: debt,
        functionName: 'symbol',
      },
    ],
    allowFailure: false,
  })

  const collateralAmount = collateralData[0]
  const debtAmount = debtData[1] + debtData[2]

  const [collateralPrice, debtPrice] = oraclePrices

  const collateralPriceInDebt = (collateralPrice * 10n ** PRICE_DECIMALS) / debtPrice

  const collateralResult: TokenBalance = {
    balance: collateralAmount,
    token: {
      decimals: collateralDecimals,
      symbol: collateralSymbol,
      address: collateral,
    },
  }

  const debtResult: TokenBalance = {
    balance: debtAmount,
    token: {
      decimals: debtDecimals,
      symbol: debtSymbol,
      address: debt,
    },
  }

  const ltv = calculateLtv({
    collateral: collateralResult,
    debt: debtResult,
    collateralPriceInDebt,
  })

  logger?.debug('Position data', {
    debt: debtResult,
    collateral: collateralResult,
    collateralPriceInDebt,
    ltv,
  })

  return {
    ltv,
    collateral: collateralResult,
    debt: debtResult,
    address: dpm,
  }
}
