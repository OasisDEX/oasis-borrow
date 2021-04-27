export enum TxMetaKind {
  createDsProxy = 'createDsProxy',
  setProxyOwner = 'setProxyOwner',
  approve = 'approve',
  disapprove = 'disapprove',
  // dsrJoin = 'dsrJoin',
  // dsrExit = 'dsrExit',
  // dsrExitAll = 'dsrExitAll',
  // transferEth = 'transferEth',
  // transferErc20 = 'transferErc20',

  open = 'open',
  depositAndGenerate = 'depositAndGenerate',
  withdrawAndPayback = 'withdrawAndPayback',
  reclaim = 'reclaim',
}
