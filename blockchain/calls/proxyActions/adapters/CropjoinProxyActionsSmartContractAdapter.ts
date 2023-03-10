import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCropjoin } from '../../../../types/web3-v1-contracts/dss-proxy-actions-cropjoin'
import { NonPayableTransactionObject } from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import {
  ClaimRewardData,
  ProxyActionsAdapterType,
} from './ProxyActionsSmartContractAdapterInterface'

export class CropjoinProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<
  DssProxyActionsCropjoin
> {
  AdapterType = ProxyActionsAdapterType.CROPJOIN

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCropjoin
  }

  claimRewards(
    context: ContextConnected,
    data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    const { contract, dssProxyActionsCropjoin } = context
    const { gemJoinAddress, cdpId } = data
    return contract<DssProxyActionsCropjoin>(dssProxyActionsCropjoin).methods.crop(
      gemJoinAddress,
      cdpId.toString(),
    )
  }
}
