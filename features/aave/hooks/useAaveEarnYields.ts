import { IRiskRatio } from '@oasisdex/dma-library'
import { NetworkNames } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import { AaveLendingProtocol } from 'lendingProtocols'
import { AaveYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/aave-like-common'
import { useEffect, useState } from 'react'

export function useAaveEarnYields(
  riskRatio: IRiskRatio | undefined,
  protocol: AaveLendingProtocol,
  network: NetworkNames,
  yieldFields: FilterYieldFieldsType[],
): AaveYieldsResponse | undefined {
  const { aaveEarnYieldsQuery } = useAaveContext(protocol, network)
  const [yields, setYields] = useState<AaveYieldsResponse>()

  useEffect(() => {
    if (!riskRatio) return
    aaveEarnYieldsQuery(riskRatio, yieldFields)
      .then((yields) => {
        setYields(yields)
      })
      .catch((e) => {
        console.error('unable to get yields', e)
      })
  }, [aaveEarnYieldsQuery, riskRatio, yieldFields])

  return yields
}
