import type { Chain } from '@web3-onboard/common'
import type { DisconnectOptions, EIP1193Provider, WalletState } from '@web3-onboard/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import type { NetworkConfigHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
import { networkSetByHexId } from 'blockchain/networks'
import { getAddress, isAddress } from 'ethers/lib/utils'
import type { ConnectionKind } from 'features/web3Context'

interface ConnectorUpdate {
  provider?: EIP1193Provider
  chainId?: number
  account?: null | string
}

export interface ConnectorInformation {
  chainId: NetworkIds
  hexChainId: NetworkConfigHexId
  provider: EIP1193Provider
  account: string
  networkName: NetworkNames
}

export class BridgeConnector extends AbstractConnector {
  private readonly _connectorInformation: ConnectorInformation
  private _disconnectExecuted = false

  public isTheSame(other: AbstractConnector | undefined) {
    return (
      other instanceof BridgeConnector &&
      this.connectorInformation.account === other?.connectorInformation.account &&
      this.connectorInformation.chainId === other?.connectorInformation.chainId &&
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
    this._connectorInformation = this.createConnectorInformation()
  }

  get connectionKind(): ConnectionKind {
    return 'injected'
  }

  get isConnected(): boolean {
    return !this._disconnectExecuted
  }

  get chainId(): NetworkIds {
    return this.connectorInformation.chainId
  }

  get hexChainId(): NetworkConfigHexId {
    return this.connectorInformation.hexChainId
  }

  get networkName(): NetworkNames {
    return this.connectorInformation.networkName
  }

  get connectedAccount(): string {
    return this.connectorInformation.account
  }

  get connectorInformation(): ConnectorInformation {
    return this._connectorInformation
  }

  private createConnectorInformation(): ConnectorInformation {
    const chainId = parseInt(this.wallet.chains[0].id, 16) as NetworkIds
    const hexChainId = this.wallet.chains[0].id as NetworkConfigHexId
    const networkConfig = networkSetByHexId[hexChainId]

    const networkName = networkConfig?.name as NetworkNames
    const account = isAddress(this.wallet.accounts[0].address)
      ? getAddress(this.wallet.accounts[0].address)
      : ''
    const provider = this.wallet.provider

    return { chainId, account, provider, hexChainId, networkName }
  }

  activate(): Promise<ConnectorUpdate> {
    return Promise.resolve({
      ...this.connectorInformation,
    })
  }

  // @deprecated - Use `disconnect` from our hook to disconnect.
  deactivate(): void {}

  getAccount(): Promise<string | null> {
    return Promise.resolve(this.connectorInformation.account || null)
  }

  getChainId(): Promise<number | string> {
    return Promise.resolve(this.connectorInformation.chainId)
  }

  getProvider(): Promise<any> {
    return Promise.resolve(this.connectorInformation.provider)
  }
}
