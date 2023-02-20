import {
  AjnaProductDetailsContextProvider,
} from 'features/ajna/contexts/AjnaProductDetailsContext'
import { DiscoverWrapperWithIntro } from 'features/discover/common/DiscoverWrapperWithIntro'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'

export function DiscoverView({ kind }: { kind: DiscoverPages }) {
  return (
    <AjnaProductDetailsContextProvider product="borrow">
      <DiscoverWrapperWithIntro key={kind} />
    </AjnaProductDetailsContextProvider>
  )
}
