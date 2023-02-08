interface CancellationToken {
  cancelled: boolean
  cancel(): void
}

export class CancellationPromiseToken implements CancellationToken {
  cancelled = false

  cancel() {
    this.cancelled = true
  }
}

export function makeCancellablePromise<T>(promise: Promise<T>, token: CancellationToken): Promise<T> {
  return new Promise((resolve, reject) => {
    promise
      .then((result) => {
        if (token.cancelled) {
          reject(new Error('Cancelled'))
        } else {
          resolve(result)
        }
      })
      .catch((error) => {
        if (token.cancelled) {
          reject(new Error('Cancelled'))
        } else {
          reject(error)
        }
      })
  })
}
