import { getNetworkContracts } from 'blockchain/contracts'
import { ContextConnected } from 'blockchain/network'
import { ContractDesc } from 'features/web3Context'
import { DssProxyActionsCropjoin } from 'types/web3-v1-contracts'
import { NonPayableTransactionObject } from 'types/web3-v1-contracts/types'

import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import {
  ClaimRewardData,
  ProxyActionsAdapterType,
} from './ProxyActionsSmartContractAdapterInterface'

export class CropjoinProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<DssProxyActionsCropjoin> {
  AdapterType = ProxyActionsAdapterType.CROPJOIN

  resolveContractDesc({ chainId }: ContextConnected): ContractDesc {
    return getNetworkContracts(chainId).dssProxyActionsCropjoin
  }

  claimRewards(
    context: ContextConnected,
    data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    const { contract, chainId } = context
    const { gemJoinAddress, cdpId } = data
    return contract<DssProxyActionsCropjoin>(
      getNetworkContracts(chainId).dssProxyActionsCropjoin,
    ).methods.crop(gemJoinAddress, cdpId.toString())
  }
}
