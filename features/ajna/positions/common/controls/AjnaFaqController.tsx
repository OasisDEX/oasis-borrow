import { DetailsSection } from 'components/DetailsSection'
import { ContentType, TranslatedContent } from 'features/content'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

interface AjnaFaqControllerProps {
  content: ContentType
}

export const AjnaFaqController: FC<AjnaFaqControllerProps> = ({ content }) => {
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
