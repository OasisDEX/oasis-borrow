import faqBorrowAave from 'features/content/faqs/aave/borrow/en'
import faqEarnAaveV2 from 'features/content/faqs/aave/earn/en_v2'
import faqEarnAaveV3 from 'features/content/faqs/aave/earn/en_v3'
import faqMultiplyAave from 'features/content/faqs/aave/multiply/en'
import faqBorrowSpark from 'features/content/faqs/spark/borrow/en'
import faqEanSpark from 'features/content/faqs/spark/earn/en_v3'
import faqMultiplySpark from 'features/content/faqs/spark/multiply/en'
import { OmniProductType } from 'features/omni-kit/types'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

export const getAaveLikeFaq = ({
  productType,
  isYieldLoop,
  protocol,
}: {
  productType: OmniProductType.Borrow | OmniProductType.Multiply
  protocol: LendingProtocol
  isYieldLoop: boolean
}) => {
  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const faqMap = {
    [OmniProductType.Borrow]: {
      [LendingProtocol.AaveV2]: faqBorrowAave,
      [LendingProtocol.AaveV3]: faqBorrowAave,
      [LendingProtocol.SparkV3]: faqBorrowSpark,
    },
    [OmniProductType.Multiply]: {
      [LendingProtocol.AaveV2]: isYieldLoop ? faqEarnAaveV2 : faqMultiplyAave,
      [LendingProtocol.AaveV3]: isYieldLoop ? faqEarnAaveV3 : faqMultiplyAave,
      [LendingProtocol.SparkV3]: isYieldLoop ? faqEanSpark : faqMultiplySpark,
    },
  }

  return faqMap[productType][protocol]
}
