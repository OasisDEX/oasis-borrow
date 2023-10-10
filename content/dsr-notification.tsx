import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface DsrNotificationWithLinkProps {
  translationKey: string
  values?: { [key: string]: string }
}

const DsrNotificationWithLink: FC<DsrNotificationWithLinkProps> = ({ translationKey, values }) => (
  <Trans
    i18nKey={translationKey}
    values={values}
    components={{
      1: (
        <AppLink
          sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
          href={EXTERNAL_LINKS.BLOG.MAKER_STABILITY_FEE_CHANGES}
        />
      ),
    }}
  />
)

export const dsrNotification: DetailsSectionNotificationItem = {
  // currently not used anywhere as per story/11261 but im leaving the structure for future use
  title: {
    translationKey: 'dsr.notification.title',
  },
  message: {
    component: <DsrNotificationWithLink translationKey="dsr.notification.message" />,
  },
  type: 'notice',
  icon: 'bell',
  closable: true,
}
