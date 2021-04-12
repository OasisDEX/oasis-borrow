import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'blockchain/vaults'
import { one, zero } from 'helpers/zero'
import { manageVaultStory } from './ManageVaultBuilder'
import { ManageVaultView } from './ManageVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const NoProxyAddress = manageVaultStory({
  title:
    'Warning is shown that the connected account has no proxy address and prior to executing the proposed transaction will have to set their proxy and make applicable allowances given the context of their action',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('10'),
})

export const InsufficientCollateralAllowance = manageVaultStory({
  title:
    'Warning is shown when the user is depositing an amount of collateral and the allowance they have set on their proxy is less than that amount, the flow will direct the user to set the correct collateral allowance before depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('10'),
  collateralAllowance: new BigNumber('9'),
  proxyAddress,
})

export const InsufficientDaiAllowance = manageVaultStory({
  title:
    'Warning is shown when the user is paying back some of the debt in their vault and the allowance they have set on their proxy is less than that amount, the flow will direct the user to set the correct dai allowance before paying back',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('1000'),
  daiAllowance: new BigNumber('500'),
  proxyAddress,
})

export const PotentialGenerateAmountLessThanDebtFloor = manageVaultStory({
  title:
    'Warning is shown when the amount of collateral in the vault plus the amount a user is depositing does not satisfy the amount of debt necessary to exceed the debt floor',
  vault: {
    ilk: 'WBTC-A',
    collateral: one,
    debt: zero,
  },
  depositAmount: new BigNumber('4'),
  proxyAddress,
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
  depositAmount: new BigNumber('1'),
  proxyAddress,
})

export const ConnectedAccountIsNotVaultController = manageVaultStory({
  title:
    'Warning is shown when the "owner" of the proxy corresponding to the vault does not match the connected account',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('4000'),
  },
  paybackAmount: new BigNumber('100'),
  stage: 'daiEditing',
  account: '0xNotVaultController',
  proxyAddress,
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Warnings',
  component: ManageVaultView,
}
