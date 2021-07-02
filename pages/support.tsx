// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
// @ts-ignore
import MDX from '@mdx-js/runtime'
import { currentContent } from 'components/content'
import {
  ContentNavigation,
  ContentQuestion,
  ContentTypeSupport,
} from 'components/content/support/support'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { useTranslation } from 'i18n'
import React, { useState } from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Flex, Heading } from 'theme-ui'

function Question({ question, answer }: ContentQuestion) {
  const [opened, setOpened] = useState(false)

  return (
    <Box
      sx={{
        borderBottom: 'light',
        borderColor: 'muted',
        mb: 3,
        py: 1,
        '&:last-child': {
          border: 'none',
        },
      }}
    >
      <Flex
        sx={{
          mb: 3,
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: TRANSITIONS.global,
          '&:hover': {
            color: 'primaryEmphasis',
          },
        }}
        onClick={() => setOpened(!opened)}
      >
        <Heading variant="smallHeading" sx={{ fontWeight: 'semiBold', color: 'primary' }}>
          {question}
        </Heading>
        <Icon name={opened ? 'support_minus' : 'support_plus'} size="auto" width="21px" />
      </Flex>
      {opened && (
        <Box
          sx={{
            mb: 3,
            a: {
              color: 'primary',
              textDecoration: 'underline',
            },
          }}
        >
          <MDX>{answer}</MDX>
        </Box>
      )}
    </Box>
  )
}

function Navigation({ navigation }: { navigation: ContentNavigation[] }) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'center', flexDirection: ['column', 'row'] }}>
      {navigation.map(({ title, id }) => (
        <AppLink
          href={`/support#${id}`}
          key={id}
          sx={{
            mr: [0, 4],
            fontWeight: 'semiBold',
            color: 'primaryEmphasis',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              color: 'primary',
            },
            '&:before': {
              display: 'block',
              content: '""',
              position: 'absolute',
              width: '4px',
              height: '4px',
              bg: 'muted',
              right: -3,
              top: '50%',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            },
            '&:last-child': {
              mr: 0,
              '&:before': {
                display: ['block', 'none'],
              },
            },
          }}
        >
          {title}
        </AppLink>
      ))}
    </Flex>
  )
}

function SupportPage() {
  const {
    i18n: { language },
  } = useTranslation()

  const { title, navigation, sections, cantFind, contactLink } = currentContent.support.content[
    language || 'en'
  ] as ContentTypeSupport

  return (
    <Box sx={{ width: '100%' }}>
      <Heading variant="largeHeading" sx={{ textAlign: 'center', mb: 4 }}>
        {title}
      </Heading>
      <Navigation {...{ navigation }} />
      {sections.map(({ title, id, questions }) => (
        <Box key={id} sx={{ mt: 5, pt: 3 }} id={id}>
          <Heading variant="largeHeading" sx={{ mb: 4 }}>
            {title}
          </Heading>
          {questions.map((question, i) => (
            <Question {...{ ...question, key: i }} />
          ))}
        </Box>
      ))}
      <Box mt={6} mb={5} sx={{ textAlign: 'center' }}>
        {cantFind}
        <AppLink href="/contact" sx={{ color: 'primary', textDecoration: 'underline', ml: 1 }}>
          {contactLink}
        </AppLink>
      </Box>
    </Box>
  )
}

export default SupportPage

SupportPage.layout = MarketingLayout
SupportPage.layoutProps = {
  variant: 'termsContainer',
}
SupportPage.theme = 'Landing'
SupportPage.seoTags = (
  <PageSEOTags title="seo.support.title" description="seo.support.description" url="/support" />
)
