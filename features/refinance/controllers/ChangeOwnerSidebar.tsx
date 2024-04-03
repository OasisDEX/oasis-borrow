import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Text } from 'theme-ui'

interface ChangeOwnerSidebarProps {
  textButtonAction: () => void
  onEverythingReady: () => void
}

export const ChangeOwnerSidebar: FC<ChangeOwnerSidebarProps> = ({
  textButtonAction,
  onEverythingReady,
}) => {
  const { t } = useTranslation()
  // dummy for now, use tx manger from context eventually
  const [isTxInProgress, setTxIsProgress] = useState(false)
  const [isTxSuccess] = useState(true)

  const handleAction = () => {
    if (isTxSuccess) {
      onEverythingReady()
    }

    setTxIsProgress(true)
  }

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.allowance-form.title'),
    content: (
      <Grid gap={3}>
        <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
          {t('migrate.allowance-form.description')}
        </Text>
      </Grid>
    ),
    primaryButton: {
      isLoading: isTxInProgress,
      disabled: isTxInProgress,
      label: t('approve-allowance'),
      action: handleAction,
    },
    textButton: {
      label: t('go-back'),
      action: textButtonAction,
      hidden: isTxInProgress,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
