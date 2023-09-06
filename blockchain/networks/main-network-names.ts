// main network names skipping the testnets mapping
import { NetworkNames } from 'blockchain/networks/network-names'

export enum MainNetworkNames {
  ethereumMainnet = NetworkNames.ethereumMainnet,
  ethereumGoerli = NetworkNames.ethereumMainnet,

  arbitrumMainnet = NetworkNames.arbitrumMainnet,
  arbitrumGoerli = NetworkNames.arbitrumMainnet,

  polygonMainnet = NetworkNames.polygonMainnet,
  polygonMumbai = NetworkNames.polygonMainnet,

  optimismMainnet = NetworkNames.optimismMainnet,
  optimismGoerli = NetworkNames.optimismMainnet,
}
