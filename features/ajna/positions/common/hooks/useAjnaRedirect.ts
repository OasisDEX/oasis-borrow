import type { AjnaGenericPosition, AjnaProduct } from 'features/ajna/common/types'
import { isPoolSupportingMultiply } from 'features/ajna/positions/common/helpers/isPoolSupportingMultiply'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useEffect, useState } from 'react'

interface AjnaRedirectProps {
  ajnaPositionData?: AjnaGenericPosition
  collateralToken?: string
  dpmPositionData?: DpmPositionData
  id?: string
  productType?: AjnaProduct
  quoteToken?: string
}

export function useAjnaRedirect({
  ajnaPositionData,
  collateralToken,
  dpmPositionData,
  id,
  productType,
  quoteToken,
}: AjnaRedirectProps): string | undefined {
  const [redirectLink, setRedirectLink] = useState<string>()

  useEffect(() => {
    if ((dpmPositionData || ajnaPositionData) === null) setRedirectLink(INTERNAL_LINKS.notFound)
  }, [dpmPositionData, ajnaPositionData])

  useEffect(() => {
    if (
      !id &&
      collateralToken &&
      quoteToken &&
      productType === 'multiply' &&
      !isPoolSupportingMultiply({ collateralToken, quoteToken })
    )
      setRedirectLink(INTERNAL_LINKS.ajnaMultiply)
  }, [id, collateralToken, quoteToken, productType])

  useEffect(() => {
    if (
      id &&
      dpmPositionData &&
      dpmPositionData.hasMultiplePositions &&
      !collateralToken &&
      !quoteToken &&
      !productType
    )
      setRedirectLink(
        `/ethereum/ajna/${dpmPositionData.product}/${dpmPositionData.collateralToken}-${dpmPositionData.quoteToken}/${id}`,
      )
  }, [dpmPositionData, id, collateralToken, quoteToken, productType])

  return redirectLink
}
