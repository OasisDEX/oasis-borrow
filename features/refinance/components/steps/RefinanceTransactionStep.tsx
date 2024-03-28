import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Image, Text } from 'theme-ui'

const linkProps = { fontSize: 'inherit', color: 'interactive100' }

export const RefinanceTransactionStep = () => {
  const { t } = useTranslation()

  const isTxSuccess = true

  const oldIdLink = '/'
  const newIdLink = '/'

  if (isTxSuccess) {
    return (
      <>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          <Trans
            i18nKey="refinance.sidebar.transaction.description.success"
            shouldUnescape
            components={{
              1: <AppLink sx={linkProps} href={oldIdLink} />,
              2: <AppLink sx={linkProps} href={newIdLink} />,
            }}
            values={{
              oldId: 12345,
              newId: 54321,
            }}
          />
          <Flex sx={{ justifyContent: 'center', mt: 3 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/refinance-tx.svg')} />
          </Flex>
        </Text>
      </>
    )
  }

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('refinance.sidebar.transaction.description.in-progress')}
        <Flex sx={{ justifyContent: 'center', mt: 3 }}>
          <Image src={staticFilesRuntimeUrl('/static/img/refinance-tx.svg')} />
        </Flex>
      </Text>
    </>
  )
}
