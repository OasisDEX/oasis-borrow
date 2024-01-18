import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { LendingProtocolLabel } from 'lendingProtocols'
import { Trans } from 'next-i18next'
import React, { type FC } from 'react'

type OmniSafetyOnMessageProps = {
  protocolLabel: LendingProtocolLabel
}

export const OmniSafetyOnMessage: FC<OmniSafetyOnMessageProps> = ({ protocolLabel }) => (
  <Trans
    i18nKey={'omni-kit.validations.safety-switch-on'}
    components={[
      <AppLink sx={{ fontSize: 'inherit', color: 'inherit' }} href={EXTERNAL_LINKS.DISCORD} />,
    ]}
    values={{ protocolLabel }}
  />
)
