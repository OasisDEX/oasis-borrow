import { ActionPills } from 'components/ActionPills'
import { DetailsSection } from 'components/DetailsSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { TriggersAaveEvent } from 'features/aave/manage/state'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Flex, Grid, Image, Text } from 'theme-ui'
import type { Sender } from 'xstate'

export const AaveStopLossSelector = ({
  sendTriggerEvent,
}: {
  sendTriggerEvent: Sender<TriggersAaveEvent>
}) => {
  const { t } = useTranslation()
  const [selectedStopLossType, setSelectedStopLossType] = useState<
    'stop-loss' | 'trailing-stop-loss'
  >('trailing-stop-loss')
  const stopLossLabelMap = {
    'stop-loss': t('protection.stop-loss-type-select.regular-stop-loss'),
    'trailing-stop-loss': t('protection.stop-loss-type-select.trailing-stop-loss'),
  }
  return (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <Grid variant="vaultContainer">
        <Grid gap={3} mb={[0, 5]}>
          <DetailsSection
            title={'Stop-Loss Types'}
            content={
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="boldParagraph3" sx={{ mb: 2 }}>
                  {t('protection.stop-loss-type-select.regular-stop-loss')}
                </Text>
                <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                  {t('protection.stop-loss-type-select.regular-stop-loss-description')}
                </Text>
                <Box variant="boxes.separator" sx={{ my: 3 }} />
                <Text variant="boldParagraph3" sx={{ mb: 2 }}>
                  {t('protection.stop-loss-type-select.trailing-stop-loss')}
                </Text>
                <Text variant="paragraph3" sx={{ color: 'neutral80', mb: 4 }}>
                  {t('protection.stop-loss-type-select.trailing-stop-loss-description')}
                </Text>
                <Image
                  sx={{ width: '90%', margin: '0 auto' }}
                  src={staticFilesRuntimeUrl('/static/img/trailing-stop-loss-graph.svg')}
                />
              </Flex>
            }
          />
        </Grid>
        <SidebarSection
          title={t('protection.stop-loss-type-select.sidebar-title')}
          content={
            <Box>
              <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                {t('protection.stop-loss-type-select.sidebar-description')}
              </Text>
              <ActionPills
                active={selectedStopLossType}
                items={[
                  {
                    id: 'stop-loss',
                    action: () => setSelectedStopLossType('stop-loss'),
                    label: stopLossLabelMap['stop-loss'],
                  },
                  {
                    id: 'trailing-stop-loss',
                    action: () => setSelectedStopLossType('trailing-stop-loss'),
                    label: stopLossLabelMap['trailing-stop-loss'],
                  },
                ]}
                wrapperSx={{
                  width: '90%',
                  mt: 3,
                  mx: 'auto',
                  flexDirection: 'column',
                }}
                itemSx={{
                  my: 2,
                }}
                itemButtonSx={{
                  width: '100%',
                  boxShadow: 'inset 0 0 3px rgba(96,96,96,0.3)',
                  borderRadius: 'mediumLarge',
                }}
              />
            </Box>
          }
          primaryButton={{
            label: `Add ${stopLossLabelMap[selectedStopLossType]}`,
            action: () => sendTriggerEvent({ type: 'CHANGE_VIEW', view: selectedStopLossType }),
          }}
        />
      </Grid>
    </Container>
  )
}
