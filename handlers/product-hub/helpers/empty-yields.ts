import type { AaveLikeYieldsResponse } from 'lendingProtocols/aave-like-common'

export const emptyYields = () => {
  return Promise.resolve<AaveLikeYieldsResponse>({})
}
