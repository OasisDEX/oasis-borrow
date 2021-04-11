import { BigNumber } from 'bignumber.js'
import { protoContextConnected } from 'blockchain/network'
import { one } from 'helpers/zero'

import { manageVaultStory } from './ManageVaultBuilder'
import { ManageVaultView } from './ManageVaultView'

export const DepositAndWithdrawAmountsEmpty = manageVaultStory({
  title:
    'If both the deposit and withdraw input fields are empty when editing "Collateral" then we flag the error and block the flow propagating as no vault change would occur',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
})

export const PaybackAndWithdrawAmountsEmpty = manageVaultStory({
  title:
    'If both the generate and payback input fields are empty when editing "Dai" then we flag the error and block the flow propagating as no vault change would occur',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  stage: 'daiEditing',
})

export const DepositEmpty = manageVaultStory({
  title:
    'Similar to DepositAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Collateral" editing stage they would only be able deposit so we block the flow if no deposit amount is set',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  context: { ...protoContextConnected, account: '0x0' },
  controller: '0x1',
})

export const PaybackEmpty = manageVaultStory({
  title:
    'Similar to PaybackAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Daiu" editing stage they would only be able payback so we block the flow if no payback amount is set',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  stage: 'daiEditing',
  context: { ...protoContextConnected, account: '0x0' },
  controller: '0x1',
})

export const DepositAmountExceedsCollateralBalance = manageVaultStory({
  title:
    'Error is shown where a user is trying to deposit more collateral than they have as balance in their account',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  stage: 'collateralEditing',
  _balanceInfo: { collateralBalance: new BigNumber('5') },
  depositAmount: new BigNumber('6'),
})

export const withdrawAmountExceedsFreeCollateral = manageVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which would cause it to become undercollateralized',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  stage: 'collateralEditing',
  withdrawAmount: new BigNumber('2'),
})

export const GenerateAmountExceedsDebtCeiling = manageVaultStory({
  title:
    'Error is shown where the total debt generated for an ilk is almost at the debt ceiling and the amount of dai the user wants to generate would be greater than the difference. In this example, the user has plenty of collateral in their vault to generate plenty of DAI but is blocked as there is only 15,000 DAI until the ceiling is reached',
  ilk: 'WBTC-A',
  collateral: new BigNumber('2'),
  debt: new BigNumber('3000'),
  stage: 'daiEditing',
  generateAmount: new BigNumber('20000'),
  _ilkData: { ilkDebtAvailable: new BigNumber('15000') },
})

export const GenerateAmountExceedsDaiThatCanBeGenerated = manageVaultStory({
  title:
    'Error is shown when a user is trying to generate an amount of DAI that would cause the vault to be undercollateralized',
  ilk: 'WBTC-A',
  collateral: new BigNumber('1'),
  debt: new BigNumber('3000'),
  stage: 'daiEditing',
  generateAmount: new BigNumber('40000'),
})

export const GenerateAmountLessThanDebtFloor = manageVaultStory({
  title:
    'Error is shown when a user is generating an amount of DAI that would cause the debt outstanding in the vault to be less than the dust limit/debt floor. In more detail, if this vault has a debt of 1999 DAI and the dust limit was 2000 DAI, were the user to generate 1 DAI, then they could proceed',
  ilk: 'WBTC-A',
  collateral: new BigNumber('1'),
  stage: 'daiEditing',
  generateAmount: new BigNumber('1'),
})

export const PaybackAmountExceedsDaiBalance = manageVaultStory({
  title: 'Error occurs when user is trying to pay back more DAI than they have',
  ilk: 'WBTC-A',
  collateral: new BigNumber('1'),
  debt: new BigNumber('20000'),
  stage: 'daiEditing',
  paybackAmount: new BigNumber('6000'),
  _balanceInfo: { daiBalance: new BigNumber('5000') },
})

export const PaybackAmountExceedsVaultDebt = manageVaultStory({
  title:
    'Error occurs when the user tries to payback more DAI than is required to clear vault debt',
  ilk: 'WBTC-A',
  collateral: new BigNumber('1'),
  debt: new BigNumber('5000'),
  stage: 'daiEditing',
  paybackAmount: new BigNumber('6000'),
  _balanceInfo: { daiBalance: new BigNumber('10000') },
})

export const PaybackAmountCausesVaultDebtToBeLessThanDebtFloor = manageVaultStory({
  title:
    'Error occurs when the user pays back an amount of DAI which causes the remaining vault debt to be under the dust limit',
  ilk: 'WBTC-A',
  collateral: new BigNumber('1'),
  debt: new BigNumber('5000'),
  stage: 'daiEditing',
  paybackAmount: new BigNumber('4000'),
  _balanceInfo: { daiBalance: new BigNumber('10000') },
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Validations',
  component: ManageVaultView,
}
