import { OmniProductType } from 'features/omni-kit/types'
import { RefinanceOptions } from 'features/refinance/types'

export const getRefinanceNewProductType = ({
  currentType,
  refinanceOption,
}: {
  currentType: OmniProductType
  refinanceOption: RefinanceOptions
}) =>
  ({
    [RefinanceOptions.CHANGE_DIRECTION]: currentType,
    [RefinanceOptions.HIGHER_LTV]: currentType,
    [RefinanceOptions.LOWER_COST]: currentType,
    [RefinanceOptions.SWITCH_TO_EARN]: OmniProductType.Earn,
  })[refinanceOption]
