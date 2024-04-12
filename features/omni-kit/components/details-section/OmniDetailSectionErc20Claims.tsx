import type BigNumber from 'bignumber.js'
import { encodeTransferToOwnerProxyAction, tokenBalance } from 'blockchain/better-calls/erc20'
import { tokenPriceStore } from 'blockchain/prices.constants'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React, { useEffect, useReducer } from 'react'

import { OmniDetailsSectionContentRewardsLoadingState } from './OmniDetailsSectionContentRewardsLoadingState'
import { OmniErc20Claims } from './OmniErc20Claims'

const claimableErc20 = ['ENA']

type Claim = {
  token: string
  claimable: BigNumber
  tx: OmniTxData
}

const OmniDetailSectionErc20ClaimsInternal: FC = () => {
  const {
    environment: { dpmProxy, networkId },
  } = useOmniGeneralContext()

  const [claims, dispatchClaim] = useReducer((state: Claim[], element: Claim) => {
    return [...state, element]
  }, [])

  useEffect(() => {
    if (dpmProxy)
      claimableErc20.forEach((token) => {
        tokenBalance({ token, account: dpmProxy, networkId: networkId })
          .then((balance) => {
            if (balance.gt(zero)) {
              encodeTransferToOwnerProxyAction({
                token,
                networkId,
                amount: balance,
                dpmAccount: dpmProxy,
              })
                .then((tx) => {
                  dispatchClaim({ token, claimable: balance, tx })
                })
                .catch((error) => {
                  console.error(`Error encoding transfer all proxy action for ${token}: ${error}`)
                })
            }
          })
          .catch((error) => {
            console.error(`Error fetching token balance for ${token}: ${error}`)
          })
      })
  }, [dpmProxy, networkId])

  return claims.length > 0 ? (
    <>
      {claims && claims.length > 0 && tokenPriceStore.prices ? (
        <>
          {claims.map((claim) => (
            // It's a component per claim because we don't have a proper action to support multiple claims at once. Besides, right now it's only for one token.
            <OmniErc20Claims key={claim.token} {...claim} prices={tokenPriceStore.prices} />
          ))}
        </>
      ) : (
        <OmniDetailsSectionContentRewardsLoadingState />
      )}
    </>
  ) : (
    <></>
  )
}

export const OmniDetailSectionErc20Claims: FC = () => {
  const {
    environment: { protocol, collateralToken, quoteToken },
  } = useOmniGeneralContext()

  const eligibleTokens = ['ENA', 'SUSDE']

  const isEligible =
    [LendingProtocol.MorphoBlue, LendingProtocol.Ajna].includes(protocol) &&
    (eligibleTokens.includes(collateralToken) || eligibleTokens.includes(quoteToken))

  return isEligible ? <OmniDetailSectionErc20ClaimsInternal /> : <></>
}
