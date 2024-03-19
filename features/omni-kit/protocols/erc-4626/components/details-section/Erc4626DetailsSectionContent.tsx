import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  Erc4626DetailsSectionContentManage,
  Erc4626DetailsSectionContentOpen,
} from 'features/omni-kit/protocols/erc-4626/components/details-section'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContent: FC = () => {
  const {
    environment: { isOpening },
  } = useOmniGeneralContext()

  return isOpening ? <Erc4626DetailsSectionContentOpen /> : <Erc4626DetailsSectionContentManage />
}
