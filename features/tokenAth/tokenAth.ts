import { useMemo } from 'react'
import { getToken } from 'blockchain/tokensMetadata'
import { getTokenAth$ } from 'features/tokenAth/tokenAthApi'
import { useObservable } from 'helpers/observableHook'

export function createTokenAth(token: string) {
  const coinGeckoId = getToken(token).coinGeckoId || ''
  const tokenAth$ = useMemo(() => getTokenAth$(coinGeckoId), [token])
  const [tokenAth] = useObservable(tokenAth$)

  return tokenAth?.ath
}
