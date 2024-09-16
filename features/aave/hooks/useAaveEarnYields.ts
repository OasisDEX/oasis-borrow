import type { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { useState } from 'react'

export function useAaveEarnYields(
  riskRatio: IRiskRatio | undefined,
  protocol: AaveLendingProtocol | SparkLendingProtocol,
  network: NetworkNames,
): GetYieldsResponseMapped | null {
  const { aaveEarnYieldsQuery } = useAaveContext(protocol, network)
  const [yields, setYields] = useState<GetYieldsResponseMapped | null>(null)

  useDebouncedEffect(
    () => {
      if (!riskRatio) return
      aaveEarnYieldsQuery(riskRatio.loanToValue)
        .then((yieldsResponse) => {
          if (yieldsResponse?.results) {
            setYields({
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
          setYields(null)

          console.error('unable to get yields', e)
        })
    },
    [riskRatio?.loanToValue.toString()],
    400,
    () => {
      setYields(null)
    },
  )

  return yields
}
