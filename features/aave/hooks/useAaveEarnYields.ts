import type { IRiskRatio } from '@oasisdex/dma-library'
import type { NetworkNames } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import type {
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
import { useEffect, useState } from 'react'

export function useAaveEarnYields(
  riskRatio: IRiskRatio | undefined,
  protocol: AaveLendingProtocol | SparkLendingProtocol,
  network: NetworkNames,
  yieldFields: FilterYieldFieldsType[],
): AaveLikeYieldsResponse | undefined {
  const { aaveEarnYieldsQuery } = useAaveContext(protocol, network)
  const [yields, setYields] = useState<AaveLikeYieldsResponse>()

  useEffect(() => {
    // Timeout added to debounce user input
    setYields(undefined)
    const timout = setTimeout(() => {
      if (!riskRatio) return
      aaveEarnYieldsQuery(riskRatio, yieldFields)
        .then((yieldsResponse) => {
          setYields(yieldsResponse)
        })
        .catch((e) => {
          setYields(undefined)

          console.error('unable to get yields', e)
        })
    }, 400)

    return () => clearTimeout(timout)
  }, [riskRatio?.loanToValue.toString()])

  return yields
}
