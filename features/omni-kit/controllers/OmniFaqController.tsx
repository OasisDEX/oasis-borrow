import { DetailsSection } from 'components/DetailsSection'
import type { ContentType } from 'features/content'
import { TranslatedContent } from 'features/content'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

interface OmniFaqControllerProps {
  content: ContentType
}

export const OmniFaqController: FC<OmniFaqControllerProps> = ({ content }) => {
  const { t } = useTranslation()

  return (
    <Grid variant="vaultContainer">
      <DetailsSection
        title={t('simulate-faq.contents')}
        content={<TranslatedContent content={content} />}
      />
    </Grid>
  )
}
