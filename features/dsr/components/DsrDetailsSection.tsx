import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import { DsrSimulationSection } from 'features/dsr/components/DsrSimulationSection'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface DsrDetailsSectionProps {
  apy: BigNumber
  netValue: BigNumber
  earnings: BigNumber
  depositAmount?: BigNumber
}

export function DsrDetailsSection({
  apy,
  depositAmount,
  netValue,
  earnings,
}: DsrDetailsSectionProps) {
  const { t } = useTranslation()

  return (
    <>
      {netValue.gt(zero) ? (
        <DetailsSection
          title={t('dsr.details.overview')}
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
      ) : (
        <DsrSimulationSection apy={apy} userInputAmount={depositAmount || zero} />
      )}
    </>
  )
}
