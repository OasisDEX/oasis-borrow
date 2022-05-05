import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { guniOpenMultiplyVaultStory } from 'helpers/stories/GuniOpenMultiplyVaultStory'
import { one } from 'helpers/zero'

import { AllowanceOption } from '../../../../allowance/allowance'
import { GuniOpenVaultView } from '../containers/GuniOpenVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const DepositAmountExceedsCollateralBalance = guniOpenMultiplyVaultStory({
  title:
    'Amount user is depositing exceeds the balance of collateral they have outstanding in their wallet',
  proxyAddress,
  balanceInfo: { daiBalance: new BigNumber('999') },
})({
  depositAmount: new BigNumber('1000'),
})

export const CustomAllowanceEmpty = guniOpenMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('1500'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
  allowanceAmount: undefined,
})

export const CustomAllowanceAmountGreaterThanMaxUint256 = guniOpenMultiplyVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('1500'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
  allowanceAmount: maxUint256.plus(one),
})

export const CustomAllowanceAmountLessThanDepositAmount = guniOpenMultiplyVaultStory({
  title: 'Error should block user if the deposit they wish to set is below allowance limit',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  allowanceAmount: new BigNumber('9'),
  selectedAllowanceRadio: AllowanceOption.CUSTOM,
})

export const ExchangeDataFailure = guniOpenMultiplyVaultStory({
  title: 'Error is shown when 1inch responded with other status than SUCCESS',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
  exchangeQuote: {
    status: 'ERROR',
  },
})({
  depositAmount: new BigNumber('1500'),
})

export const ExchangeDataLoading = guniOpenMultiplyVaultStory({
  title:
    'Confirm buttons is blocked and App Spinner is shown next to ETH Price when exchange data is being loaded',
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
  exchangeQuote: {
    isLoading: true,
  },
})({
  depositAmount: new BigNumber('1500'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'GuniOpenMultiplyVault/Blocking',
  component: GuniOpenVaultView,
}
