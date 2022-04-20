// Original at https://github.com/rsksmart/mock-web3-provider/blob/main/src/index.ts

// import { personalSign, decrypt } from 'eth-sig-util'

type ProviderSetup = {
  address: string
  privateKey: string
  networkVersion: number
  debug?: boolean
  manualConfirmEnable?: boolean
}

interface IMockProvider {
  request(args: { method: 'eth_accounts'; params: string[] }): Promise<string[]>
  request(args: { method: 'eth_requestAccounts'; params: string[] }): Promise<string[]>

  request(args: { method: 'net_version' }): Promise<number>
  request(args: { method: 'eth_chainId'; params: string[] }): Promise<string>

  request(args: { method: 'personal_sign'; params: string[] }): Promise<string>
  request(args: { method: 'eth_decrypt'; params: string[] }): Promise<string>

  request(args: { method: string; params?: any[] }): Promise<any>
}

// eslint-disable-next-line import/prefer-default-export
export class MockProvider implements IMockProvider {
  private setup: ProviderSetup

  private acceptEnable?: (value: unknown) => void

  private rejectEnable?: (value: unknown) => void

  constructor(setup?: ProviderSetup) {
    this.setup = setup || { address: '', privateKey: '', networkVersion: 0, debug: false }
  }

  // eslint-disable-next-line no-console
  private log = (...args: (any | null)[]) => this.setup.debug && console.log('🦄', ...args)

  get selectedAddress(): string {
    return this.setup.address
  }

  get networkVersion(): number {
    return this.setup.networkVersion
  }

  get chainId(): string {
    return `0x${this.setup.networkVersion.toString(16)}`
  }

  answerEnable(acceptance: boolean) {
    if (acceptance) this.acceptEnable!('Accepted')
    else this.rejectEnable!('User rejected')
  }

  request({ method /*params */ }: any): Promise<any> {
    this.log(`request[${method}]`)

    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_estimateGas':
        return Promise.resolve(0)
      case 'eth_accounts':
        if (this.setup.manualConfirmEnable) {
          return new Promise((resolve, reject) => {
            this.acceptEnable = resolve
            this.rejectEnable = reject
          }).then(() => [this.selectedAddress])
        }
        return Promise.resolve([this.selectedAddress])

      case 'net_version':
        return Promise.resolve(this.setup.networkVersion)

      case 'eth_chainId':
        return Promise.resolve(this.chainId)

      case 'personal_sign': {
        // const privKey = Buffer.from(this.setup.privateKey, 'hex')

        // const signed: string = personalSign(privKey, { data: params[0] })

        // this.log('signed', signed)

        // return Promise.resolve(signed)
        return Promise.resolve()
      }

      case 'eth_sendTransaction': {
        return Promise.resolve()
        // return Promise.reject(new Error('This service can not send transactions.'))
      }

      case 'eth_decrypt': {
        // this.log('eth_decrypt', { method, params })

        // const stripped = params[0].substring(2)
        // const buff = Buffer.from(stripped, 'hex')
        // const data = JSON.parse(buff.toString('utf8'))

        // const decrypted: string = decrypt(data, this.setup.privateKey)

        // return Promise.resolve(decrypted)

        return Promise.resolve()
      }

      default:
        this.log(`resquesting missing method ${method}`)
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(`The method ${method} is not implemented by the mock provider.`)
    }
  }

  sendAsync(props: { method: string }, cb: any) {
    switch (props.method) {
      case 'eth_accounts':
        cb(null, { result: [this.setup.address] })
        break

      case 'net_version':
        cb(null, { result: this.setup.networkVersion })
        break

      default:
        this.log(`Method '${props.method}' is not supported yet.`)
    }
  }

  on(props: string) {
    this.log('registering event:', props)
  }

  removeAllListeners() {
    this.log('removeAllListeners', null)
  }
}
