import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'blockchain/vaults'
import { ManageVaultView } from 'features/manageVault/ManageVaultView'
import { zero } from 'helpers/zero'

import { manageVaultStory } from './ManageVaultBuilder'

const proxyAddress = DEFAULT_PROXY_ADDRESS

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
  proxyAddress,
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
  proxyAddress,
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
  proxyTxHash: '0xProxyTxHash',
  proxyConfirmations: 2,
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
  proxyAddress,
  proxyTxHash: '0xProxyTxHash',
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
  proxyAddress,
  collateralAllowance: zero,
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
  proxyAddress,
  collateralAllowance: zero,
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
  proxyAddress,
  collateralAllowance: zero,
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
  proxyAddress,
  collateralAllowance: zero,
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
  proxyAddress,
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
  proxyAddress,
  daiAllowance: zero,
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
  proxyAddress,
  daiAllowance: zero,
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
  proxyAddress,
  daiAllowance: zero,
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
  proxyAddress,
  daiAllowance: zero,
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
  proxyAddress,
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
  proxyAddress,
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
  proxyAddress,
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
  proxyAddress,
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
  proxyAddress,
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
  proxyAddress,
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Stages',
  component: ManageVaultView,
}
