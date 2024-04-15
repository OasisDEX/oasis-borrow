import BigNumber from 'bignumber.js'
import type { GetYieldsParams, GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useMemo, useState } from 'react'

export function useOmniEarnYields(params: GetYieldsParams): GetYieldsResponseMapped | undefined {
  const [omniYields, setOmniYields] = useState<GetYieldsResponseMapped>()
  const memoizedGetYieldsRequest = useMemo(() => getYieldsRequest, [])

  useDebouncedEffect(
    () => {
      memoizedGetYieldsRequest(params)
        .then((yieldsResponse) => {
          if (yieldsResponse?.results) {
            setOmniYields({
              apy: new BigNumber(yieldsResponse.results.apy),
              apy7d: new BigNumber(yieldsResponse.results.apy7d),
              apy30d: new BigNumber(yieldsResponse.results.apy30d),
              apy90d: new BigNumber(yieldsResponse.results.apy90d),
            })
          }
        })
        .catch((e) => {
          setOmniYields(undefined)
          console.error('Enable to get yields', { error: e, params })
        })
    },
    [params.ltv.toString()],
    400,
    () => {
      setOmniYields(undefined)
    },
  )

  return omniYields
}
