import type BigNumber from 'bignumber.js'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { Skeleton } from 'components/Skeleton'
import type { CalculateSimulationResult } from 'features/aave/open/services'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import type { Simulation } from 'features/omni-kit/helpers/calculateOmniYieldsSimulation'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC, ReactNode } from 'react'
import React from 'react'

export type OmniSimulationYields = CalculateSimulationResult & { yields: GetYieldsResponseMapped }

interface OmniOpenYieldLoopSimulationProps {
  simulations: OmniSimulationYields | undefined
}

export function mapSimulation({
  simulation,
  multiplier,
}: {
  simulation?: Simulation
  multiplier?: BigNumber
}): ReactNode[] {
  if (!simulation)
    return [
      <Skeleton width="70%" sx={{ marginLeft: '30%' }} />,
      <Skeleton width="70%" sx={{ marginLeft: '30%' }} />,
    ]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees.times(multiplier || one))} ${simulation.token}`,
    `${formatCryptoBalance(simulation.netValue.times(multiplier || one))} ${simulation.token}`,
  ]
}

export const OmniOpenYieldLoopSimulation: FC<OmniOpenYieldLoopSimulationProps> = ({
  simulations,
}) => {
  const { t } = useTranslation()
  const {
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  return (
    <>
      <DetailsSectionContentTable
        headers={[
          t('earn-vault.simulate.header1'),
          t('earn-vault.simulate.header2'),
          t('earn-vault.simulate.header3'),
        ]}
        rows={[
          [
            t('earn-vault.simulate.rowlabel1'),
            ...mapSimulation({
              simulation: simulations?.previous30Days,
              multiplier: position.marketPrice,
            }),
          ],
          [
            t('earn-vault.simulate.rowlabel2'),
            ...mapSimulation({
              simulation: simulations?.previous90Days,
              multiplier: position.marketPrice,
            }),
          ],
          [
            t('earn-vault.simulate.rowlabel3'),
            ...mapSimulation({
              simulation: simulations?.previous1Year,
              multiplier: position.marketPrice,
            }),
          ],
        ]}
        footnote={<>{t('earn-vault.simulate.footnote1')}</>}
      />
    </>
  )
}
