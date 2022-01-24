import { BigNumber } from 'bignumber.js'
import { COLLATERALIZATION_DANGER_OFFSET, COLLATERALIZATION_WARNING_OFFSET } from 'blockchain/ilks'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { openMultiplyVaultStory } from 'helpers/stories/OpenMultiplyVaultStory'
import { zero } from 'helpers/zero'

import { OpenMultiplyVaultView } from '../containers/OpenMultiplyVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

// TO DO ADD TO BLOCKING ACTUALLY!!!!!!!!
// export const OpeningEmptyVault = openMultiplyVaultStory({
//   title: 'User is opening an empty vault',
//   proxyAddress,
// })()

// export const OpeningVaultWithCollateralOnly = openMultiplyVaultStory({
//   title: 'User is opening a vault with collateral only',
//   proxyAddress,
// })({
//   depositAmount: new BigNumber('100'),
// })

export const OpeningVaultWithCollateralAndDebt = openMultiplyVaultStory({
  title: 'User is opening a vault with collateral and debt',
  proxyAddress,
})({
  depositAmount: new BigNumber('100'),
})

export const NoProxyAddress = openMultiplyVaultStory({
  title: 'User has no proxyAddress and will have to create one before opening a vault',
})({ depositAmount: new BigNumber('100') })

export const InsufficientAllowance = openMultiplyVaultStory({
  title:
    'User has no allowance for the given collateral and will have to set it before opening a vault',
  proxyAddress,
  allowance: zero,
  ilk: 'WBTC-A',
})({
  depositAmount: new BigNumber('100'),
})

export const PotentialGenerateAmountLessThanDebtFloor = openMultiplyVaultStory({
  title:
    'User has no allowance for the given collateral and will have to set it before opening a vault',
  proxyAddress,
  allowance: zero,
})({
  depositAmount: new BigNumber('3'),
})

export const VaultWillBeAtRiskLevelDanger = openMultiplyVaultStory({
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
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
  requiredCollRatio: new BigNumber(1.75),
})

export const VaultWillBeAtRiskLevelDangerAtNextPrice = openMultiplyVaultStory({
  title: `Warning is shown to indicate to the user that if this vault is created it will be near liquidation at next price update given the action they are taking and is shown when the vaults future collateralization ratio is within ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio. So if liquidation ratio is 150%, this would be 150% >= x <= ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%`,
  priceInfo: {
    ethChangePercentage: new BigNumber('-0.4'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
  requiredCollRatio: new BigNumber(2.5),
})

export const VaultWillBeAtRiskLevelWarning = openMultiplyVaultStory({
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
  proxyAddress,
})({
  depositAmount: new BigNumber('200'),
  requiredCollRatio: new BigNumber(2.15),
})

export const VaultWillBeAtRiskLevelWarningAtNextPrice = openMultiplyVaultStory({
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
    ethChangePercentage: new BigNumber('-0.3'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('100'),
  requiredCollRatio: new BigNumber(2.8),
})

export const DepositingAllCollateralBalance = openMultiplyVaultStory({
  title:
    'Warning is shown when a user is depositing the balance of collateral for the vault they have in their wallet',
  balanceInfo: {
    collateralBalance: new BigNumber('10'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
})

export const GeneratingAllDaiFromIlkDebtAvailable = openMultiplyVaultStory({
  title:
    'Warning is shown when a user is generating all dai remaining for a given ilk which results in that ilks debt ceiling being reached',
  ilkData: {
    debtCeiling: new BigNumber('10000'),
    ilkDebt: new BigNumber('5000'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
  requiredCollRatio: new BigNumber(3.35),
})

export const GeneratingAllDaiFromDepositingCollateral = openMultiplyVaultStory({
  title:
    'Warning is shown when a user is generating the maximum amount of dai for the amount of collateral being deposited',
  proxyAddress,
})({
  depositAmount: new BigNumber('150'),
  requiredCollRatio: new BigNumber(1.5),
})

export const GeneratingAllDaiFromDepositingCollateralAtNextPrice = openMultiplyVaultStory({
  title:
    'Warning is shown when a user is generating the maximum amount of dai for the amount of collateral being deposited',
  priceInfo: {
    ethChangePercentage: new BigNumber('-0.1'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('100'),
  requiredCollRatio: new BigNumber(1.825),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenMultiplyVault/Non-Blocking',
  component: OpenMultiplyVaultView,
}
