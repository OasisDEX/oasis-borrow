import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

import { DefinitionList, DefinitionListItem } from '../DefinitionList'
import { AppLink } from '../Links'
import { WithArrow } from '../WithArrow'

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
      <Heading variant="headerSettings" sx={{ mb: 3 }}>
        {t('vault-information')}
      </Heading>
      <DefinitionList>
        {items.map((item) => (
          <VaultInformationItem key={item.text} text={item.text} value={item.value} />
        ))}
      </DefinitionList>
      <AppLink href="https://kb.oasis.app/help">
        <WithArrow sx={{ color: 'interactive100', fontSize: 1, mt: 3 }}>
          {t('learn-more-at-oasis')}
        </WithArrow>
      </AppLink>
    </Card>
  )
}
