import { AppLink } from "components/Links";
import { WithChildren } from "helpers/types";
import { Trans, useTranslation } from "next-i18next";
import React, { useState } from "react";
import { Box, Text } from "theme-ui";


function getHeadingId(text: string) {
  return text.replace(/ /g, "_").toLowerCase()
}

function isHeading(markdownComponent: any) {
  return markdownComponent.props?.mdxType && markdownComponent.props.mdxType === 'h5'
}

export function FaqLayout({
  learnMoreUrl,
  children
}: { learnMoreUrl: string } & WithChildren) {
  const { t } = useTranslation()
  const [sectionId, setSectionId] = useState<string>()
  const childrenArray = React.Children.toArray(children)
  const anchors = childrenArray
    .filter(isHeading)
    .map((child: any) => ({
      id: getHeadingId(child.props.children),
      text: child.props.children,
    }));
  
   // Divide markdown into sections delimited by headings
  const sections: Record<string, any[]> = {}
  for (let i = 0; i < childrenArray.length; i++) {
    const comp: any = childrenArray[i]
    if (isHeading(comp)) {
      const id = getHeadingId(comp.props.children)
      sections[id] = []
      do {
        sections[id].push(childrenArray[i])
        i++
      } while(i < childrenArray.length && !isHeading(childrenArray[i]))
      i--
    }
  }

  const quoteColors = ['bull', 'link', 'primaryEmphasis']
  const quoteColorsSx = quoteColors.reduce(function(obj: any, color, index) {
    obj[`:nth-of-type(${quoteColors.length}n-${quoteColors.length - index - 1})`] = {borderColor: color}
    return obj;
   }, {})

  return (
    <Box>
      <Text variant="heading5">{t('simulate-faq.contents')}</Text>
      <ul>
        {anchors.map(anchor => <li><a onClick={() => setSectionId(anchor.id)}>{anchor.text}</a></li>)}
      </ul>
      <Box sx={{ blockquote: {
        borderLeft: '5px solid',
        ...quoteColorsSx
      }}}>
        {sectionId ? sections[sectionId] : Object.values(sections)[0]}
      </Box>
      <Box>
        <Text variant="paragraph3" sx={{ fontWeight: 'bold' }}>{t('simulate-faq.learn-more-heading')}</Text>
        <Box>
          <Text variant="paragraph3">
            <Trans
              i18nKey="simulate-faq.learn-more-body"
              components={[
                <AppLink href={learnMoreUrl} />,
                <AppLink href="https://discord.gg/oasisapp" />
              ]}
            />
          </Text>
        </Box>
      </Box>
    </Box>
  );
}