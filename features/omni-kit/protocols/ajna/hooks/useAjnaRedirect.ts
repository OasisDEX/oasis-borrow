import type { DpmPositionData } from 'features/omni-kit/observables'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import type { OmniProductType } from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useEffect, useState } from 'react'

interface AjnaRedirectProps {
  ajnaPositionData?: AjnaGenericPosition
  collateralToken?: string
  dpmPositionData?: DpmPositionData
  positionId?: string
  productType?: OmniProductType
  quoteToken?: string
}

export function useAjnaRedirect({
  ajnaPositionData,
  collateralToken,
  dpmPositionData,
  positionId,
  productType,
  quoteToken,
}: AjnaRedirectProps): string | undefined {
  const [redirectLink, setRedirectLink] = useState<string>()

  useEffect(() => {
    if ((dpmPositionData || ajnaPositionData) === null) setRedirectLink(INTERNAL_LINKS.notFound)
  }, [dpmPositionData, ajnaPositionData])

  useEffect(() => {
    if (
      !positionId &&
      collateralToken &&
      quoteToken &&
      productType === 'multiply' &&
      !isPoolSupportingMultiply({ collateralToken, quoteToken })
    )
      setRedirectLink(INTERNAL_LINKS.ajnaMultiply)
  }, [positionId, collateralToken, quoteToken, productType])

  useEffect(() => {
    if (
      positionId &&
      dpmPositionData &&
      dpmPositionData.hasMultiplePositions &&
      !collateralToken &&
      !quoteToken &&
      !productType
    )
      setRedirectLink(
        `/ethereum/ajna/${dpmPositionData.product}/${dpmPositionData.collateralToken}-${dpmPositionData.quoteToken}/${positionId}`,
      )
  }, [dpmPositionData, positionId, collateralToken, quoteToken, productType])

  return redirectLink
}
