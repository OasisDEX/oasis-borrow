import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import React from 'react'

export function AjnaPoolCreatorController() {
  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <AjnaHeader title="Ajna Pool Creator" intro="Lorem ipsum dolor sit amet" />
      </AnimatedWrapper>
    </WithConnection>
  )
}
