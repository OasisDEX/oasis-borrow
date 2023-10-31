import type BigNumber from 'bignumber.js'
import { DetailsSection, DetailsSectionTitle } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import { TokensGroup } from 'components/TokensGroup'
import { DsrSimulationSection } from 'features/dsr/components/DsrSimulationSection'
import type { DsrSidebarTabOptions } from 'features/dsr/helpers/dsrDeposit.types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Heading } from 'theme-ui'

interface CustomOverviewTitleProps {
  token: string
  title: string
}

const CustomOverviewTitle: FC<CustomOverviewTitleProps> = ({ token, title }) => (
  <DetailsSectionTitle>
    <TokensGroup tokens={[token]} forceSize={32} sx={{ mr: 2, flexShrink: 0 }} />
    <Heading as="p">{title}</Heading>
  </DetailsSectionTitle>
)

interface DsrDetailsSectionProps {
  dsr: BigNumber
  apy: BigNumber
  netValue: BigNumber
  earnings: BigNumber
  operation: DsrSidebarTabOptions
  isMintingSDai: boolean
  sDaiBalance: BigNumber
  depositAmount?: BigNumber
  sdaiPrice: BigNumber
  daiPrice: BigNumber
}

export function DsrDetailsSection({
  dsr,
  apy,
  depositAmount,
  netValue,
  earnings,
  operation,
  isMintingSDai,
  sDaiBalance,
  sdaiPrice,
  daiPrice,
}: DsrDetailsSectionProps) {
  const { t } = useTranslation()

  const sDaiNetValue = sDaiBalance.gt(zero) ? sDaiBalance.times(sdaiPrice.div(daiPrice)) : zero

  return (
    <>
      {netValue.gt(zero) ? (
        <>
          <DetailsSection
            title={<CustomOverviewTitle title={t('dsr.details.dsr-overview')} token="DAI" />}
            content={
              <DetailsSectionContentCardWrapper>
                <DetailsSectionContentCard
                  title={t('net-value')}
                  value={`${formatCryptoBalance(netValue)}`}
                  unit="DAI"
                  footnote={`${t('net-earnings')} ${formatCryptoBalance(earnings)} DAI`}
                />
                <DetailsSectionContentCard
                  title={t('dsr.details.current-dai-savings-rate')}
                  value={apy.toFixed(2)}
                  unit="%"
                />
              </DetailsSectionContentCardWrapper>
            }
          />
          {sDaiBalance.gt(zero) && (
            <Box sx={{ mt: 4 }}>
              <DetailsSection
                title={<CustomOverviewTitle title={t('dsr.details.sdai-overview')} token="SDAI" />}
                content={
                  <DetailsSectionContentCardWrapper>
                    <DetailsSectionContentCard
                      title={t('net-value')}
                      value={`${formatCryptoBalance(sDaiNetValue)}`}
                      unit="DAI"
                      footnote={`${t('dsr.details.sdai-balance')} ${formatCryptoBalance(
                        sDaiBalance,
                      )}`}
                    />
                    <DetailsSectionContentCard
                      title={t('dsr.details.current-dai-savings-rate')}
                      value={apy.toFixed(2)}
                      unit="%"
                    />
                  </DetailsSectionContentCardWrapper>
                }
              />
            </Box>
          )}
        </>
      ) : (
        <DsrSimulationSection
          dsr={dsr}
          userInputAmount={operation === 'convert' || isMintingSDai ? zero : depositAmount || zero}
          sDaiNetValue={sDaiNetValue}
        />
      )}
    </>
  )
}
