import { NetworkNames, networkSetById } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import type { ManageViewInfo } from 'features/aave/types'
import { VaultContainerSpinner } from 'helpers/AppSpinner'
import { mapAaveLikeProtocolSlug, mapAaveLikeProtocolVersion } from 'helpers/getAaveLikeStrategyUrl'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { useRouter } from 'next/router'
import type { AavePositionPageProps } from 'pages/[networkOrProduct]/aave/[version]/[...position]'
import React, { type PropsWithChildren, useEffect, useState } from 'react'
import { first } from 'rxjs/operators'

export function AaveLikeDeprecatedLinkHandler({
  isDeprecatedUrl,
  ...props
}: PropsWithChildren<AavePositionPageProps>) {
  const { replace } = useRouter()
  const { networkId, deprecatedPositionId, protocol } = props
  const networkName = networkSetById[networkId]
    ? networkSetById[networkId].name
    : NetworkNames.ethereumMainnet
  const { manageViewInfo$ } = useAaveContext(
    protocol as AaveLendingProtocol | SparkLendingProtocol,
    networkName,
  )
  const [positionData, setPositionData] = useState<ManageViewInfo | undefined>()
  const [gettingPositionData, setGettingPositionData] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  useEffect(() => {
    const getData = async () => {
      const positionInfoResult = await manageViewInfo$({
        positionId: {
          vaultId: deprecatedPositionId,
          positionAddressType: 'DPM_PROXY',
        },
      })
        .pipe(first())
        .toPromise()
      if (positionInfoResult) {
        setPositionData(positionInfoResult)
      }
    }
    if (!!deprecatedPositionId && !positionData && !gettingPositionData) {
      setGettingPositionData(true)
      void getData()
    }
  }, [deprecatedPositionId, gettingPositionData, manageViewInfo$, positionData])

  useEffect(() => {
    if (positionData && !isRedirecting) {
      const { protocol: positionDataProtocol, strategyConfig } = positionData
      const {
        tokens: { collateral, debt },
        type,
      } = strategyConfig
      const parsedProtocol = mapAaveLikeProtocolSlug(positionDataProtocol)
      const parsedVersion = mapAaveLikeProtocolVersion(positionDataProtocol)
      const pathname = [
        networkName,
        parsedProtocol,
        parsedVersion,
        type.toLocaleLowerCase(),
        `${collateral.toLocaleUpperCase()}-${debt.toLocaleUpperCase()}`,
        deprecatedPositionId,
      ].join('/')
      setIsRedirecting(true)
      void replace(`/${pathname}`)
    }
  }, [deprecatedPositionId, isRedirecting, networkName, positionData, replace])

  if (isDeprecatedUrl && deprecatedPositionId) {
    return <VaultContainerSpinner />
  }

  return <>{props.children}</>
}
