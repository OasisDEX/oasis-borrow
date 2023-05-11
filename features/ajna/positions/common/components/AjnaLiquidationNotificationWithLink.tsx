import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'
import React, { FC } from 'react'

interface AjnaLiquidationNotificationWithLinkProps {
  translationKey: string
  values?: { [key: string]: string }
}

export const AjnaLiquidationNotificationWithLink: FC<AjnaLiquidationNotificationWithLinkProps> = ({
  translationKey,
  values,
}) => (
  <Trans
    i18nKey={translationKey}
    values={values}
    components={[
      <AppLink
        sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
        // TODO update link to ajna liquidations once available
        href={EXTERNAL_LINKS.KB.HELP}
      />,
    ]}
  />
)
