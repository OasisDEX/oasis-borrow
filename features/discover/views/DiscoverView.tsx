import {
  AjnaProductContextProvider,
} from 'features/ajna/contexts/AjnaProductDetailsContext'
import { DiscoverWrapperWithIntro } from 'features/discover/common/DiscoverWrapperWithIntro'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'

export function DiscoverView({ kind }: { kind: DiscoverPages }) {
  return (
    <AjnaProductContextProvider product="borrow">
      <DiscoverWrapperWithIntro key={kind} />
    </AjnaProductContextProvider>
  )
}
