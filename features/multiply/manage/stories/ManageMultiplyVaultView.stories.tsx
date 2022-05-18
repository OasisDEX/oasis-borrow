import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageMultiplyVaultStory } from 'helpers/stories/ManageMultiplyVaultStory'
import { zero } from 'helpers/zero'

const proxyAddress = DEFAULT_PROXY_ADDRESS

const vaultETH = {
  ilk: 'ETH-A',
  collateral: new BigNumber('100'),
  debt: new BigNumber('20000'),
}

const vaultERC20 = {
  ilk: 'WBTC-A',
  collateral: new BigNumber('100'),
  debt: new BigNumber('3000'),
}

export const AdjustPositionStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  proxyAddress,
})({
  depositAmount: new BigNumber('2'),
})

export const OtherActionDepositStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'depositCollateral',
  depositAmount: new BigNumber('2'),
})

export const OtherActionWithdrawStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'withdrawCollateral',
  withdrawAmount: new BigNumber('2'),
})

export const OtherActionPaybackStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'paybackDai',
  paybackAmount: new BigNumber('300'),
})

export const OtherActionGenerateStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'withdrawDai',
  generateAmount: new BigNumber('300'),
})

export const OtherActionCloseToDaiStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'closeVault',
  closeVaultTo: 'dai',
})

export const OtherActionCloseToDaiStageERC20 = manageMultiplyVaultStory({
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'closeVault',
  closeVaultTo: 'dai',
})

export const OtherActionCloseToCollateralStage = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
})({
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
  otherAction: 'closeVault',
  closeVaultTo: 'collateral',
})

export const ProxyWaitingForConfirmation = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyWaitingForConfirmation',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyWaitingForApproval = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyWaitingForApproval',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyFailure = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyFailure',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxyInProgress = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxyInProgress',
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

export const ProxySuccess = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200') },
})({
  stage: 'proxySuccess',
  generateAmount: new BigNumber('300'),
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceWaitingForConfirmation = manageMultiplyVaultStory({
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceWaitingForApproval = manageMultiplyVaultStory({
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceWaitingForApproval',
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceFailure = manageMultiplyVaultStory({
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceFailure',
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceInProgress = manageMultiplyVaultStory({
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceInProgress',
  depositAmount: new BigNumber('2'),
})

export const CollateralAllowanceSuccess = manageMultiplyVaultStory({
  vault: vaultERC20,
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress,
  collateralAllowance: zero,
})({
  stage: 'collateralAllowanceSuccess',
  depositAmount: new BigNumber('2'),
})

export const DaiAllowanceWaitingForConfirmation = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'daiAllowanceWaitingForConfirmation',
})

export const DaiAllowanceWaitingForApproval = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'daiAllowanceWaitingForApproval',
})

export const DaiAllowanceFailure = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  stage: 'daiAllowanceFailure',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const DaiAllowanceInProgress = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'daiAllowanceInProgress',
})

export const DaiAllowanceSuccess = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
  daiAllowance: zero,
})({
  stage: 'daiAllowanceSuccess',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageWaitingForConfirmation = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageWaitingForConfirmation',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageWaitingForApproval = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageWaitingForApproval',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageFailure = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  stage: 'manageFailure',
})

export const ManageInProgress = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageInProgress',
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
})

export const ManageInProgressOtherActions = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageInProgress',
  originalEditingStage: 'otherActions',
})

export const ManageInProgressCloseVault = manageMultiplyVaultStory({
  vault: vaultETH,
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress,
})({
  stage: 'manageInProgress',
  originalEditingStage: 'otherActions',
  otherAction: 'closeVault',
})

export const ManageSuccess = manageMultiplyVaultStory({
  vault: vaultETH,
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
