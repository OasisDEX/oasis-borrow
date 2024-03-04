import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  AaveLikeDetailsSectionContentManage,
  AaveLikeDetailsSectionContentYieldLoopOpen,
} from 'features/omni-kit/protocols/aave-like/components'
import type { FC } from 'react'
import React from 'react'

export const AaveLikeDetailsSectionContent: FC = () => {
  const {
    environment: { isOpening, isYieldLoopWithData },
  } = useOmniGeneralContext()

  return isYieldLoopWithData && isOpening ? (
    <AaveLikeDetailsSectionContentYieldLoopOpen />
  ) : (
    <AaveLikeDetailsSectionContentManage />
  )
}
