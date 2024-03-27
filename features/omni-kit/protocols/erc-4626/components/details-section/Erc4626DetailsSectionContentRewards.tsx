import { ADDRESS_ZERO } from '@oasisdex/addresses'
import type BigNumber from 'bignumber.js'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { Erc4626VaultRewards } from 'features/omni-kit/protocols/erc-4626/components'
import { useErc4626CustomState } from 'features/omni-kit/protocols/erc-4626/contexts'
import type { Erc4626Claims } from 'features/omni-kit/protocols/erc-4626/helpers'
import { getErc4626Claims } from 'features/omni-kit/protocols/erc-4626/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { zero } from 'helpers/zero'
import type { FC } from 'react'
import React, { useEffect, useMemo, useState } from 'react'

export const Erc4626DetailsSectionContentRewards: FC = () => {
  const {
    environment: {
      collateralPrice,
      collateralToken,
      dpmProxy,
      extraTokensData,
      label,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    state: { estimatedPrice },
  } = useErc4626CustomState()

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { pricePicker, rewards, rewardsType } = erc4626VaultsByName[label as string]

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
              : pricePicker?.token
              ? estimatedPrice
              : extraTokensData[token]?.price,
        }),
        {},
      ),
    [
      collateralPrice,
      collateralToken,
      estimatedPrice,
      extraTokensData,
      pricePicker?.token,
      quotePrice,
      quoteToken,
      response?.claims,
    ],
  )

  useEffect(() => {
    if (dpmProxy)
      void getErc4626Claims({
        account: dpmProxy,
        rewardsType,
      }).then((data) => {
        if (data.claims.length > 1) setResponse(data)
        else
          setResponse({
            claims: rewards.map(({ token }) => ({
              address: ADDRESS_ZERO,
              claimable: zero,
              earned: zero,
              token,
            })),
          })
      })
  }, [dpmProxy, rewards, rewardsType])

  return (
    <>
      {response && response.claims.length > 0 && prices ? (
        <Erc4626VaultRewards prices={prices} {...response} />
      ) : (
        <>Loading</>
      )}
    </>
  )
}
