import { AppLink } from "components/Links";
import { WithChildren } from "helpers/types";
import { Trans, useTranslation } from "next-i18next";
import React, { useState } from "react";
import { Box, Heading } from "theme-ui";


function getHeadingId(text: string) {
  return text.replace(/ /g, "_").toLowerCase()
}

function isH2(markdownComponent: any) {
  return markdownComponent.props?.mdxType && markdownComponent.props.mdxType === 'h2'
}

export function FaqLayout({
  learnMoreUrl,
  children
}: { learnMoreUrl: string } & WithChildren) {
  const { t } = useTranslation()
  const [sectionId, setSectionId] = useState<string>()
  const childrenArray = React.Children.toArray(children)
  const anchors = childrenArray
    .filter(isH2)
    .map((child: any) => ({
      id: getHeadingId(child.props.children),
      text: child.props.children,
    }));
  
   // Divide markdown into sections delimited by headings
  const sections: Record<string, any[]> = {}
  for (let i = 0; i < childrenArray.length; i++) {
    const comp: any = childrenArray[i]
    if (isH2(comp)) {
      const id = getHeadingId(comp.props.children)
      sections[id] = []
      do {
        sections[id].push(childrenArray[i])
        i++
      } while(i < childrenArray.length && !isH2(childrenArray[i]))
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
        <Heading>{t('simulate-faq.learn-more-heading')}</Heading>
        <Box>
          <Trans
            i18nKey="simulate-faq.learn-more-body"
            components={[
              <AppLink href={learnMoreUrl} />,
              <AppLink href="https://discord.gg/oasisapp" />
            ]}
          />
        </Box>
      </Box>
    </Box>
  );
}