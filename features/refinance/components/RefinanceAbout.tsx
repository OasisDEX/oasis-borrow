import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { RefinanceCardWrapper } from 'features/refinance/components/RefinanceCardWrapper'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans, useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { checkmark } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

const NewPositionNotice = () => {
  const { t } = useTranslation()

  return (
    <RefinanceCardWrapper>
      <Text as="h3" sx={{ fontWeight: 'semiBold', fontSize: 3, mb: 3 }}>
        {t('refinance.about.notice.title')}
      </Text>
      <Text
        as="p"
        variant="paragraph3"
        sx={{ color: 'neutral80', fontSize: 2, fontWeight: 'semiBold' }}
      >
        {t('refinance.about.notice.description')}
      </Text>
    </RefinanceCardWrapper>
  )
}

interface RefinanceAboutProps {
  withNotice?: boolean
}

export const RefinanceAbout: FC<RefinanceAboutProps> = ({ withNotice = true }) => {
  const { t } = useTranslation()

  return (
    <Flex sx={{ flex: 1, flexDirection: 'column', rowGap: 3, minWidth: '300px' }}>
      {withNotice && <NewPositionNotice />}
      <Flex sx={{ px: '24px', flexDirection: 'column', rowGap: 3 }}>
        <Text as="h3" sx={{ fontWeight: 'semiBold', fontSize: 3 }}>
          {t('refinance.about.title')}
        </Text>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', fontSize: 2 }}>
          {t('refinance.about.description')}
        </Text>
        <Text as="h3" sx={{ fontWeight: 'semiBold', fontSize: 3 }}>
          {t('refinance.about.list-title')}
        </Text>
        <ListWithIcon
          icon={checkmark}
          iconSize="14px"
          iconColor="primary100"
          items={[
            ...t('refinance.about.bullet-points', {
              returnObjects: true,
            }),
          ]}
        />
        <Text as="p" variant="paragraph3" sx={{ fontSize: 1, fontWeight: 'semiBold' }}>
          <Trans
            i18nKey="refinance.about.footer"
            shouldUnescape
            components={{
              1: (
                <AppLink
                  sx={{ fontSize: 'inherit', color: 'interactive100' }}
                  href={EXTERNAL_LINKS.KB.HELP}
                />
              ),
              2: (
                <AppLink
                  sx={{ fontSize: 'inherit', color: 'interactive100' }}
                  href={EXTERNAL_LINKS.DISCORD}
                />
              ),
            }}
          />
        </Text>
      </Flex>
    </Flex>
  )
}
