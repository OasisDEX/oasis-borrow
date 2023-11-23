import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'
import React, { type FC } from 'react'

export const OmniSafetyOnMessage: FC = () => (
  <Trans
    i18nKey={'ajna.validations.safety-switch-on'}
    components={[
      <AppLink sx={{ fontSize: 'inherit', color: 'inherit' }} href={EXTERNAL_LINKS.DISCORD} />,
    ]}
  />
)
