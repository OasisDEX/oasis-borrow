import { omniBorrowishProducts } from 'features/omni-kit/constants'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'

interface GetDefaultBorrowishPositionTypeParams {
  dpmList: DpmSubgraphData[]
  proxyAddress: string
  collateralTokenAddress: string
  quoteTokenAddress: string
  protocolRaw: string
  isEarn?: boolean
}

export function getDefaultBorrowishPositionType({
  dpmList,
  collateralTokenAddress,
  quoteTokenAddress,
  proxyAddress,
  protocolRaw,
  isEarn,
}: GetDefaultBorrowishPositionTypeParams): OmniProductBorrowishType {
  return dpmList
    .find(({ id }) => id === proxyAddress)
    ?.createEvents.find(
      ({
        collateralToken: eventCollateralToken,
        debtToken: eventDebtToken,
        positionType: eventPositionType,
        protocol: eventProtocol,
      }) => {
        return (
          eventCollateralToken === collateralTokenAddress &&
          eventDebtToken === quoteTokenAddress &&
          eventProtocol === protocolRaw &&
          ((isEarn && eventPositionType === OmniProductType.Earn) ||
            (!isEarn && omniBorrowishProducts.includes(eventPositionType)))
        )
      },
    )?.positionType as OmniProductBorrowishType
}
