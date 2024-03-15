import type { Erc4626Position } from '@oasisdex/dma-library'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  OmniContentCard,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { Erc4626ApyTooltip } from 'features/omni-kit/protocols/erc-4626/components'
import { Erc4626DetailsSectionContentEstimatedEarnings } from 'features/omni-kit/protocols/erc-4626/components/details-section'
import { getErc4626Apy } from 'features/omni-kit/protocols/erc-4626/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContent: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { isOpening, quoteToken },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
    position: { currentPosition },
  } = useOmniProductContext(OmniProductType.Earn)

  const position = currentPosition.position as Erc4626Position

  const netValueContentCardCommonData = useOmniCardDataTokensValue({
    tokensAmount: position.netValue,
    tokensSymbol: quoteToken,
    translationCardName: 'net-value',
  })

  const earningsToDateContentCardCommonData = useOmniCardDataTokensValue({
    tokensAmount: position.totalEarnings.withoutFees,
    tokensSymbol: quoteToken,
    translationCardName: 'earnings-to-date',
    footnote: t('erc-4626.content-card.earnings-to-date.footnote'),
  })

  const resolvedDepositAmount = depositAmount ?? omniDefaultOverviewSimulationDeposit

  const earningsPer1d = resolvedDepositAmount.times(
    getErc4626Apy({
      rewardsApy: position.apyFromRewards.per1d,
      vaultApy: position.apy.per1d,
    }),
  )
  const earningsPer30d = resolvedDepositAmount.times(
    getErc4626Apy({
      rewardsApy: position.apyFromRewards.per30d,
      vaultApy: position.apy.per30d,
    }),
  )
  const earningsPer365d = resolvedDepositAmount.times(
    getErc4626Apy({
      rewardsApy: position.apyFromRewards.per365d,
      vaultApy: position.apy.per365d,
    }),
  )

  return (
    <>
      {isOpening ? (
        <DetailsSectionContentTable
          headers={[
            t('omni-kit.position-page.earn.open.duration'),
            t('omni-kit.position-page.earn.open.estimated-earnings'),
            t('omni-kit.position-page.earn.open.net-value'),
          ]}
          rows={[
            [
              t('omni-kit.position-page.earn.open.earnings-per-1d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={earningsPer1d}
                token={quoteToken}
                tooltip={
                  <Erc4626ApyTooltip
                    rewardsApy={position.apyFromRewards.per1d}
                    vaultApy={position.apy.per1d}
                  />
                }
              />,
              `${formatCryptoBalance(resolvedDepositAmount.plus(earningsPer1d))} ${quoteToken}`,
            ],
            [
              t('omni-kit.position-page.earn.open.earnings-per-30d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={earningsPer30d}
                token={quoteToken}
                tooltip={
                  <Erc4626ApyTooltip
                    rewardsApy={position.apyFromRewards.per30d}
                    vaultApy={position.apy.per30d}
                  />
                }
              />,
              `${formatCryptoBalance(resolvedDepositAmount.plus(earningsPer30d))} ${quoteToken}`,
            ],
            [
              t('omni-kit.position-page.earn.open.earnings-per-365d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={earningsPer365d}
                token={quoteToken}
                tooltip={
                  <Erc4626ApyTooltip
                    rewardsApy={position.apyFromRewards.per365d}
                    vaultApy={position.apy.per365d}
                  />
                }
              />,
              `${formatCryptoBalance(resolvedDepositAmount.plus(earningsPer365d))} ${quoteToken}`,
            ],
          ]}
          footnote={<>{t('omni-kit.position-page.earn.open.disclaimer')}</>}
        />
      ) : (
        <>
          <OmniContentCard {...netValueContentCardCommonData} />
          <OmniContentCard {...earningsToDateContentCardCommonData} />
        </>
      )}
    </>
  )
}
