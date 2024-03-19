import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { Erc4626ApyTooltip } from 'features/omni-kit/protocols/erc-4626/components'
import {
  Erc4626DetailsSectionContentEstimatedEarnings,
  Erc4626DetailsSectionContentEstimationLoader,
} from 'features/omni-kit/protocols/erc-4626/components/details-section'
import { useErc4626CustomState } from 'features/omni-kit/protocols/erc-4626/contexts'
import { useErc4626ApySimulation } from 'features/omni-kit/protocols/erc-4626/hooks'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContentOpen: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { label, quoteToken },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Earn)
  const {
    state: { estimatedPrice },
  } = useErc4626CustomState()

  const { address: vaultAddress } = erc4626VaultsByName[label as string]

  const {
    apy,
    earnings,
    isLoading: isApyLoading,
    netValue,
  } = useErc4626ApySimulation({
    depositAmount: depositAmount ?? omniDefaultOverviewSimulationDeposit,
    vaultAddress,
    rewardTokenPrice: estimatedPrice,
  })

  return (
    <DetailsSectionContentTable
      headers={[
        t('omni-kit.position-page.earn.open.duration'),
        t('omni-kit.position-page.earn.open.estimated-earnings'),
        t('omni-kit.position-page.earn.open.net-value'),
      ]}
      rows={[
        ...(!isApyLoading && apy && earnings && netValue
          ? [
              [
                t('omni-kit.position-page.earn.open.earnings-per-1d'),
                <Erc4626DetailsSectionContentEstimatedEarnings
                  estimatedEarnings={earnings.per1d}
                  token={quoteToken}
                  tooltip={
                    <Erc4626ApyTooltip
                      rewardsApy={apy.rewardsApy.per1d}
                      vaultApy={apy.vaultApy.per1d}
                    />
                  }
                />,
                `${formatCryptoBalance(netValue.per1d)} ${quoteToken}`,
              ],
              [
                t('omni-kit.position-page.earn.open.earnings-per-30d'),
                <Erc4626DetailsSectionContentEstimatedEarnings
                  estimatedEarnings={earnings.per30d}
                  token={quoteToken}
                  tooltip={
                    <Erc4626ApyTooltip
                      rewardsApy={apy.rewardsApy.per30d}
                      vaultApy={apy.vaultApy.per30d}
                    />
                  }
                />,
                `${formatCryptoBalance(netValue.per30d)} ${quoteToken}`,
              ],
              [
                t('omni-kit.position-page.earn.open.earnings-per-365d'),
                <Erc4626DetailsSectionContentEstimatedEarnings
                  estimatedEarnings={earnings.per365d}
                  token={quoteToken}
                  tooltip={
                    <Erc4626ApyTooltip
                      rewardsApy={apy.rewardsApy.per365d}
                      vaultApy={apy.vaultApy.per365d}
                    />
                  }
                />,
                `${formatCryptoBalance(netValue.per365d)} ${quoteToken}`,
              ],
            ]
          : [
              [
                t('omni-kit.position-page.earn.open.earnings-per-1d'),
                <Erc4626DetailsSectionContentEstimationLoader />,
                <Erc4626DetailsSectionContentEstimationLoader />,
              ],
              [
                t('omni-kit.position-page.earn.open.earnings-per-30d'),
                <Erc4626DetailsSectionContentEstimationLoader />,
                <Erc4626DetailsSectionContentEstimationLoader />,
              ],
              [
                t('omni-kit.position-page.earn.open.earnings-per-365d'),
                <Erc4626DetailsSectionContentEstimationLoader />,
                <Erc4626DetailsSectionContentEstimationLoader />,
              ],
            ]),
      ]}
      footnote={<>{t('omni-kit.position-page.earn.open.disclaimer')}</>}
    />
  )
}
