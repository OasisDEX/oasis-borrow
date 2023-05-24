import { BigNumber } from 'bignumber.js'
import { wethToEthAddress } from 'blockchain/aave-v3/utils'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networkIds'
import { networksById } from 'blockchain/networksConfig'
import { amountFromRay, amountFromWei } from 'blockchain/utils'
import { AaveV2ProtocolDataProvider__factory } from 'types/ethers-contracts'

export interface AaveV2UserReserveDataParameters {
  token: string
  address: string
}

export interface AaveV2ReserveDataParameters {
  token: AaveV2UserReserveDataParameters['token']
}

export interface AaveV2UserReserveData {
  currentATokenBalance: BigNumber
  currentStableDebt: BigNumber
  currentVariableDebt: BigNumber
  principalStableDebt: BigNumber
  scaledVariableDebt: BigNumber
  stableBorrowRate: BigNumber
  liquidityRate: BigNumber
  usageAsCollateralEnabled: boolean
}

export type AaveV2ReserveDataReply = {
  availableLiquidity: BigNumber
  totalStableDebt: BigNumber
  totalVariableDebt: BigNumber
  liquidityRate: BigNumber
  variableBorrowRate: BigNumber
  stableBorrowRate: BigNumber
  averageStableBorrowRate: BigNumber
  liquidityIndex: BigNumber
  variableBorrowIndex: BigNumber
  lastUpdateTimestamp: BigNumber
}

export type AaveV2ReserveConfigurationData = {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x057835ad21a177dbdd3090bb1cae03eacf78fc6d#readContract
}

const factory = AaveV2ProtocolDataProvider__factory
const rpcProvider = networksById[NetworkIds.MAINNET].readProvider
const address = getNetworkContracts(NetworkIds.MAINNET).aaveV2ProtocolDataProvider.address
const tokenMappings = getNetworkContracts(NetworkIds.MAINNET).tokens
const contract = factory.connect(address, rpcProvider)

export function getAaveV2UserReserveData({
  token,
  address,
}: AaveV2UserReserveDataParameters): Promise<AaveV2UserReserveData> {
  return contract
    .getUserReserveData(wethToEthAddress(tokenMappings, token), address)
    .then((result) => {
      return {
        currentATokenBalance: amountFromWei(
          new BigNumber(result.currentATokenBalance.toString()),
          token,
        ),
        currentStableDebt: amountFromWei(new BigNumber(result.currentStableDebt.toString()), token),
        currentVariableDebt: amountFromWei(
          new BigNumber(result.currentVariableDebt.toString()),
          token,
        ),
        principalStableDebt: amountFromWei(
          new BigNumber(result.principalStableDebt.toString()),
          token,
        ),
        scaledVariableDebt: amountFromWei(
          new BigNumber(result.scaledVariableDebt.toString()),
          token,
        ),
        stableBorrowRate: amountFromRay(new BigNumber(result.stableBorrowRate.toString())),
        liquidityRate: amountFromRay(new BigNumber(result.liquidityRate.toString())),
        usageAsCollateralEnabled: result.usageAsCollateralEnabled,
      }
    })
}

export function getAaveV2ReserveConfigurationData({
  token,
}: AaveV2ReserveDataParameters): Promise<AaveV2ReserveConfigurationData> {
  return contract
    .getReserveConfigurationData(wethToEthAddress(tokenMappings, token))
    .then((result) => {
      return {
        ltv: new BigNumber(result.ltv.toString()).div(10000), // 6900 -> 0.69
        liquidationThreshold: new BigNumber(result.liquidationThreshold.toString()).div(10000), // 8100 -> 0.81
        liquidationBonus: new BigNumber(result.liquidationBonus.toString()).minus(10000).div(10000), // 10750 -> 750 -> -> 0.075
      }
    })
}

export function getAaveV2ReserveData({
  token,
}: AaveV2ReserveDataParameters): Promise<AaveV2ReserveDataReply> {
  return contract.getReserveData(wethToEthAddress(tokenMappings, token)).then((result) => {
    return {
      availableLiquidity: amountFromWei(new BigNumber(result.availableLiquidity.toString()), token),
      totalStableDebt: amountFromWei(new BigNumber(result.totalStableDebt.toString()), token),
      totalVariableDebt: amountFromWei(new BigNumber(result.totalVariableDebt.toString()), token),
      liquidityRate: amountFromRay(new BigNumber(result.liquidityRate.toString())),
      variableBorrowRate: amountFromRay(new BigNumber(result.variableBorrowRate.toString())),
      stableBorrowRate: amountFromRay(new BigNumber(result.stableBorrowRate.toString())),
      averageStableBorrowRate: amountFromRay(
        new BigNumber(result.averageStableBorrowRate.toString()),
      ),
      liquidityIndex: new BigNumber(result.liquidityIndex.toString()),
      variableBorrowIndex: new BigNumber(result.variableBorrowIndex.toString()),
      lastUpdateTimestamp: new BigNumber(result.lastUpdateTimestamp.toString()),
    }
  })
}
