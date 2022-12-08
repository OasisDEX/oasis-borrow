import { DetailsSectionFooterItem } from "components/DetailsSectionFooterItem";
import { useTranslation } from "next-i18next";

export default function DsrDetailsSectionFooter() {
  const { t } = useTranslation();

  return (
    <DetailsSectionFooterItem
      title={t('Current DAI savings rate')}
      value={`1.00%`}
    />
  )
}