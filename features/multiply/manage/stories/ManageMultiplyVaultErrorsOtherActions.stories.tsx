import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageMultiplyVaultStory } from 'helpers/stories/ManageMultiplyVaultStory'
import { one, zero } from 'helpers/zero'

const proxyAddress = DEFAULT_PROXY_ADDRESS

const vaultERC20 = {
  ilk: 'WBTC-A',
  collateral: new BigNumber('100'),
  debt: new BigNumber('3000'),
}

export const VaultUnderCollateralized = manageMultiplyVaultStory({
  title: 'Warning is shown when the vault collateralization is below the liquidation ratio',
  vault: vaultERC20,
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber(34000),
})

export const VaultUnderCollateralizedAtNextPrice = manageMultiplyVaultStory({
  title:
    'Warning is shown when the vault collateralization is below the liquidation ratio after the next price update',
  vault: vaultERC20,
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.9'),
  },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber(700),
})

export const DepositAmountEmpty = manageMultiplyVaultStory({
  title:
    'If deposit input field is empty when in "Other Actions" then we disable the progress button and suggest user to enter an amount',
  vault: vaultERC20,
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'depositCollateral',
})

export const WithdrawAmountEmpty = manageMultiplyVaultStory({
  title:
    'If withdraw input field is empty when in "Other Actions" then we disable the progress button and suggest user to enter an amount',
  vault: vaultERC20,
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawCollateral',
})

export const PaybackAmountEmpty = manageMultiplyVaultStory({
  title:
    'If payback input field is empty when in "Other Actions" then we disable the progress button and suggest user to enter an amount',
  vault: vaultERC20,
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'paybackDai',
})

export const GenerateAmountEmpty = manageMultiplyVaultStory({
  title:
    'If generate input field is empty when in "Other Actions" then we disable the progress button and suggest user to enter an amount',
  vault: vaultERC20,
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
})

// export const DepositEmpty = manageMultiplyVaultStory({
//   title:
//     'Similar to DepositAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Collateral" editing stage they would only be able deposit so we block the flow if no deposit amount is set',
//   vault: {
//     ilk: 'WBTC-A',
//     collateral: new BigNumber('100'),
//     debt: new BigNumber('3000'),
//     controller: '0x1',
//   },
//   account: '0x0',
//   proxyAddress,
// })()

export const DepositAmountExceedsCollateralBalance = manageMultiplyVaultStory({
  title:
    'Error is shown where a user is trying to deposit more collateral than they have as balance in their account',
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('5') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'depositCollateral',
  depositAmount: new BigNumber('6'),
})

export const WithdrawAmountExceedsFreeCollateral = manageMultiplyVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which is greater than the amount of collateral which is "free", not backing the outstanding debt in the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawCollateral',
  withdrawAmount: new BigNumber('8'),
})

export const WithdrawAmountExceedsFreeCollateralAtNextPrice = manageMultiplyVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which at next price update is greater than the amount of collateral which is "free", not backing the outstanding debt in the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  priceInfo: { collateralChangePercentage: new BigNumber('-0.2') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawCollateral',
  withdrawAmount: new BigNumber('5'),
})

export const GenerateAmountExceedsDaiYieldFromTotalCollateral = manageMultiplyVaultStory({
  title:
    'Error is shown when a user is trying to generate an amount of DAI that is greater than the maximum of dai that can be generated from the collateral already locked in the vault and the amount of collateral the user is also depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber('4000'),
})

export const GenerateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice = manageMultiplyVaultStory(
  {
    title:
      'Error is shown when a user is trying to generate an amount of DAI that is greater than the maximum of dai at next price update that can be generated from the collateral already locked in the vault and the amount of collateral the user is also depositing',
    vault: {
      ilk: 'WBTC-A',
      collateral: new BigNumber('15'),
      debt: new BigNumber('3500'),
    },
    priceInfo: {
      collateralChangePercentage: new BigNumber('-0.6'),
    },
    proxyAddress,
  },
)({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber('400'),
})

export const GenerateAmountExceedsDebtCeiling = manageMultiplyVaultStory({
  title:
    'Error is shown where the total debt generated for an ilk is almost at the debt ceiling and the amount of dai the user wants to generate would be greater than the difference. In this example, the user has plenty of collateral in their vault to generate plenty of DAI but is blocked as there is only 1,000 DAI until the ceiling is reached',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('30'),
    debt: new BigNumber('3000'),
  },
  ilkData: { ilkDebt: new BigNumber('15000'), debtCeiling: new BigNumber('16000') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber('2000'),
})

