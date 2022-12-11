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

interface DsrDetailsSectionProps {
  currentApy: BigNumber
  netValue: BigNumber
  totalDepositedDai?: BigNumber
  depositAmount?: BigNumber
}

export function DsrDetailsSection({
  totalDepositedDai,
  currentApy,
  depositAmount,
  netValue,
}: DsrDetailsSectionProps) {
  const { t } = useTranslation()

  return (
    <>
      {!totalDepositedDai?.isZero() ? (
        <DetailsSection
          title={t('dsr.details.overview')}
          content={
            <DetailsSectionContentCardWrapper>
              <DetailsSectionContentCard
                title={t('net-value')}
                value={`${formatCryptoBalance(netValue)}`}
                unit="DAI"
                footnote={`${t('net-earnings')} + ${formatCryptoBalance(
                  totalDepositedDai || zero,
                )} DAI`}
              />
              <DetailsSectionContentCard
                title={t('dsr.details.current-dai-savings-rate')}
                value={currentApy.toFixed(2)}
                unit="%"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <DsrSimulationSection apy={currentApy} userInputAmount={depositAmount || zero} />
      )}
    </>
  )
}
