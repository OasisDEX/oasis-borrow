import { Observable } from 'rxjs'

export function getStateUnpacker<D>(o$: Observable<D>): () => D {
  let r: D

  o$.subscribe(
    (v) => {
      r = v
    },
    (e) => {
      r = e
    },
  )

  // @ts-ignore
  console.assert(r !== undefined)
  return () => {
    if (r instanceof Error) throw r
    return r
  }
}
