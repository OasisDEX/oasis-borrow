import { RiskRatio } from '@oasisdex/dma-library'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { defaultYieldFields, mapSimulation } from 'features/aave/components'
import { useSimulationYields } from 'features/aave/hooks'
import type { IStrategyConfig } from 'features/aave/types'
import {
  omniYieldLoopDefaultSimulationDeposit,
  omniYieldLoopMaxRiskLtvDefaultOffset,
} from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniProductType } from 'features/omni-kit/types'
import { useHash } from 'helpers/useHash'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useMemo } from 'react'

export const AaveLikeDetailsSectionContentYieldLoopOpen: FC = () => {
  const {
    environment: { productType, quotePrice, quoteToken, protocol, network, gasEstimation },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  const { t } = useTranslation()
  const [, setHash] = useHash<string>()
  const amount = useMemo(
    () => depositAmount || omniYieldLoopDefaultSimulationDeposit,
    [depositAmount],
  )

  // It's simplified version of whole aave-like default risk ratio config
  const defaultRiskRatio = new RiskRatio(
    position.maxRiskRatio.loanToValue.minus(omniYieldLoopMaxRiskLtvDefaultOffset),
    RiskRatio.TYPE.LTV,
  )

  const riskRatio = useMemo(
    () => simulation?.riskRatio || defaultRiskRatio,
    [defaultRiskRatio, simulation],
  )

  const simulations = useSimulationYields({
    amount,
    riskRatio,
    fields: defaultYieldFields,
    token: quoteToken,
    strategy: {
      protocol: protocol as AaveLikeLendingProtocol,
      network: network.name,
    } as IStrategyConfig,
    fees: gasEstimation?.usdValue.div(quotePrice),
  })

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
