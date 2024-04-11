import type { GetYieldsParams, GetYieldsResponse } from 'helpers/lambda/yields'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useState } from 'react'

export function useOmniEarnYields(params: GetYieldsParams): GetYieldsResponse | undefined {
  const [omniYields, setOmniYields] = useState<GetYieldsResponse>()
  useDebouncedEffect(
    () => {
      getYieldsRequest(params)
        .then((yieldsResponse) => {
          setOmniYields(yieldsResponse)
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
