import dsProxy from 'blockchain/abi/ds-proxy.json'

import { TxHelpers } from '../../../../../components/AppContext'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ActionCall } from '../../../../aave'
import { TransactionDef } from '../../../../../blockchain/calls/callsHelpers'
import { contractDesc } from '../../../../../blockchain/config'
import { ContextConnected } from '../../../../../blockchain/network'
import { OperationExecutor } from '../../../../../types/ethers-contracts'
import { DsProxy } from '../../../../../types/web3-v1-contracts/ds-proxy'

type OpenAavePositionData  = {
  kind: TxMetaKind.operationExecutor
  calls: ActionCall[]
  operationName: string
  proxyAddress: string
  token: string
}

// const open: TransactionDef<OpenAavePositionData> = {
//   call: ({ proxyAddress }, { contract }) => {
//     return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
//   },
//   prepareArgs: (data, context) => {
//     return [context.operationExecutor.address, getCallData(data, context).encodeABI()]
//   }
// }


function getCallData(data: OpenAavePositionData, context: ContextConnected) {
  return context.contract<OperationExecutor>(context.operationExecutor).functions.executeOp(data.calls, data.operationName)
}
ś
