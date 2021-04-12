import { BigNumber } from 'bignumber.js'
import { one, zero } from 'helpers/zero'

import { manageVaultStory } from './ManageVaultBuilder'
import { ManageVaultView } from './ManageVaultView'

export const DepositAndWithdrawAmountsEmpty = manageVaultStory({
  title:
    'If both the deposit and withdraw input fields are empty when editing "Collateral" then we flag the error and block the flow propagating as no vault change would occur',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
})

export const PaybackAndWithdrawAmountsEmpty = manageVaultStory({
  title:
    'If both the generate and payback input fields are empty when editing "Dai" then we flag the error and block the flow propagating as no vault change would occur',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
  stage: 'daiEditing',
})

export const DepositEmpty = manageVaultStory({
  title:
    'Similar to DepositAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Collateral" editing stage they would only be able deposit so we block the flow if no deposit amount is set',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
    controller: '0x1',
  },
  account: '0x0',
})

export const PaybackEmpty = manageVaultStory({
  title:
    'Similar to PaybackAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Dai" editing stage they would only be able payback so we block the flow if no payback amount is set',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
    controller: '0x1',
  },
  stage: 'daiEditing',
  account: '0x0',
})

export const DepositAmountExceedsCollateralBalance = manageVaultStory({
  title:
    'Error is shown where a user is trying to deposit more collateral than they have as balance in their account',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('5') },
  stage: 'collateralEditing',
  depositAmount: new BigNumber('6'),
})

export const WithdrawAmountExceedsFreeCollateral = manageVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which is greater than the amount of collateral which is "free", not backing the outstanding debt in the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  stage: 'collateralEditing',
  withdrawAmount: new BigNumber('8'),
})

export const WithdrawAmountExceedsFreeCollateralAtNextPrice = manageVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which at next price update is greater than the amount of collateral which is "free", not backing the outstanding debt in the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  priceInfo: { collateralChangePercentage: new BigNumber('-0.1') },
  stage: 'collateralEditing',
  withdrawAmount: new BigNumber('6'),
})

export const GenerateAmountExceedsDebtCeiling = manageVaultStory({
  title:
    'Error is shown where the total debt generated for an ilk is almost at the debt ceiling and the amount of dai the user wants to generate would be greater than the difference. In this example, the user has plenty of collateral in their vault to generate plenty of DAI but is blocked as there is only 15,000 DAI until the ceiling is reached',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('30'),
    debt: new BigNumber('3000'),
  },
  ilkData: { ilkDebt: new BigNumber('15000'), debtCeiling: new BigNumber('16000') },
  stage: 'daiEditing',
  generateAmount: new BigNumber('2000'),
})

export const GenerateAmountExceedsDaiYieldFromTotalCollateral = manageVaultStory({
  title:
    'Error is shown when a user is trying to generate an amount of DAI that is greater than the maximum of dai that can be generated from the collateral already locked in the vault and the amount of collateral the user is also depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  stage: 'collateralEditing',
  showDepositAndGenerateOption: true,
  depositAmount: new BigNumber('3'),
  generateAmount: new BigNumber('4000'),
})

export const GenerateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice = manageVaultStory({
  title:
    'Error is shown when a user is trying to generate an amount of DAI that is greater than the maximum of dai at next price update that can be generated from the collateral already locked in the vault and the amount of collateral the user is also depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.6'),
  },
  stage: 'collateralEditing',
  showDepositAndGenerateOption: true,
  depositAmount: new BigNumber('30'),
  generateAmount: new BigNumber('4000'),
})

export const GenerateAmountLessThanDebtFloor = manageVaultStory({
  title:
    'Error is shown when a user is generating an amount of DAI that would cause the debt outstanding in the vault to be less than the dust limit/debt floor. In more detail, if this vault has a debt of 1999 DAI and the dust limit was 2000 DAI, were the user to generate 1 DAI, then they could proceed',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: zero,
  },
  ilkData: { debtFloor: new BigNumber('200') },
  stage: 'daiEditing',
  generateAmount: new BigNumber('1'),
})

export const PaybackAmountExceedsDaiBalance = manageVaultStory({
  title: 'Error occurs when user is trying to pay back more DAI than they have',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('50'),
    debt: new BigNumber('9000'),
  },
  balanceInfo: { daiBalance: new BigNumber('5000') },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('6000'),
})

export const PaybackAmountExceedsVaultDebt = manageVaultStory({
  title:
    'Error occurs when the user tries to payback more DAI than is required to clear vault debt',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('6000'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
})

export const PaybackAmountCausesVaultDebtToBeLessThanDebtFloor = manageVaultStory({
  title:
    'Error occurs when the user pays back an amount of DAI which causes the remaining vault debt to be under the dust limit',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('4000'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
})

export const VaultWillBeUnderCollateralizedAtNextPrice = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  stage: 'daiEditing',
  generateAmount: new BigNumber('4000'),
  priceInfo: { collateralChangePercentage: new BigNumber('-0.3') },
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Errors',
  component: ManageVaultView,
}
