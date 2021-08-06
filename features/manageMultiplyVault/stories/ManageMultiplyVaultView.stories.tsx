import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageMultiplyVaultStory } from 'helpers/stories/ManageMultiplyVaultStory'
import { zero } from 'helpers/zero'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const CollateralEditingStage = manageMultiplyVaultStory({
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

export const DaiEditingStage = manageMultiplyVaultStory({
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

export const ProxyWaitingForConfirmation = manageMultiplyVaultStory({
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

export const ProxyWaitingForApproval = manageMultiplyVaultStory({
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

export const ProxyFailure = manageMultiplyVaultStory({
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

export const ProxyInProgress = manageMultiplyVaultStory({
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

export const ProxySuccess = manageMultiplyVaultStory({
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

export const CollateralAllowanceWaitingForConfirmation = manageMultiplyVaultStory({
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

export const CollateralAllowanceWaitingForApproval = manageMultiplyVaultStory({
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

export const CollateralAllowanceFailure = manageMultiplyVaultStory({
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

export const CollateralAllowanceInProgress = manageMultiplyVaultStory({
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

export const CollateralAllowanceSuccess = manageMultiplyVaultStory({
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

export const DaiAllowanceWaitingForConfirmation = manageMultiplyVaultStory({
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

export const DaiAllowanceWaitingForApproval = manageMultiplyVaultStory({
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

export const DaiAllowanceFailure = manageMultiplyVaultStory({
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

export const DaiAllowanceInProgress = manageMultiplyVaultStory({
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

export const DaiAllowanceSuccess = manageMultiplyVaultStory({
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

export const ManageWaitingForConfirmation = manageMultiplyVaultStory({
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

export const ManageWaitingForApproval = manageMultiplyVaultStory({
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

export const ManageFailure = manageMultiplyVaultStory({
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

export const ManageInProgress = manageMultiplyVaultStory({
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

export const ManageSuccess = manageMultiplyVaultStory({
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

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageMultiplyVault/Stages',
}
