import { Chain } from '@web3-onboard/common'
import { DisconnectOptions, EIP1193Provider, WalletState } from '@web3-onboard/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectionKind } from 'features/web3Context'

interface ConnectorUpdate {
  provider?: EIP1193Provider
  chainId?: number
  account?: null | string
}

export class BridgeConnector extends AbstractConnector {
  public readonly basicInfo: {
    chainId: number
    provider: EIP1193Provider
    account: string | undefined
  }

  private disconnectExecuted = false

  public isTheSame(other: BridgeConnector | undefined) {
    return (
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

  private getBasicInfoFromWallet() {
    const chainId = parseInt(this.wallet.chains[0].id, 16)
    const account = this.wallet.accounts[0]?.address
    const provider = this.wallet.provider

    return { chainId, account, provider }
  }

  activate(): Promise<ConnectorUpdate> {
    return Promise.resolve({
      ...this.basicInfo,
    })
  }

  deactivate(): void {
    void this.disconnect({ label: this.wallet.label }).then(() => {
      this.disconnectExecuted = true
    })
  }

  getAccount(): Promise<string | null> {
    console.log(`Trying to get account`)
    return Promise.resolve(this.basicInfo.account || null)
  }

  getChainId(): Promise<number | string> {
    return Promise.resolve(this.basicInfo.chainId)
  }

  getProvider(): Promise<any> {
    return Promise.resolve(this.basicInfo.provider)
  }
}
