import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networkIds'
import { networksById } from 'blockchain/networksConfig'
import { amountFromWei } from 'blockchain/utils'
import { AaveV2LendingPool__factory } from 'types/ethers-contracts'

export interface AaveV2UserAccountData {
  totalCollateralETH: BigNumber
  totalDebtETH: BigNumber
  availableBorrowsETH: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface AaveV2UserAccountDataParameters {
  address: string
}

export type AaveV2UserConfigurationsParameters = {
  address: string
}
export type AaveV2ConfigurationData = string[]

export type AaveV2GetUserAccountDataParameters = {
  address: string
}

export type AaveV2GetUserConfigurationParameters = {
  address: string
}

const factory = AaveV2LendingPool__factory
const rpcProvider = networksById[NetworkIds.MAINNET].readProvider
const address = getNetworkContracts(NetworkIds.MAINNET).aaveV2LendingPool.address
const contract = factory.connect(address, rpcProvider)

export function getAaveV2UserAccountData({
  address,
}: AaveV2GetUserAccountDataParameters): Promise<AaveV2UserAccountData> {
  return contract.getUserAccountData(address).then((result) => {
    return {
      totalCollateralETH: amountFromWei(new BigNumber(result.totalCollateralETH.toString()), 'ETH'),
      totalDebtETH: amountFromWei(new BigNumber(result.totalDebtETH.toString()), 'ETH'),
      availableBorrowsETH: amountFromWei(
        new BigNumber(result.availableBorrowsETH.toString()),
        'ETH',
      ),
      currentLiquidationThreshold: new BigNumber(result.currentLiquidationThreshold.toString()),
      ltv: new BigNumber(result.ltv.toString()),
      healthFactor: new BigNumber(result.healthFactor.toString()),
    }
  })
}

export function getAaveV2UserConfiguration({
  address,
}: AaveV2GetUserConfigurationParameters): Promise<AaveV2ConfigurationData> {
  return contract.getUserConfiguration(address).then((result) => {
    // TODO: Check it.
    return [result.toString()]
  })
}

export function getAaveV2ReservesList(): Promise<AaveV2ConfigurationData> {
  return contract.getReservesList()
}
