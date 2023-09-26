import type { BigNumber } from 'bignumber.js'
import { DefinitionList, DefinitionListItem } from 'components/DefinitionList'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface VaultInformationItemProps {
  text: string
  value: string | BigNumber
}

function VaultInformationItem({ text, value }: VaultInformationItemProps) {
  return (
    <DefinitionListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text as="span" sx={{ color: 'neutral80' }}>
        {text}
      </Text>
      <Text as="span" sx={{ color: 'primary100' }}>
        {value}
      </Text>
    </DefinitionListItem>
  )
}

interface VaultInformationProps {
  items: { text: string; value: string | BigNumber }[]
}

export function VaultInformation({ items }: VaultInformationProps) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        p: 4,
        border: 'lightMuted',
      }}
    >
      <Heading as="h4" variant="header4" sx={{ mb: 3 }}>
        {t('vault-information')}
      </Heading>
      <DefinitionList>
        {items.map((item) => (
          <VaultInformationItem key={item.text} text={item.text} value={item.value} />
        ))}
      </DefinitionList>
      <AppLink href={EXTERNAL_LINKS.KB.HELP}>
        <WithArrow sx={{ color: 'interactive100', fontSize: 1, mt: 3 }}>
          {t('learn-more-at-oasis')}
        </WithArrow>
      </AppLink>
    </Card>
  )
}
