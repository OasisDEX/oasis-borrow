import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageVaultStory } from 'helpers/stories/ManageVaultStory'
import { zero } from 'helpers/zero'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const CollateralEditingStage = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  proxyAddress,
})({
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const DaiEditingStage = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'daiEditing',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyWaitingForConfirmation',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyWaitingForApproval',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyFailure',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyInProgress',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxySuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxySuccess',
  generateAmount: new BigNumber('300'),
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceWaitingForConfirmation',
  generateAmount: new BigNumber('300'),
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceWaitingForApproval',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const CollateralAllowanceFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  stage: 'collateralAllowanceFailure',
})

export const CollateralAllowanceInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceInProgress',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const CollateralAllowanceSuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  stage: 'collateralAllowanceSuccess',
})

export const DaiAllowanceWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
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
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'daiAllowanceWaitingForApproval',
})

export const DaiAllowanceFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  stage: 'daiAllowanceFailure',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const DaiAllowanceInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'daiAllowanceInProgress',
})

export const DaiAllowanceSuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'daiAllowanceSuccess',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageWaitingForConfirmation = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageWaitingForConfirmation',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageWaitingForApproval = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageWaitingForApproval',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageFailure = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'manageFailure',
})

export const ManageInProgress = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageInProgress',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageSuccess = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageSuccess',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const MultiplyTransitionEditing = manageVaultStory()({
  stage: 'multiplyTransitionEditing',
})

export const MultiplyTransitionWaitingForConfirmation = manageVaultStory()({
  stage: 'multiplyTransitionWaitingForConfirmation',
})

export const MultiplyTransitionInProgress = manageVaultStory()({
  stage: 'multiplyTransitionInProgress',
})

export const MultiplyTransitionFailure = manageVaultStory()({
  stage: 'multiplyTransitionFailure',
})

export const MultiplyTransitionSuccess = manageVaultStory()({
  stage: 'multiplyTransitionSuccess',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Stages',
}
