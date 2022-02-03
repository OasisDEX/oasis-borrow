import { BigNumber } from 'bignumber.js'
import { COLLATERALIZATION_DANGER_OFFSET, COLLATERALIZATION_WARNING_OFFSET } from 'blockchain/ilks'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageVaultStory } from 'helpers/stories/ManageVaultStory'
import { one, zero } from 'helpers/zero'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const NoProxyAddress = manageVaultStory({
  title:
    'Warning is shown that the connected account has no proxy address and prior to executing the proposed transaction will have to set their proxy and make applicable allowances given the context of their action',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
})({
  depositAmount: one,
})

export const InsufficientCollateralAllowance = manageVaultStory({
  title:
    'Warning is shown when the user is depositing an amount of collateral and the allowance they have set on their proxy is less than that amount, the flow will direct the user to set the correct collateral allowance before depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  collateralAllowance: new BigNumber('9'),
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
})

export const InsufficientDaiAllowance = manageVaultStory({
  title:
    'Warning is shown when the user is paying back some of the debt in their vault and the allowance they have set on their proxy is less than that amount, the flow will direct the user to set the correct dai allowance before paying back',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  daiAllowance: new BigNumber('500'),
  proxyAddress,
})({
  stage: 'daiEditing',
  paybackAmount: new BigNumber('600'),
})

export const PotentialGenerateAmountLessThanDebtFloor = manageVaultStory({
  title:
    'Warning is shown when the amount of collateral in the vault plus the amount a user is depositing does not satisfy the amount of debt necessary to exceed the debt floor',
  vault: {
    ilk: 'WBTC-A',
    collateral: one,
    debt: zero,
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('4'),
})

export const DebtIsLessThanDebtFloor = manageVaultStory({
  title:
    'Warning is shown when the debt in the vault is non-zero and is less than the debt floor. This occurs when a the debt floor increases, leaving some vaults in a limited status in which the user can either close out their position or continue their position by depositing more collateral and generating more debt until it exceeds the new debt floor',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
  ilkData: {
    debtFloor: new BigNumber('10000'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('1'),
})

export const ConnectedAccountIsNotVaultController = manageVaultStory({
  title: 'We disable the form when the connected account does not match the owner of the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('4000'),
  },
  account: '0xNotVaultController',
  proxyAddress,
})({
  paybackAmount: new BigNumber('100'),
  stage: 'daiEditing',
})

export const VaultWillBeAtRiskLevelDanger = manageVaultStory({
  title: `Warning is shown to indicate to the user that this vault will be near liquidation given the action they are taking and is shown when the vaults new collateralization ratio is within ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio. So if liquidation ratio is 150%, this would be 150% >= x <= ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%`,
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: new BigNumber('2000'),
  },
  priceInfo: {
    collateralChangePercentage: new BigNumber('0.01'),
  },
  proxyAddress,
})({
  stage: 'daiEditing',
  generateAmount: new BigNumber('1500'),
})

export const VaultWillBeAtRiskLevelDangerAtNextPrice = manageVaultStory({
  title: `Warning is shown to indicate to the user that this vault will be near liquidation at next price update given the action they are taking and is shown when the vaults future collateralization ratio is within ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio. So if liquidation ratio is 150%, this would be 150% >= x <= ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%`,
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('2000'),
  },
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.4'),
  },
  proxyAddress,
})({
  stage: 'daiEditing',
  generateAmount: new BigNumber('2000'),
})

export const VaultWillBeAtRiskLevelWarning = manageVaultStory({
  title: `Warning is shown to indicate to the user that this vault is will be near liquidation at next price update given the action they are taking and is shown when the vaults new collateralization ratio is within ${COLLATERALIZATION_WARNING_OFFSET.times(
    100,
  )}% of the liquidation ratio but greater than ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio as that would mean it is at risk level danger. So if liquidation ratio is 150%, this would be ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%
> x <= ${new BigNumber(1.5).times(COLLATERALIZATION_WARNING_OFFSET.plus(1)).times(100)}%.`,
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: new BigNumber('2000'),
  },
  proxyAddress,
})({
  stage: 'daiEditing',
  generateAmount: new BigNumber('1000'),
})

