export enum TxMetaKind {
  createDsProxy = 'createDsProxy',
  setProxyOwner = 'setProxyOwner',
  approve = 'approve',
  disapprove = 'disapprove',
  open = 'open',
  depositAndGenerate = 'depositAndGenerate',
  withdrawAndPayback = 'withdrawAndPayback',
  reclaim = 'reclaim',
  multiply = 'multiply',
  adjustPosition = 'adjustPosition',
  closeVault = 'closeVault',
  openGuni = 'openGuni',
  closeGuni = 'closeGuni',
  addTrigger = 'addTrigger',
  removeTrigger = 'removeTrigger',
  removeTriggers = 'removeTriggers',
  claimReward = 'claimReward',
  claimReferralFees = 'claimReferralFees',
  addTriggerGroup = 'addTriggerGroup',
  operationExecutor = 'operationExecutor',
  createAccount = 'createAccount',
  setOwner = 'setOwner',
  dsrJoin = 'dsrJoin',
  dsrExit = 'dsrExit',
  dsrExitAll = 'dsrExitAll',
}
