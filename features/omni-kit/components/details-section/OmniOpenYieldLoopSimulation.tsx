import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { mapSimulation } from 'features/aave/components'
import type { CalculateSimulationResult } from 'features/aave/open/services'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export type OmniSimulationYields = CalculateSimulationResult & { yields: GetYieldsResponseMapped }

interface OmniOpenYieldLoopSimulationProps {
  simulations: OmniSimulationYields | undefined
}

export const OmniOpenYieldLoopSimulation: FC<OmniOpenYieldLoopSimulationProps> = ({
  simulations,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <DetailsSectionContentTable
        headers={[
          t('earn-vault.simulate.header1'),
          t('earn-vault.simulate.header2'),
          t('earn-vault.simulate.header3'),
        ]}
        rows={[
          [t('earn-vault.simulate.rowlabel1'), ...mapSimulation(simulations?.previous30Days)],
          [t('earn-vault.simulate.rowlabel2'), ...mapSimulation(simulations?.previous90Days)],
          [t('earn-vault.simulate.rowlabel3'), ...mapSimulation(simulations?.previous1Year)],
        ]}
        footnote={<>{t('earn-vault.simulate.footnote1')}</>}
      />
    </>
  )
}