export const VaultWillBeAtRiskLevelWarningAtNextPrice = manageVaultStory({
  title: `Warning is shown to indicate to the user that this vault is will be near liquidation at next price update given the action they are taking and is shown when the vaults future collateralization ratio is within ${COLLATERALIZATION_WARNING_OFFSET.times(
    100,
  )}% of the liquidation ratio but greater than ${COLLATERALIZATION_DANGER_OFFSET.times(
    100,
  )}% of the liquidation ratio as that would mean it is at risk level danger. So if liquidation ratio is 150%, this would be ${new BigNumber(
    1.5,
  )
    .times(COLLATERALIZATION_DANGER_OFFSET.plus(1))
    .times(100)}%
> x <= ${new BigNumber(1.5).times(COLLATERALIZATION_WARNING_OFFSET.plus(1)).times(100)}%.`,
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('2000'),
  },
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.3'),
  },
  proxyAddress,
})({
  stage: 'daiEditing',
  generateAmount: new BigNumber('2000'),
})

export const PayingBackAllDebt = manageVaultStory({
  title:
    'Warning is shown when a user is paying back all outstanding debt in a vault. After this action all debt should be cleared from the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('2000'),
  },
  balanceInfo: {
    daiBalance: new BigNumber('5000'),
  },
  proxyAddress,
})({
  stage: 'daiEditing',
  paybackAmount: new BigNumber('2000'),
})

export const DepositingAllCollateralBalance = manageVaultStory({
  title:
    'Warning is shown when a user is depositing the balance of collateral for the vault they have in their wallet',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('2000'),
  },
  balanceInfo: {
    collateralBalance: new BigNumber('10'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
})

export const PayingBackAllDaiBalance = manageVaultStory({
  title: 'Warning is shown when a user is paying back all dai balance in their wallet',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: {
    daiBalance: new BigNumber('500'),
  },
  proxyAddress,
})({
  stage: 'daiEditing',
  paybackAmount: new BigNumber('500'),
})

export const WithdrawingAllFreeCollateral = manageVaultStory({
  title: 'Warning is shown when a user is withdrawing all free collateral in their vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('2000'),
  },
  priceInfo: {
    collateralPrice: new BigNumber('1000'),
  },
  proxyAddress,
})({
  withdrawAmount: new BigNumber('17'),
})

export const WithdrawingAllFreeCollateralAtNextPrice = manageVaultStory({
  title:
    'Warning is shown when a user is withdrawing all free collateral in their vault at next price update',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('2000'),
  },
  priceInfo: {
    collateralPrice: new BigNumber('1000'),
    collateralChangePercentage: new BigNumber('-0.25'),
  },
  proxyAddress,
})({
  withdrawAmount: new BigNumber('16'),
})

export const GeneratingAllDaiFromIlkDebtAvailable = manageVaultStory({
  title:
    'Warning is shown when a user is generating all dai remaining for a given ilk which results in that ilks debt ceiling being reached',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('200'),
    debt: new BigNumber('2000'),
  },
  ilkData: {
    debtCeiling: new BigNumber('10000'),
    ilkDebt: new BigNumber('5000'),
  },
  proxyAddress,
})({
  generateAmount: new BigNumber('5000'),
  stage: 'daiEditing',
})

export const GeneratingAllDaiFromTotalCollateral = manageVaultStory({
  title:
    'Warning is shown when a user is generating the maximum amount of dai for the amount of collateral in the vault and being deposited',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('200'),
    debt: new BigNumber('2000'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('1'),
  generateAmount: new BigNumber('71700'),
})

export const GeneratingAllDaiFromTotalCollateralAtNextPrice = manageVaultStory({
  title:
    'Warning is shown when a user is generating the maximum amount of dai for the amount of collateral in the vault and being deposited',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('200'),
    debt: new BigNumber('2000'),
  },
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.1'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('1'),
  generateAmount: new BigNumber('64330'),
})

export const WithdrawCollateralOnVaultWithZeroDebt = manageVaultStory({
  title: 'Allowing user to proceed with withdrawing collateral if debt is zero',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: zero,
  },
  ilkData: { debtFloor: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'collateralEditing',
  withdrawAmount: new BigNumber('10'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Non-Blocking',
}
