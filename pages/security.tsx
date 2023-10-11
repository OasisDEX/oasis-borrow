import { PageSEOTags } from 'components/HeadTags'
import { Icon } from 'components/Icon'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { Fragment } from 'react'
import { Box, Grid, Heading, Image, Text } from 'theme-ui'
import { arrow_right } from 'theme/icons'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function SecurityPage() {
  useScrollToTop()
  const { t } = useTranslation()
  const securityCategories = [
    {
      name: 'people',
      header: t('security.category.people.header'),
      description: t('security.category.people.description'),
      links: [{ url: INTERNAL_LINKS.about, label: t('security.category.people.link-about') }],
    },
    {
      name: 'audit',
      header: t('security.category.audit.header'),
      description: t('security.category.audit.description'),
      links: [
        {
          url: 'https://chainsecurity.com/security-audit/oasis-multiply-smart-contracts/',
          label: t('security.category.audit.link-multiply'),
        },
        {
          url: 'https://chainsecurity.com/security-audit/oasis-multiply-fmm-extension/',
          label: t('security.category.audit.link-multiply-fmm'),
        },
        {
          url: 'https://chainsecurity.com/security-audit/oasis-automation-consultancy-smart-contracts/',
          label: t('security.category.audit.link-automation'),
        },
        {
          url: 'https://chainsecurity.com/security-audit/oasis-app-modular-proxy-actions/',
          label: t('security.category.audit.link-modular-proxy-actions'),
        },
      ],
    },
    {
      name: 'bug',
      header: t('security.category.bug.header'),
      description: t('security.category.bug.description'),
      links: [
        {
          url: EXTERNAL_LINKS.BUG_BOUNTY,
          label: t('security.category.bug.link-bug-bounty'),
        },
      ],
    },
    {
      name: 'shield',
      header: t('security.category.shield.header'),
      description: t('security.category.shield.description'),
      links: [{ url: INTERNAL_LINKS.privacy, label: t('security.category.shield.link-privacy') }],
    },
  ]
  return (
    <MarketingLayout topBackground="lighter" variant="marketingSmallContainer">
      <Box sx={{ width: '100%', mt: [4, 5], pb: [4, 6] }}>
        <Heading variant="header2" sx={{ textAlign: 'center', mb: 2 }}>
          {t('security.heading')}
        </Heading>
        <Text
          as="p"
          variant="paragraph1"
          sx={{ color: 'neutral80', textAlign: 'center', mb: '90px' }}
        >
          {t('security.intro')}
        </Text>
        <Grid
          sx={{
            gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(1, 100px calc(100% - 120px))'],
            columnGap: 4,
            rowGap: [2, 5],
          }}
        >
          {securityCategories.map((category) => (
            <Fragment key={`SecurityCategories_${category.name}`}>
              <Box sx={{ textAlign: ['center', 'left'] }}>
                <Image
                  src={staticFilesRuntimeUrl(`/static/img/security/${category.name}.svg`)}
                  width={100}
                  sx={{ width: '100px', height: '100px' }}
                />
              </Box>
              <Box sx={{ textAlign: ['center', 'left'], mb: [6, 2] }}>
                <Heading variant="header3" sx={{ color: 'primary100', mb: 1 }}>
                  {category.header}
                </Heading>
                <Text variant="paragraph2" sx={{ color: 'neutral80', mb: 1 }}>
                  {category.description}
                </Text>
                {category.links.length && (
                  <Grid
                    sx={{
                      mt: 3,
                      gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(2, calc(50% - 16px))'],
                      columnGap: 4,
                      rowGap: 1,
                    }}
                  >
                    {category.links.map((link) => (
                      <AppLink variant="inText" target="_blank" href={link.url}>
                        {link.label}
                        <Icon
                          icon={arrow_right}
                          size="14px"
                          sx={{
                            ml: 1,
                            position: 'relative',
                          }}
                        />
                      </AppLink>
                    ))}
                  </Grid>
                )}
              </Box>
            </Fragment>
          ))}
        </Grid>
      </Box>
    </MarketingLayout>
  )
}

SecurityPage.seoTags = (
  <PageSEOTags title="seo.security.title" description="seo.security.description" url="/security" />
)

export default SecurityPage
