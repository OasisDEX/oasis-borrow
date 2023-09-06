import { useEffect, useState } from 'react'
import { IRiskRatio } from '@oasisdex/dma-library'
import { NetworkNames } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { AaveLikeYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/aave-like-common'

export function useAaveEarnYields(
  riskRatio: IRiskRatio | undefined,
  protocol: AaveLendingProtocol | SparkLendingProtocol,
  network: NetworkNames,
  yieldFields: FilterYieldFieldsType[],
): AaveLikeYieldsResponse | undefined {
  const { aaveEarnYieldsQuery } = useAaveContext(protocol, network)
  const [yields, setYields] = useState<AaveLikeYieldsResponse>()

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
