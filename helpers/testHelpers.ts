import { Observable } from 'rxjs'

export function getStateUnpacker<D>(o$: Observable<D>): () => D {
  let r: D

  o$.subscribe(
    (v) => {
      r = v
    },
    (e) => {
      console.log('error', e, typeof e)
      r = e
    },
  )

  // @ts-ignore
  console.assert(r !== undefined)
  return () => r
}