export const GenerateAmountLessThanDebtFloor = manageMultiplyVaultStory({
  title:
    'Error is shown when a user is generating an amount of DAI that would cause the debt outstanding in the vault to be less than the dust limit/debt floor. In more detail, if this vault has a debt of 1999 DAI and the dust limit was 2000 DAI, were the user to generate 1 DAI, then they could proceed',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: zero,
  },
  ilkData: { debtFloor: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber('1'),
})

export const WithdrawOnVaultUnderDebtFloor = manageMultiplyVaultStory({
  title:
    'Error is shown when a user is trying to withdraw collateral on a vault that is under debt floor. In this case user should first payback all debt in order to withdraw any collateral.',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: new BigNumber(100),
  },
  ilkData: { debtFloor: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'withdrawCollateral',
  withdrawAmount: new BigNumber('1'),
})

export const PaybackAmountExceedsDaiBalance = manageMultiplyVaultStory({
  title: 'Error occurs when user is trying to pay back more DAI than they have in their wallet',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('50'),
    debt: new BigNumber('9000'),
  },
  balanceInfo: { daiBalance: new BigNumber('5000') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'paybackDai',
  paybackAmount: new BigNumber('6000'),
})

export const PaybackAmountExceedsVaultDebt = manageMultiplyVaultStory({
  title: 'Error occurs when the user tries to payback more DAI than exists as debt in their vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'paybackDai',
  paybackAmount: new BigNumber('6000'),
})

export const PaybackAmountCausesVaultDebtToBeLessThanDebtFloor = manageMultiplyVaultStory({
  title:
    'Error occurs when the user pays back an amount of DAI which would cause the remaining vault debt to be under the dust limit but not the full amount',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'paybackDai',
  paybackAmount: new BigNumber('4000'),
})

export const DepositingAllEthBalance = manageMultiplyVaultStory({
  title: 'Error occurs when a user with an ETH vault tries to deposit all their ETH into the vault',
  vault: {
    ilk: 'ETH-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: {
    collateralBalance: new BigNumber('100'),
  },
  proxyAddress,
})({
  stage: 'otherActions',
  otherAction: 'depositCollateral',
  depositAmount: new BigNumber('100'),
})

export const CustomCollateralAllowanceEmpty = manageMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  collateralAllowanceAmount: undefined,
  selectedCollateralAllowanceRadio: 'custom',
})

export const CustomCollateralAllowanceAmountGreaterThanMaxUint256 = manageMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  selectedCollateralAllowanceRadio: 'custom',
  collateralAllowanceAmount: maxUint256.plus(one),
})

export const CustomCollateralAllowanceAmountLessThanDepositAmount = manageMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  collateralAllowanceAmount: new BigNumber('9'),
  selectedCollateralAllowanceRadio: 'custom',
})

export const CustomDaiAllowanceEmpty = manageMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'daiAllowanceWaitingForConfirmation',
  paybackAmount: new BigNumber('500'),
  selectedDaiAllowanceRadio: 'custom',
  daiAllowanceAmount: undefined,
})

export const CustomDaiAllowanceAmountGreaterThanMaxUint256 = manageMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'daiAllowanceWaitingForConfirmation',
  paybackAmount: new BigNumber('500'),
  selectedDaiAllowanceRadio: 'custom',
  daiAllowanceAmount: maxUint256.plus(one),
})

export const CustomDaiAllowanceAmountLessThanDepositAmount = manageMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'daiAllowanceWaitingForConfirmation',
  paybackAmount: new BigNumber('500'),
  selectedDaiAllowanceRadio: 'custom',
  daiAllowanceAmount: new BigNumber('9'),
})

export const ExchangeDataFailure = manageMultiplyVaultStory({
  title: 'Error is shown when 1inch responded with other status than SUCCESS',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
  exchangeQuote: {
    status: 'ERROR',
  },
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'closeVault',
})

export const ExchangeDataLoading = manageMultiplyVaultStory({
  title:
    'Confirm buttons is blocked and App Spinner is shown next to ETH Price when exchange data is being loaded',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
  exchangeQuote: {
    isLoading: true,
  },
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'closeVault',
})

export const VaultHasNoCollateral = manageMultiplyVaultStory({
  title: 'If vault has no collateral block flow on other actions other than deposit collateral',
  vault: { ...vaultERC20, collateral: zero, debt: zero },
  proxyAddress,
})({
  otherAction: 'withdrawCollateral',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageMultiplyVault/Blocking-Flow-Other-Actions',
}
