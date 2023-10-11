import type { AjnaGenericPosition, ProtocolProduct } from 'features/ajna/common/types'
import { isPoolSupportingMultiply } from 'features/ajna/positions/common/helpers/isPoolSupportingMultiply'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useEffect, useState } from 'react'

interface AjnaRedirectProps {
  ajnaPositionData?: AjnaGenericPosition
  collateralToken?: string
  dpmPositionData?: DpmPositionData
  id?: string
  product?: ProtocolProduct
  quoteToken?: string
}

export function useAjnaRedirect({
  ajnaPositionData,
  collateralToken,
  dpmPositionData,
  id,
  product,
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
      product === 'multiply' &&
      !isPoolSupportingMultiply({ collateralToken, quoteToken })
    )
      setRedirectLink(INTERNAL_LINKS.ajnaMultiply)
  }, [id, collateralToken, quoteToken, product])

  useEffect(() => {
    if (
      id &&
      dpmPositionData &&
      dpmPositionData.hasMultiplePositions &&
      !collateralToken &&
      !quoteToken &&
      !product
    )
      setRedirectLink(
        `/ethereum/ajna/${dpmPositionData.product}/${dpmPositionData.collateralToken}-${dpmPositionData.quoteToken}/${id}`,
      )
  }, [dpmPositionData, id, collateralToken, quoteToken, product])

  return redirectLink
}
