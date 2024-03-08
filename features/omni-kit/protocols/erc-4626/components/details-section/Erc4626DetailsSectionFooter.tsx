import { OmniContentCard, useOmniCardDataLink } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionFooter: FC = () => {
  const {
    environment: { isOpening, label },
  } = useOmniGeneralContext()

  const { curator } = erc4626VaultsByName[label as string]

  const curatorContentCardCommonData = useOmniCardDataLink({
    translationCardName: 'curator',
    ...curator,
  })

  return (
    <>
      {isOpening ? (
        <>
          <OmniContentCard asFooter {...curatorContentCardCommonData} />
        </>
      ) : (
        <>Manage overview footer</>
      )}
    </>
  )
}
