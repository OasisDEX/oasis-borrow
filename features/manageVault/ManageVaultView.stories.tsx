import { BigNumber } from 'bignumber.js'
import { ManageVaultView } from 'features/manageVault/ManageVaultView'
import { one } from 'helpers/zero'
import { ManageVaultStory } from './ManageVaultBuilder'

export const Default = ManageVaultStory({
  title:
    'Default ManageVault Story. Vault is empty, user has a proxy address and is the vault controller.',
})

export const CollateralEditingStage = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  showDepositAndGenerateOption: true,
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralEditing',
})

export const DaiEditingStage = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiEditing',
})

export const ProxyWaitingForConfirmation = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyWaitingForConfirmation',
})

export const ProxyWaitingForApproval = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyWaitingForApproval',
})

export const ProxyFailure = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyFailure',
})

export const ProxyInProgress = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyInProgress',
})

export const ProxySuccess = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxySuccess',
})

export const CollateralAllowanceWaitingForConfirmation = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceWaitingForConfirmation',
})

export const CollateralAllowanceWaitingForApproval = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceWaitingForApproval',
})

export const CollateralAllowanceFailure = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceFailure',
})

export const CollateralAllowanceInProgress = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceInProgress',
})

export const CollateralAllowanceSuccess = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceSuccess',
})

export const DaiAllowanceWaitingForConfirmation = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceWaitingForConfirmation',
})

export const DaiAllowanceWaitingForApproval = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceWaitingForApproval',
})

export const DaiAllowanceFailure = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceFailure',
})

export const DaiAllowanceInProgress = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceInProgress',
})

export const DaiAllowanceSuccess = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceSuccess',
})

export const ManageWaitingForConfirmation = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageWaitingForConfirmation',
})

export const ManageWaitingForApproval = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageWaitingForApproval',
})

export const ManageFailure = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageFailure',
})

export const ManageInProgress = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageInProgress',
})

export const ManageSuccess = ManageVaultStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageSuccess',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Stages',
  component: ManageVaultView,
}
