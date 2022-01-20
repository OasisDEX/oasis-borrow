import { ethers } from 'ethers'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Context } from './network'

export function resolveENSName$(context$: Observable<Context>, address: string) {
  return context$.pipe(
    switchMap(async (context) => {
      const provider = new ethers.providers.JsonRpcProvider(context.infuraUrl)
      return await provider.lookupAddress(address).catch(() => null)
    }),
  )
}
