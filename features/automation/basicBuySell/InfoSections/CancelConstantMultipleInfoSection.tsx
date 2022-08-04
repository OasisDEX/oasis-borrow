import { InfoSection } from "components/infoSection/InfoSection"
import { useTranslation } from "next-i18next"

interface CancelConstantMultipleInfoSecionProps {
    title: string
    multiplier: number
}

export function CancelConstantMultipleInfoSecion({
    title,
    multiplier,
} : CancelConstantMultipleInfoSecionProps) {
    const { t } = useTranslation()
    return (
        <InfoSection
            title={title}
            items={[
                {
                    label: t('constant-multiple.vault-changes.target-multiple-ratio-after-buy-sell'),
                    value: `${multiplier.toFixed(2)}x`,
                },
            ]}
        />
    )
}