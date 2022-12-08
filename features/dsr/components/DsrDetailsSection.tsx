import BigNumber from "bignumber.js";
import { DetailsSection } from "components/DetailsSection";
import { DetailsSectionContentCard, DetailsSectionContentCardWrapper } from "components/DetailsSectionContentCard";
import { DetailsSectionContentTable } from "components/DetailsSectionContentTable";
import { DetailsSectionFooterItemWrapper } from "components/DetailsSectionFooterItem";
import { calculateEarnings, YieldPeriod } from "helpers/earn/calculations";
import { formatCryptoBalance } from "helpers/formatters/format";
import { zero } from "helpers/zero";
import { useTranslation } from "next-i18next";
import { Flex } from "theme-ui";
import DsrDetailsSectionFooter from "./DsrDetailsSectionFooter";
import { DsrTitleSection } from "./DsrTitleSection";

interface DsrDetailsSectionProps {
  totalDepositedDai: BigNumber;
  currentApy: string;
}

export default function DsrDetailsSection({
  totalDepositedDai,
  currentApy
}: DsrDetailsSectionProps) {
  const { t } = useTranslation();
  
  return (
    <DetailsSection
      title={t('dsr.details.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('dsr.details.total-deposited-dai')}
            value={`${formatCryptoBalance(totalDepositedDai)} DAI`}
          />
          <DetailsSectionContentCard
            title={t('dsr.details.current-yield')}
            value={currentApy}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}