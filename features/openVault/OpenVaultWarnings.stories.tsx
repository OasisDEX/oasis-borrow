import { BigNumber } from 'bignumber.js'
import { COLLATERALIZATION_DANGER_OFFSET, COLLATERALIZATION_WARNING_OFFSET } from 'blockchain/ilks'
import { DEFAULT_PROXY_ADDRESS } from 'blockchain/vaults'
import { zero } from 'helpers/zero'

import { openVaultStory } from './OpenVaultBuilder'
import { OpenVaultView } from './OpenVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const OpeningEmptyVault = openVaultStory({
  title: 'User is opening an empty vault',
  proxyAddress,
})

export const OpeningVaultWithCollateralOnly = openVaultStory({
  title: 'User is opening a vault with collateral only',
  depositAmount: new BigNumber('100'),
  proxyAddress,
})

export const OpeningVaultWithCollateralAndDebt = openVaultStory({
  title: 'User is opening a vault with collateral and debt',
  depositAmount: new BigNumber('100'),
  generateAmount: new BigNumber('3000'),
  proxyAddress,
})

export const NoProxyAddress = openVaultStory({
  title: 'User has no proxyAddress and will have to create one before opening a vault',
})

export const InsufficientAllowance = openVaultStory({
  title:
    'User has no allowance for the given collateral and will have to set it before opening a vault',
  proxyAddress,
  depositAmount: new BigNumber('100'),
  allowance: zero,
})

export const PotentialGenerateAmountLessThanDebtFloor = openVaultStory({
  title:
    'User has no allowance for the given collateral and will have to set it before opening a vault',
  proxyAddress,
  depositAmount: new BigNumber('3'),
  allowance: zero,
})

export const VaultWillBeAtRiskLevelDanger = openVaultStory({
  title: `Warning is shown to indicate to the user that if this vault is created it will be near liquidation given the action they are taking and is shown when the vaults new collateralization ratio is within ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio. So if liquidation ratio is 150%, this would be 150% >= x <= ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%`,
  priceInfo: {
    collateralChangePercentage: new BigNumber('0.01'),
  },
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('3500'),
  proxyAddress,
})

export const VaultWillBeAtRiskLevelDangerAtNextPrice = openVaultStory({
  title: `Warning is shown to indicate to the user that if this vault is created it will be near liquidation at next price update given the action they are taking and is shown when the vaults future collateralization ratio is within ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio. So if liquidation ratio is 150%, this would be 150% >= x <= ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%`,
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.4'),
  },
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('2000'),
  proxyAddress,
})

export const VaultWillBeAtRiskLevelWarning = openVaultStory({
  title: `Warning is shown to indicate to the user that if this vault is created it will be near liquidation given the action they are taking and is shown when the vaults new collateralization ratio is within ${COLLATERALIZATION_WARNING_OFFSET.times(
    100,
  )}% of the liquidation ratio but greater than ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio as that would mean it is at risk level danger. So if liquidation ratio is 150%, this would be ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%
 > x <= ${new BigNumber(1.5).times(COLLATERALIZATION_WARNING_OFFSET.plus(1)).times(100)}%.`,
  depositAmount: new BigNumber('200'),
  generateAmount: new BigNumber('50000'),
  proxyAddress,
})

export const VaultWillBeAtRiskLevelWarningAtNextPrice = openVaultStory({
  title: `Warning is shown to indicate to the user that if this vault is created it will be near liquidation at next price update given the action they are taking and is shown when the vaults future collateralization ratio is within ${COLLATERALIZATION_WARNING_OFFSET.times(
    100,
  )}% of the liquidation ratio but greater than ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio as that would mean it is at risk level danger. So if liquidation ratio is 150%, this would be ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%
 > x <= ${new BigNumber(1.5).times(COLLATERALIZATION_WARNING_OFFSET.plus(1)).times(100)}%.`,
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.3'),
  },
  depositAmount: new BigNumber('100'),
  generateAmount: new BigNumber('20000'),
  proxyAddress,
})

export const DepositingAllCollateralBalance = openVaultStory({
  title:
    'Warning is shown when a user is depositing the balance of collateral for the vault they have in their wallet',
  depositAmount: new BigNumber('10'),
  balanceInfo: {
    collateralBalance: new BigNumber('10'),
  },
  proxyAddress,
})

export const GeneratingAllDaiFromIlkDebtAvailable = openVaultStory({
  title:
    'Warning is shown when a user is generating all dai remaining for a given ilk which results in that ilks debt ceiling being reached',
  ilkData: {
    debtCeiling: new BigNumber('10000'),
    ilkDebt: new BigNumber('5000'),
  },
  depositAmount: new BigNumber('100'),
  generateAmount: new BigNumber('5000'),
  proxyAddress,
})

export const GeneratingAllDaiFromDepositingCollateral = openVaultStory({
  title:
    'Warning is shown when a user is generating the maximum amount of dai for the amount of collateral being deposited',
  depositAmount: new BigNumber('150'),
  generateAmount: new BigNumber('55000'),
  proxyAddress,
})

export const GeneratingAllDaiFromDepositingCollateralAtNextPrice = openVaultStory({
  title:
    'Warning is shown when a user is generating the maximum amount of dai for the amount of collateral being deposited',
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.1'),
  },
  depositAmount: new BigNumber('100'),
  generateAmount: new BigNumber('33000'),
  proxyAddress,
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Warnings',
  component: OpenVaultView,
}
