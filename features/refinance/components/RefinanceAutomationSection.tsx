import { PortfolioPositionAutomationIcons } from 'components/portfolio/positions/PortfolioPositionAutomationIcons'
import { VaultTabTag } from 'components/vault/VaultTabTag'
import type { PortfolioPositionAutomations } from 'handlers/portfolio/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface RefinanceAutomationSectionProps {
  automations: PortfolioPositionAutomations
  withFooter: boolean
}

export const RefinanceAutomationSection: FC<RefinanceAutomationSectionProps> = ({
  automations,
  withFooter,
}) => {
  const { t } = useTranslation()

  const isEnabled = Object.values(automations).some((item) => item.enabled)

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Text as="h3" sx={{ fontWeight: 'semiBold', fontSize: 2 }}>
          {t('system.automations')}
        </Text>
        <VaultTabTag isEnabled={isEnabled} />
      </Flex>
      <Flex sx={{ gap: 3 }}>
        <PortfolioPositionAutomationIcons automations={automations} iconNotActiveBg="white" />
      </Flex>
      {withFooter && (
        <Text as="p" sx={{ fontWeight: 'semiBold', fontSize: 1, mt: 3, color: 'neutral80' }}>
          {t('refinance.position.footer.canceled-automation')}
        </Text>
      )}
    </Flex>
  )
}
