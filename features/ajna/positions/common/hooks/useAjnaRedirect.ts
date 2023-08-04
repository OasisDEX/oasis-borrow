import { AjnaGenericPosition, AjnaProduct } from 'features/ajna/common/types'
import { isPoolSupportingMultiply } from 'features/ajna/positions/common/helpers/isPoolSupportingMultiply'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useEffect, useState } from 'react'

interface AjnaRedirectProps {
  ajnaPositionData?: AjnaGenericPosition
  collateralToken?: string
  dpmPositionData?: DpmPositionData
  id?: string
  isProxyWithManyPositions: boolean
  product?: AjnaProduct
  quoteToken?: string
}

export function useAjnaRedirect({
  ajnaPositionData,
  collateralToken,
  dpmPositionData,
  id,
  isProxyWithManyPositions,
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
  }, [dpmPositionData, ajnaPositionData, id, collateralToken, quoteToken, product])

  useEffect(() => {
    if (
      id &&
      isProxyWithManyPositions &&
      dpmPositionData &&
      !collateralToken &&
      !quoteToken &&
      !product
    )
      setRedirectLink(
        `/ethereum/ajna/${dpmPositionData.product}/${dpmPositionData.collateralToken}-${dpmPositionData.quoteToken}/${id}`,
      )
  }, [isProxyWithManyPositions, dpmPositionData, id, collateralToken, quoteToken, product])

  return redirectLink
}
