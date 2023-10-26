import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'
import type { DssProxyActionsCropjoin } from 'types/web3-v1-contracts'
import type { NonPayableTransactionObject } from 'types/web3-v1-contracts/types'

import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import type { ClaimRewardData } from './ProxyActionsSmartContractAdapterInterface'
import { ProxyActionsAdapterType } from './ProxyActionsSmartContractAdapterInterface'

export class CropjoinProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<DssProxyActionsCropjoin> {
  AdapterType = ProxyActionsAdapterType.CROPJOIN

  resolveContractDesc({ chainId }: ContextConnected): ContractDesc {
    return getNetworkContracts(NetworkIds.MAINNET, chainId).dssProxyActionsCropjoin
  }

  claimRewards(
    context: ContextConnected,
    data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    const { contract, chainId } = context
    const { gemJoinAddress, cdpId } = data
    return contract<DssProxyActionsCropjoin>(
      getNetworkContracts(NetworkIds.MAINNET, chainId).dssProxyActionsCropjoin,
    ).methods.crop(gemJoinAddress, cdpId.toString())
  }
}
