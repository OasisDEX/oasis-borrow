import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { WithArrow } from 'components/WithArrow'
import type { AjnaProduct } from 'features/ajna/common/types'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Image, Text } from 'theme-ui'

const LINKS_MAP: { [key in AjnaProduct]: string } = {
  borrow: EXTERNAL_LINKS.DOCS.AJNA.LIQUIDATIONS,
  multiply: EXTERNAL_LINKS.DOCS.AJNA.HUB,
  earn: EXTERNAL_LINKS.DOCS.AJNA.RISKS,
}

export function AjnaFormContentRisk() {
  const { t } = useTranslation()
  const {
    environment: { isOracless, product },
  } = useAjnaGeneralContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.common.form.risk.intro')}
      </Text>
      <ListWithIcon
        icon="checkmark"
        iconSize="14px"
        iconColor="primary100"
        items={[
          ...(isOracless
            ? t(`ajna.position-page.common.form.risk.bullet-points.oracless`, {
                returnObjects: true,
              })
            : []),
          ...t(`ajna.position-page.common.form.risk.bullet-points.${product}`, {
            returnObjects: true,
          }),
        ]}
        listStyle={{ mt: 2 }}
        components={{
          2: <AppLink href={EXTERNAL_LINKS.AJNA.AUDITS} sx={{ display: 'inline-block' }} />,
          3: <AppLink href={LINKS_MAP[product]} sx={{ display: 'inline-block' }} />,
          4: <WithArrow sx={{ fontWeight: 'regular', color: 'interactive100' }} />,
          5: <strong />,
        }}
      />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Image src={staticFilesRuntimeUrl('/static/img/ajna-risk-warning.svg')} />
      </Box>
    </>
  )
}
