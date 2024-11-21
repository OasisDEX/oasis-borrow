import { ADDRESS_ZERO } from '@oasisdex/addresses'
import type BigNumber from 'bignumber.js'
import { OmniDetailsSectionContentRewardsLoadingState } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { Erc4626VaultRewards } from 'features/omni-kit/protocols/erc-4626/components'
import type { Erc4626Claims } from 'features/omni-kit/protocols/erc-4626/helpers'
import { getErc4626Claims } from 'features/omni-kit/protocols/erc-4626/helpers'
import { Erc4626RewardsType } from 'features/omni-kit/protocols/erc-4626/types'
import { MetaMorphoClaimsType } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { morphoBorrowishRewards } from 'features/omni-kit/protocols/morpho-blue/settings'
import { zero } from 'helpers/zero'
import type { FC } from 'react'
import React, { useEffect, useMemo, useState } from 'react'

export const MorphoDetailsSectionContentRewards: FC = () => {
  const {
    environment: {
      collateralPrice,
      collateralToken,
      dpmProxy,
      extraTokensData,
      networkId,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()

  const [response, setResponse] = useState<Erc4626Claims>()
  const prices = useMemo(
    () =>
      response?.claims.reduce<{ [key: string]: BigNumber }>(
        (total, { token }) => ({
          ...total,
          [token]:
            token === collateralToken
              ? collateralPrice
              : token === quoteToken
                ? quotePrice
                : extraTokensData[token]?.price,
        }),
        {},
      ),
    [collateralPrice, collateralToken, extraTokensData, quotePrice, quoteToken, response?.claims],
  )
  useEffect(() => {
    if (dpmProxy)
      // we are using erc4626 functions as it uses the same morpho API for rewards
      void getErc4626Claims({
        account: dpmProxy,
        networkId,
        rewardsType: Erc4626RewardsType.MetaMorpho,
        claimType: MetaMorphoClaimsType.SUPPLY,
      }).then((data) => {
        if (data.claims.length > 0) setResponse(data)
        else
          setResponse({
            claims: [
              {
                address: ADDRESS_ZERO,
                claimable: zero,
                earned: zero,
                token: 'MORPHO',
              },
            ],
          })
      })
  }, [dpmProxy, networkId])

  return morphoBorrowishRewards[networkId]?.rewards.length ? (
    <>
      {response && response.claims.length > 0 && prices ? (
        <Erc4626VaultRewards prices={prices} {...response} />
      ) : (
        <OmniDetailsSectionContentRewardsLoadingState />
      )}
    </>
  ) : (
    <></>
  )
}
