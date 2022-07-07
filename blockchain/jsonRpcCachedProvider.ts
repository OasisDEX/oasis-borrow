import { providers } from 'ethers'
import axios from 'axios'

export class JsonRpcCachedProvider extends providers.JsonRpcProvider {
  send(method: string, params: Array<any>): Promise<any> {
    const encoded = JSON.stringify({ method, params, network: this.network })
    return axios.get('/api/infuraCallsCache', { params: { encoded } }).then((response) => {
      return response.data
    })
  }
}
