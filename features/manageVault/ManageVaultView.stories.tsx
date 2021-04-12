import { BigNumber } from 'bignumber.js'
import { ManageVaultView } from 'features/manageVault/ManageVaultView'

import { manageVaultStory } from './ManageVaultBuilder'

export const CollateralEditingStage = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  showDepositAndGenerateOption: true,
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  stage: 'collateralEditing',
})

export const DaiEditingStage = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  showDepositAndGenerateOption: true,
  stage: 'daiEditing',
})

export const ProxyWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyWaitingForConfirmation',
})

export const ProxyWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyWaitingForApproval',
})

export const ProxyFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyFailure',
})

export const ProxyInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  stage: 'proxyInProgress',
})

export const ProxySuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxySuccess',
})

export const CollateralAllowanceWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceWaitingForConfirmation',
})

export const CollateralAllowanceWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  stage: 'collateralAllowanceWaitingForApproval',
})

export const CollateralAllowanceFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'collateralAllowanceFailure',
})

export const CollateralAllowanceInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  stage: 'collateralAllowanceInProgress',
})

export const CollateralAllowanceSuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceSuccess',
})

export const DaiAllowanceWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'daiAllowanceWaitingForConfirmation',
})

export const DaiAllowanceWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'daiAllowanceWaitingForApproval',
})

export const DaiAllowanceFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'daiAllowanceFailure',
})

export const DaiAllowanceInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'daiAllowanceInProgress',
})

export const DaiAllowanceSuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'daiAllowanceSuccess',
})

export const ManageWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'manageWaitingForConfirmation',
})

export const ManageWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'manageWaitingForApproval',
})

export const ManageFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'manageFailure',
})

export const ManageInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'manageInProgress',
})

export const ManageSuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  stage: 'manageSuccess',
})

/* export const VaultAtRisk = createStory({
 *   ilk: 'ETH-A',
 *   collateral: one,
 *   debt: new BigNumber('4000'),
 *   withdrawAmount: new BigNumber('0.5'),
 *   paybackAmount: new BigNumber('300'),
 *   balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
 *   proxyAddress: '0xProxyAddress',
 *   stage: 'collateralEditing',
 * })
 *
 * export const ShouldPaybackAll = createStory({
 *   title: `If the amount in the paybackAmount field is between ${PAYBACK_ALL_BOUND} DAI of the outstanding debt in a vault, the shouldPaybackAll flag should be indicated as true. A warning message should also show to indicate to the user that this action should leave their vault with a debt of 0`,
 *   ilk: 'WBTC-A',
 *   stage: 'daiEditing',
 *   collateral: one,
 *   debt: new BigNumber('3000'),
 *   paybackAmount: new BigNumber('2999'),
 *   balanceInfo: { collateralBalance: new BigNumber('2000'), daiBalance: new BigNumber('10000') },
 *   proxyAddress: '0xProxyAddress',
 * })
 *  */
// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Stages',
  component: ManageVaultView,
}
