import { IRiskRatio } from '@oasisdex/oasis-actions'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { LendingProtocol } from 'lendingProtocols'
import { AaveYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/common'
import { useEffect, useState } from 'react'

export function useAaveEarnYields(
  riskRatio: IRiskRatio | undefined,
  protocol: LendingProtocol,
  yieldFields: FilterYieldFieldsType[],
): AaveYieldsResponse | undefined {
  const { aaveEarnYieldsQuery } = useAaveContext(protocol)
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
