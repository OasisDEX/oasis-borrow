import crypto from 'crypto'
import NodeCache from 'node-cache'

import { Request } from './BatchManager'

let hits = 0
let misses = 0

export class BatchCache {
  _cache: NodeCache
  _debug?: boolean

  constructor(props: { ttlInSeconds?: number; debug?: boolean } = {}) {
    this._cache = new NodeCache({ stdTTL: props?.ttlInSeconds || 15 })
    this._debug = props?.debug || false
  }

  createHash(request: Request) {
    const hashString = JSON.stringify({
      method: request.method,
      params: { data: request.params[0].data, to: request.params[0].to },
      network: request.network,
    })
    const hash = crypto.createHash('sha256').update(hashString).digest('hex')

    return hash
  }

  get(hash: string) {
    const entry = this._cache.get(hash)
    if (entry && this._debug) {
      hits++
      console.log(`Cache hit: ${hits}. Cache miss: ${misses}`)
    }

    return entry
  }

  set(hash: string, entry: any) {
    this._cache.set(hash, entry)
    if (this._debug) {
      misses++
      console.log(`Cache hit: ${hits}. Cache miss: ${misses}`)
    }
  }
}
