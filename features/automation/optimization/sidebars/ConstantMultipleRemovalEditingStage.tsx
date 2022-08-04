import { IlkData } from 'blockchain/ilks'
// import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelConstantMultipleInfoSecion } from 'features/automation/basicBuySell/InfoSections/CancelConstantMultipleInfoSection'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import { Text } from 'theme-ui'

interface ConstantMultipleRemovalEditingStageProps {
//   vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  constantMultipleState: ConstantMultipleFormChange
}
export function ConstantMultipleRemovalEditingStage({
  //   vault,
  ilkData,
  errors,
  warnings,
  constantMultipleState,
}: ConstantMultipleRemovalEditingStageProps) {
  const { t } = useTranslation()
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-buy.to-cancel-auto-buy')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <ConstantMultipleInfoSectionControl constantMultipleState={constantMultipleState} />
    </>
  )
}

interface ConstantMultipleInfoSectionControlProps {
  // vault: Vault
  constantMultipleState: ConstantMultipleFormChange
}

function ConstantMultipleInfoSectionControl({
  constantMultipleState,
}: ConstantMultipleInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelConstantMultipleInfoSecion
      title={t('constant-multiple.cancel-summary-title')}
      multiplier={constantMultipleState.multiplier}
    />
  )
}
