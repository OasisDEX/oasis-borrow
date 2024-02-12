import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'

interface GetDefaultBorrowishPositionTypeParams {
  dpmList: DpmSubgraphData[]
  proxyAddress: string
  collateralTokenAddress: string
  quoteTokenAddress: string
  protocolRaw: string
}

export function getDefaultBorrowishPositionType({
  dpmList,
  collateralTokenAddress,
  quoteTokenAddress,
  proxyAddress,
  protocolRaw,
}: GetDefaultBorrowishPositionTypeParams): OmniProductBorrowishType {
  return dpmList.find(
    ({ id, collateralToken, debtToken, protocol, positionType }) =>
      id === proxyAddress &&
      collateralToken === collateralTokenAddress &&
      debtToken === quoteTokenAddress &&
      protocol === protocolRaw &&
      positionType !== OmniProductType.Earn,
  )?.positionType as OmniProductBorrowishType
}
