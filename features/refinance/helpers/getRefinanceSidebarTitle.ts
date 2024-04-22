import { RefinanceOptions, RefinanceSidebarStep } from 'features/refinance/types'
import type { TranslationType } from 'ts_modules/i18next'

export const getRefinanceSidebarTitle = ({
  currentStep,
  option,
  t,
}: {
  currentStep: RefinanceSidebarStep
  option?: RefinanceOptions
  t: TranslationType
}) => {
  switch (currentStep) {
    case RefinanceSidebarStep.Option:
      return t('refinance.sidebar.why-refinance.title')
    case RefinanceSidebarStep.Strategy:
      if (!option) {
        throw new Error('Refinance option not defined')
      }

      const extension = {
        [RefinanceOptions.SWITCH_TO_EARN]: 'switch-to-earn',
        [RefinanceOptions.HIGHER_LTV]: 'higher-ltv',
        [RefinanceOptions.LOWER_COST]: 'lower-cost',
        [RefinanceOptions.CHANGE_DIRECTION]: 'change-direction',
      }[option]

      return t(`refinance.sidebar.refinance-option.title-base`, {
        extension: t(`refinance.sidebar.refinance-option.title-extension.${extension}`),
      })
    case RefinanceSidebarStep.Give:
      return t('migrate.allowance-form.title-short')
    case RefinanceSidebarStep.Changes:
      return t('refinance.sidebar.whats-changing.title')
    default:
      // fallback which should never happen
      return t('manage')
  }
}
