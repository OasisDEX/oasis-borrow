import { Chain } from '@web3-onboard/common'
import { DisconnectOptions, EIP1193Provider, WalletState } from '@web3-onboard/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import {
  NetworkConfigHexId,
  NetworkIds,
  NetworkNames,
  networkSetByHexId,
} from 'blockchain/networks'
import { ConnectionKind } from 'features/web3Context'

interface ConnectorUpdate {
  provider?: EIP1193Provider
  chainId?: number
  account?: null | string
}

export interface ConnectorInformation {
  chainId: NetworkIds
  hexChainId: NetworkConfigHexId
  provider: EIP1193Provider
  account: string | undefined
  networkName: NetworkNames
}

export class BridgeConnector extends AbstractConnector {
  public readonly basicInfo: ConnectorInformation

  private disconnectExecuted = false

  public isTheSame(other: AbstractConnector | undefined) {
    return (
      other instanceof BridgeConnector &&
      this.basicInfo.account === other?.basicInfo.account &&
      this.basicInfo.chainId === other?.basicInfo.chainId &&
      this.isConnected === other?.isConnected
    )
  }

  constructor(
    public readonly wallet: WalletState,
    private chains: Chain[],
    private disconnect: (wallet: DisconnectOptions) => Promise<WalletState[]>,
  ) {
    const chainsIds = chains.map((chain) => parseInt(chain.id, 16))
    super({ supportedChainIds: chainsIds })
    this.basicInfo = this.getBasicInfoFromWallet()
  }

  get connectionKind(): ConnectionKind {
    return 'injected'
  }

  get isConnected(): boolean {
    return !this.disconnectExecuted
  }

  get chainId(): NetworkIds {
    return this.basicInfo.chainId
  }

  get hexChainId(): NetworkConfigHexId {
    return this.basicInfo.hexChainId
  }

  get networkName(): NetworkNames {
    return this.basicInfo.networkName
  }

  get connectedAccount(): string | undefined {
    return this.basicInfo.account
  }

  private getBasicInfoFromWallet() {
    const chainId = parseInt(this.wallet.chains[0].id, 16) as NetworkIds
    const hexChainId = this.wallet.chains[0].id as NetworkConfigHexId
    const networkConfig = networkSetByHexId[hexChainId]

    const networkName = networkConfig?.name as NetworkNames
    const account = this.wallet.accounts[0]?.address
    const provider = this.wallet.provider

    return { chainId, account, provider, hexChainId, networkName }
  }

  activate(): Promise<ConnectorUpdate> {
    return Promise.resolve({
      ...this.basicInfo,
    })
  }

  // @deprecated - Use `disconnect` from our hook to disconnect.
  deactivate(): void {}

  getAccount(): Promise<string | null> {
    return Promise.resolve(this.basicInfo.account || null)
  }

  getChainId(): Promise<number | string> {
    return Promise.resolve(this.basicInfo.chainId)
  }

  getProvider(): Promise<any> {
    return Promise.resolve(this.basicInfo.provider)
  }
}
