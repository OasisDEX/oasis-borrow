import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { WithChildren } from 'helpers/types/With.types'
import { Trans, useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import React, { useState } from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Box, Grid, Link, Text } from 'theme-ui'

function getHeadingId(text: string) {
  return text.replace(/ /g, '_').toLowerCase()
}

function isHeading(markdownComponent: any) {
  return markdownComponent.props?.mdxType && markdownComponent.props.mdxType === 'h5'
}

export function FaqLayout({
  noTitle = false,
  learnMoreUrl,
  children,
}: { noTitle?: boolean; learnMoreUrl: string } & WithChildren) {
  const { t } = useTranslation()
  const childrenArray = React.Children.toArray(children)
  const anchors = childrenArray.filter(isHeading).map((child: any) => ({
    id: getHeadingId(child.props.children),
    text: child.props.children,
  }))
  const [sectionId, setSectionId] = useState<string>(anchors[0].id)

  // Divide markdown into sections delimited by headings
  const sections: Record<string, React.ReactNode[]> = {}
  for (let i = 0; i < childrenArray.length; i++) {
    const comp = childrenArray[i]
    if (isHeading(comp)) {
      const id = getHeadingId((comp as ReactElement).props.children)
      sections[id] = []
      do {
        sections[id].push(childrenArray[i])
        i++
      } while (i < childrenArray.length && !isHeading(childrenArray[i]))
      i--
    }
  }

  const quoteColors = ['success100', 'interactive100', 'primary60']
  const quoteColorsSx = quoteColors.reduce((obj: Record<string, SxStyleProp>, color, index) => {
    obj[`:nth-of-type(${quoteColors.length}n-${quoteColors.length - index - 1})`] = {
      borderColor: color,
    }
    return obj
  }, {})

  return (
    <Box>
      {!noTitle && (
        <Text variant="header5" sx={{ mb: 4 }}>
          {t('system.faq')}
        </Text>
      )}
      <Grid sx={{ py: 1 }}>
        {anchors.map((anchor) => (
          <Link
            key={anchor.id}
            variant="nav"
            sx={{
              '&, &:hover': { color: sectionId === anchor.id ? 'primary100' : 'primary60' },
              fontSize: '12px',
            }}
            onClick={() => setSectionId(anchor.id)}
          >
            {anchor.text}
          </Link>
        ))}
      </Grid>
      <Box variant="separator" sx={{ my: 4 }} />
      <Box
        sx={{
          blockquote: {
            m: 0,
            pl: 4,
            py: 3,
            p: {
              my: 0,
            },
            borderLeft: '8px solid',
            ...quoteColorsSx,
          },
          fontSize: 2,
          pr: [0, 4],
        }}
      >
        {sections[sectionId]}
      </Box>
      <Box sx={{ borderRadius: 'mediumLarge', bg: 'neutral30', p: 3, mt: 4 }}>
        <Box sx={{ maxWidth: '455px' }}>
          <Text variant="paragraph3" sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('simulate-faq.learn-more-heading')}
          </Text>
          <Box>
            <Text variant="paragraph3" sx={{ a: { fontWeight: 'normal' } }}>
              <Trans
                i18nKey="simulate-faq.learn-more-body"
                components={[
                  <AppLink href={learnMoreUrl} />,
                  <AppLink href={EXTERNAL_LINKS.DISCORD} />,
                ]}
              />
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
