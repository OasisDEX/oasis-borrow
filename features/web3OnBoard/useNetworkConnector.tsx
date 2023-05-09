import { NetworkConnector } from '@web3-react/network-connector'
import { networksById } from 'blockchain/networksConfig'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { keyBy } from 'lodash'
import { useMemo } from 'react'

import { hardhatNetworkConfigs } from './hardhatConfigList'

export function useNetworkConnector(): NetworkConnector | null {
  const [customNetwork] = useCustomNetworkParameter()
  return useMemo(() => {
    return new NetworkConnector({
      urls: {
        [customNetwork?.id]: { ...networksById, ...keyBy(hardhatNetworkConfigs, 'id') }[
          customNetwork?.id
        ].rpcUrl,
      },
      defaultChainId: parseInt(customNetwork?.id as unknown as string),
    })
  }, [customNetwork])
}
