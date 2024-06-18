import type { OmniProductType } from 'features/omni-kit/types'
import { RefinanceSidebarStep } from 'features/refinance/types'
import type { LendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import type { TranslationType } from 'ts_modules/i18next'

export const getRefinanceStatusCopy = ({
  currentStep,
  isTxSuccess,
  collateralToken,
  quoteToken,
  productType,
  protocol,
  t,
}: {
  currentStep: RefinanceSidebarStep
  isTxSuccess: boolean
  collateralToken: string
  quoteToken: string
  productType: OmniProductType
  protocol?: LendingProtocol
  t: TranslationType
}) =>
  currentStep === RefinanceSidebarStep.Import
    ? t(`migrate.allowance-form.status.${isTxSuccess ? 'success' : 'in-progress'}`)
    : t(`omni-kit.form.transaction.${isTxSuccess ? 'success' : 'progress'}-open`, {
        collateralToken,
        quoteToken,
        productType,
        protocol: protocol ? LendingProtocolLabel[protocol] : undefined,
      })
