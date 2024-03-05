import type { IRiskRatio } from '@oasisdex/dma-library'
import type { NetworkNames } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import type {
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
import { useState } from 'react'

export function useAaveEarnYields(
  riskRatio: IRiskRatio | undefined,
  protocol: AaveLendingProtocol | SparkLendingProtocol,
  network: NetworkNames,
  yieldFields: FilterYieldFieldsType[],
): AaveLikeYieldsResponse | undefined {
  const { aaveEarnYieldsQuery } = useAaveContext(protocol, network)
  const [yields, setYields] = useState<AaveLikeYieldsResponse>()

  useDebouncedEffect(
    () => {
      if (!riskRatio) return
      aaveEarnYieldsQuery(riskRatio, yieldFields)
        .then((yieldsResponse) => {
          setYields(yieldsResponse)
        })
        .catch((e) => {
          setYields(undefined)

          console.error('unable to get yields', e)
        })
    },
    [riskRatio?.loanToValue.toString()],
    400,
    () => {
      setYields(undefined)
    },
  )

  return yields
}
