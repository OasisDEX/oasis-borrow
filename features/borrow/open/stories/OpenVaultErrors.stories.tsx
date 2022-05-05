import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { OpenVaultView } from 'features/borrow/open/containers/OpenVaultView'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { openVaultStory } from 'helpers/stories/OpenVaultStory'
import { one } from 'helpers/zero'

import { AllowanceOption } from '../../../allowance/allowance'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const VaultWillBeUnderCollateralized = openVaultStory({
  title: 'User is generating too much debt for the amount of collateral to be deposited',
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('4000'),
})

export const VaultWillBeUnderCollateralizedNextPrice = openVaultStory({
  title:
    'User is generating too much debt for the amount of collateral to be deposited at next price. User can do this action but will be subject to liquidation when price updates',
  proxyAddress,
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.7'),
  },
})({
  depositAmount: new BigNumber('30'),
  generateAmount: new BigNumber('4000'),
})

export const DepositAmountExceedsCollateralBalance = openVaultStory({
  title:
    'Amount user is depositing exceeds the balance of collateral they have outstanding in their wallet',
  proxyAddress,
  balanceInfo: { collateralBalance: new BigNumber('999') },
})({
  depositAmount: new BigNumber('1000'),
})

export const DepositingAllEthBalance = openVaultStory({
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

export const GenerateAmountExceedsDaiYieldFromDepositingCollateral = openVaultStory({
  title:
    'Amount of dai user is attempting to generate exceeds the maximum amount of DAI that can be generated given the liquidation ratio of 150% in this case',
  proxyAddress,
  priceInfo: { collateralPrice: new BigNumber('2000') },
})({
  depositAmount: new BigNumber('150'),
  generateAmount: new BigNumber('200000.01'),
})

export const GenerateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice = openVaultStory({
  title:
    'Amount of dai user is attempting to generate exceeds the maximum amount of DAI that can be generated at next price update, the user could proceed with this transaction but is inadvised as they would be subject to liquidations on next price update',
  proxyAddress,
  priceInfo: {
    collateralPrice: new BigNumber('2000'),
    collateralChangePercentage: new BigNumber('-0.2'),
  },
})({
  depositAmount: new BigNumber('150'),
  generateAmount: new BigNumber('180000'),
})

export const GenerateAmountExceedsDebtCeiling = openVaultStory({
  title:
    'Amount of dai user is trying to generate exceeds the amount of dai available for that ilk',
  proxyAddress,
  ilkData: {
    ilkDebt: new BigNumber('10000'),
    debtCeiling: new BigNumber('13000'),
  },
})({
  depositAmount: new BigNumber('20'),
  generateAmount: new BigNumber('4000'),
})

export const GenerateAmountLessThanDebtFloor = openVaultStory({
  title:
    'Error is shown when a user is generating an amount of DAI that would cause the debt outstanding in the vault to be less than the dust limit/debt floor.',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('1999'),
})

export const CustomAllowanceEmpty = openVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
  allowanceAmount: undefined,
})

export const CustomAllowanceAmountGreaterThanMaxUint256 = openVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
  allowanceAmount: maxUint256.plus(one),
})

export const CustomAllowanceAmountLessThanDepositAmount = openVaultStory({
  title: 'Error should block user if the deposit they wish to set is below allowance limit',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  allowanceAmount: new BigNumber('9'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Blocking',
  component: OpenVaultView,
}
