import BigNumber from 'bignumber.js'
import { isYieldLoopToken } from 'features/omni-kit/helpers'
import type { GetYieldsParams, GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useState } from 'react'

export function useOmniEarnYields(params: GetYieldsParams): GetYieldsResponseMapped | undefined {
  const [omniYields, setOmniYields] = useState<GetYieldsResponseMapped>()

  useDebouncedEffect(
    () => {
      if (
        params.collateralToken &&
        params.quoteToken &&
        !isYieldLoopToken(params.collateralToken) &&
        !isYieldLoopToken(params.quoteToken)
      ) {
        return
      }
      getYieldsRequest(params)
        .then((yieldsResponse) => {
          if (yieldsResponse?.results) {
            setOmniYields({
              apy365d: yieldsResponse.results.apy
                ? new BigNumber(yieldsResponse.results.apy)
                : undefined,
              apy1d: new BigNumber(yieldsResponse.results.apy1d),
              apy7d: new BigNumber(yieldsResponse.results.apy7d),
              apy30d: yieldsResponse.results.apy30d
                ? new BigNumber(yieldsResponse.results.apy30d)
                : undefined,
              apy90d: yieldsResponse.results.apy90d
                ? new BigNumber(yieldsResponse.results.apy90d)
                : undefined,
            })
          }
        })
        .catch((e) => {
          setOmniYields(undefined)
          console.error('Enable to get yields', { error: e, params })
        })
    },
    [params.ltv.toFixed(6).toString()], // not update on ltv slight change
    400,
    () => {
      setOmniYields(undefined)
    },
  )

  return omniYields
}
