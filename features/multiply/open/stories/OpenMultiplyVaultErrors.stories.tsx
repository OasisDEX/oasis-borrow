import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { openMultiplyVaultStory } from 'helpers/stories/OpenMultiplyVaultStory'
import { one } from 'helpers/zero'

import { AllowanceOption } from '../../../allowance/allowance'
import { OpenMultiplyVaultView } from '../containers/OpenMultiplyVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const VaultWillBeUnderCollateralized = openMultiplyVaultStory({
  title: 'User is generating too much debt for the amount of collateral to be deposited',
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
  requiredCollRatio: new BigNumber('1.49'),
})

export const VaultWillBeUnderCollateralizedNextPrice = openMultiplyVaultStory({
  title:
    'User is generating too much debt for the amount of collateral to be deposited at next price. User can do this action but will be subject to liquidation when price updates',
  proxyAddress,
  priceInfo: {
    ethChangePercentage: new BigNumber('-0.7'),
  },
})({
  depositAmount: new BigNumber('30'),
  requiredCollRatio: new BigNumber('3'),
})

export const DepositAmountExceedsCollateralBalance = openMultiplyVaultStory({
  title:
    'Amount user is depositing exceeds the balance of collateral they have outstanding in their wallet',
  proxyAddress,
  balanceInfo: { collateralBalance: new BigNumber('999') },
})({
  depositAmount: new BigNumber('1000'),
})

export const DepositingAllEthBalance = openMultiplyVaultStory({
  title:
    'Error occurs when a user opening an ETH vault tries to deposit all their ETH into the vault',
  balanceInfo: {
    collateralBalance: new BigNumber('100'),
  },
  ilk: 'ETH-A',
  proxyAddress,
})({
  depositAmount: new BigNumber('100'),
})

export const GenerateAmountExceedsDaiYieldFromDepositingCollateral = openMultiplyVaultStory({
  title:
    'Amount of dai user is attempting to generate exceeds the maximum amount of DAI that can be generated given the liquidation ratio of 150% in this case',
  proxyAddress,
  priceInfo: { collateralPrice: new BigNumber('2000') },
})({
  depositAmount: new BigNumber('150'),
  requiredCollRatio: new BigNumber('1.49'),
})

export const GenerateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice = openMultiplyVaultStory(
  {
    title:
      'Amount of dai user is attempting to generate exceeds the maximum amount of DAI that can be generated at next price update, the user could proceed with this transaction but is inadvised as they would be subject to liquidations on next price update',
    proxyAddress,
    priceInfo: {
      collateralPrice: new BigNumber('2000'),
      ethChangePercentage: new BigNumber('-0.2'),
    },
  },
)({
  depositAmount: new BigNumber('150'),
  requiredCollRatio: new BigNumber('1.85'),
})

export const GenerateAmountExceedsDebtCeiling = openMultiplyVaultStory({
  title:
    'Amount of dai user is trying to generate exceeds the amount of dai available for that ilk',
  proxyAddress,
  ilkData: {
    ilkDebt: new BigNumber('10000'),
    debtCeiling: new BigNumber('13000'),
  },
})({
  depositAmount: new BigNumber('20'),
  requiredCollRatio: new BigNumber('4'),
})

export const GenerateAmountLessThanDebtFloor = openMultiplyVaultStory({
  title:
    'Error is shown when a user is generating an amount of DAI that would cause the debt outstanding in the vault to be less than the dust limit/debt floor.',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
})({
  depositAmount: new BigNumber('5'),
  requiredCollRatio: new BigNumber('5'),
})

export const CustomAllowanceEmpty = openMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
  allowanceAmount: undefined,
})

export const CustomAllowanceAmountGreaterThanMaxUint256 = openMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
  allowanceAmount: maxUint256.plus(one),
})

export const CustomAllowanceAmountLessThanDepositAmount = openMultiplyVaultStory({
  title: 'Error should block user if the deposit they wish to set is below allowance limit',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  allowanceAmount: new BigNumber('9'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
})

export const ExchangeDataFailure = openMultiplyVaultStory({
  title: 'Error is shown when 1inch responded with other status than SUCCESS',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
  exchangeQuote: {
    status: 'ERROR',
  },
})({
  depositAmount: new BigNumber('5'),
})

export const ExchangeDataLoading = openMultiplyVaultStory({
  title:
    'Confirm buttons is blocked and App Spinner is shown next to ETH Price when exchange data is being loaded',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
  exchangeQuote: {
    isLoading: true,
  },
})({
  depositAmount: new BigNumber('5'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenMultiplyVault/Blocking',
  component: OpenMultiplyVaultView,
}
