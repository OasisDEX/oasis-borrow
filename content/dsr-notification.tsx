import { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'
import React, { FC } from 'react'

interface DsrNotificationWithLinkProps {
  translationKey: string
  values?: { [key: string]: string }
}

const DsrNotificationWithLink: FC<DsrNotificationWithLinkProps> = ({ translationKey, values }) => (
  <Trans
    i18nKey={translationKey}
    values={values}
    components={{
      1: <strong />,
      2: (
        <AppLink
          sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
          // TODO update link once available
          href={EXTERNAL_LINKS.KB.HELP}
        />
      ),
    }}
  />
)

export const dsrNotification: DetailsSectionNotificationItem = {
  title: {
    translationKey: 'Maker Protocol DSR rates will increase to 3.49% on June 12th ',
  },
  message: {
    component: <DsrNotificationWithLink translationKey="dsr.notification.message" />,
  },
  type: 'notice',
  icon: 'bell',
  closable: true,
}
