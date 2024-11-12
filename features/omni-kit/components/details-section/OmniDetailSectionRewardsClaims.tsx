import { ADDRESSES } from '@oasisdex/addresses'
import { Network } from '@oasisdex/dma-library'
import { networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import type BigNumber from 'bignumber.js'
import { encodeClaimAllRewards, getAllUserRewards } from 'blockchain/better-calls/aave-like-rewards'
import {
  encodeApproveAndWrapProxyAction,
  encodeTransferToOwnerProxyAction,
  tokenBalance,
} from 'blockchain/better-calls/erc20'
import { NetworkIds } from 'blockchain/networks'
import { tokenPriceStore } from 'blockchain/prices.constants'
import { getTokenByAddress } from 'blockchain/tokensMetadata'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React, { useEffect, useReducer } from 'react'

import { OmniDetailsSectionContentRewardsLoadingState } from './OmniDetailsSectionContentRewardsLoadingState'
import { OmniRewardsClaims } from './OmniRewardsClaims'

interface OmniDetailSectionRewardsClaimsInternalProps {
  isEligibleForErc20Claims: boolean
  isEligibleForProtocolRewards: boolean
  isEligibleForMorphoLegacy: boolean
}

const claimableErc20ByNetwork: Record<NetworkIds, string[]> = {
  [NetworkIds.MAINNET]: ['ENA', 'SENA'],
  [NetworkIds.OPTIMISMMAINNET]: [],
  [NetworkIds.ARBITRUMMAINNET]: [],
  [NetworkIds.BASEMAINNET]: [],
  [NetworkIds.POLYGONMAINNET]: [],
  [NetworkIds.POLYGONMUMBAI]: [],
  [NetworkIds.BASEGOERLI]: [],
  [NetworkIds.EMPTYNET]: [],
  [NetworkIds.GOERLI]: [],
  [NetworkIds.HARDHAT]: [],
  [NetworkIds.ARBITRUMGOERLI]: [],
  [NetworkIds.OPTIMISMGOERLI]: [],
}

const morphoLegacyByNetwork: Partial<Record<NetworkIds, string>> = {
  [NetworkIds.MAINNET]: 'MORPHO_LEGACY',
}

type Claim = {
  token: string
  claimable: BigNumber
  tx: OmniTxData
}

const OmniDetailSectionRewardsClaimsInternal: FC<OmniDetailSectionRewardsClaimsInternalProps> = ({
  isEligibleForErc20Claims,
  isEligibleForProtocolRewards,
  isEligibleForMorphoLegacy,
}) => {
  const {
    environment: { dpmProxy, networkId, protocol, quoteAddress },
  } = useOmniGeneralContext()

  const [claims, dispatchClaim] = useReducer((state: Claim[], element: Claim) => {
    return [...state, element]
  }, [])

  useEffect(() => {
    if (!dpmProxy) return
    if (isEligibleForErc20Claims) {
      claimableErc20ByNetwork[networkId].forEach((token) => {
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
    }
    if (isEligibleForMorphoLegacy) {
      const morphoLegacyToken = morphoLegacyByNetwork[networkId]
      if (morphoLegacyToken) {
        const network = networkIdToLibraryNetwork(networkId)
        if (network === Network.MAINNET) {
          tokenBalance({ token: morphoLegacyToken, account: dpmProxy, networkId })
            .then((balance) => {
              if (balance.gt(zero)) {
                encodeApproveAndWrapProxyAction({
                  oldToken: morphoLegacyToken,
                  newToken: 'MORPHO',
                  wrapper: ADDRESSES[network].morphoblue.Wrapper,
                  amount: balance,
                  networkId,
                })
                  .then((tx) => {
                    dispatchClaim({ token: 'MORPHO', claimable: balance, tx })
                  })
                  .catch((error) => {
                    console.error(
                      `Error encoding approve and wrap action for MORPHO_LEGACY: ${error}`,
                    )
                  })
              }
            })
            .catch((error) => {
              console.error(`Error fetching MORPHO_LEGACY balance: ${error}`)
            })
        }
      }
    }
    if (isEligibleForProtocolRewards) {
      let rewardsControllerAddress: string | undefined
      let poolDataProviderAddress: string | undefined
      const network = networkIdToLibraryNetwork(networkId)
      if (
        protocol === LendingProtocol.AaveV3 &&
        network !== Network.HARDHAT &&
        network !== Network.LOCAL &&
        network !== Network.TENDERLY
      ) {
        rewardsControllerAddress = ADDRESSES[network].aave.v3.RewardsController
        poolDataProviderAddress = ADDRESSES[network].aave.v3.PoolDataProvider
      } else if (
        protocol === LendingProtocol.SparkV3 &&
        network !== Network.HARDHAT &&
        network !== Network.LOCAL &&
        network !== Network.TENDERLY
      ) {
        rewardsControllerAddress = ADDRESSES[network].spark.RewardsController
        poolDataProviderAddress = ADDRESSES[network].spark.PoolDataProvider
      } else {
        console.warn(`Unsupported protocol or network for rewards: ${protocol} on ${network}`)
        throw new Error(`Unsupported protocol or network for rewards: ${protocol} on ${network}`)
      }

      getAllUserRewards({
        networkId,
        token: quoteAddress,
        account: dpmProxy,
        rewardsController: rewardsControllerAddress as string,
        poolDataProvider: poolDataProviderAddress as string,
      })
        .then(async ({ rewardsList, unclaimedAmounts, assets }) => {
          if (unclaimedAmounts.some((amount) => amount.gt(zero))) {
            const tx = encodeClaimAllRewards({
              networkId,
              assets: assets as string[],
              dpmAccount: dpmProxy,
              rewardsController: rewardsControllerAddress as string,
            })

            rewardsList.forEach((token, index) => {
              if (unclaimedAmounts[index].gt(zero)) {
                dispatchClaim({
                  token: getTokenByAddress(token, networkId).symbol,
                  claimable: unclaimedAmounts[index],
                  tx,
                })
              }
            })
          }
        })
        .catch((error) => {
          console.error(`Error fetching ${protocol} rewards:`, error)
        })
    }
  }, [dpmProxy, networkId, protocol, quoteAddress])

  return claims.length > 0 ? (
    <>
      {claims && claims.length > 0 && tokenPriceStore.prices ? (
        <>
          {claims.map((claim) => (
            <OmniRewardsClaims key={claim.token} {...claim} prices={tokenPriceStore.prices} />
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

export const OmniDetailSectionRewardsClaims: FC = () => {
  const {
    environment: { protocol, collateralToken, quoteToken, networkId },
  } = useOmniGeneralContext()

  const rewardsEligibleTokens = ['SUSDE', 'USDE', 'WETH', 'ETH']

  // Regular ERC20 claims eligibility
  const isEligibleForErc20Claims = claimableErc20ByNetwork[networkId].length > 0

  // Aave/Spark rewards eligibility
  const isEligibleForProtocolRewards =
    [LendingProtocol.AaveV3, LendingProtocol.SparkV3].includes(protocol) &&
    (rewardsEligibleTokens.includes(collateralToken) || rewardsEligibleTokens.includes(quoteToken))

  // Legacy Morpho claims eligibility
  const isEligibleForMorphoLegacy =
    networkId === NetworkIds.MAINNET && protocol === LendingProtocol.MorphoBlue

  const hasAnyEligibleClaims =
    isEligibleForErc20Claims || isEligibleForProtocolRewards || isEligibleForMorphoLegacy

  return hasAnyEligibleClaims ? (
    <OmniDetailSectionRewardsClaimsInternal
      isEligibleForErc20Claims={isEligibleForErc20Claims}
      isEligibleForProtocolRewards={isEligibleForProtocolRewards}
      isEligibleForMorphoLegacy={isEligibleForMorphoLegacy}
    />
  ) : (
    <></>
  )
}
