import { DetailsSection } from 'components/DetailsSection'
import type { ContentType } from 'features/content'
import { TranslatedContent } from 'features/content'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

interface AjnaFaqControllerProps {
  content: ContentType
}

// TODO IMO content should be imported or taken from metadata
export const OmniFaqController: FC<AjnaFaqControllerProps> = ({ content }) => {
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
