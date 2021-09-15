import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageMultiplyVaultStory } from 'helpers/stories/ManageMultiplyVaultStory'
import { zero } from 'helpers/zero'

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
  requiredCollRatio: new BigNumber(1.49),
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
  requiredCollRatio: new BigNumber(3.5),
})

export const SliderAmountEmpty = manageMultiplyVaultStory({
  title:
    'If slider input field is empty when in "Adjust Position" then we disable the progress button and suggest user to enter an amount',
  vault: vaultERC20,
  proxyAddress,
})()

export const ExchangeDataFailure = manageMultiplyVaultStory({
  title: 'Error is shown when 1inch responded with other status than SUCCESS',
  ilkData: { debtFloor: new BigNumber('2000') },
  proxyAddress,
  exchangeQuote: {
    status: 'ERROR',
  },
})({
  requiredCollRatio: new BigNumber(3.5),
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
  requiredCollRatio: new BigNumber(3.5),
})

export const VaultHasNoCollateral = manageMultiplyVaultStory({
  title: 'If vault has no collateral block flow on adjust position',
  vault: { ...vaultERC20, collateral: zero, debt: zero },
  proxyAddress,
})({
  stage: 'adjustPosition',
  originalEditingStage: 'adjustPosition',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageMultiplyVault/Blocking-Flow-Adjust-Position',
}
