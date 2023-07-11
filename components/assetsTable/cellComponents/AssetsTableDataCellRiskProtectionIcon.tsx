import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex } from 'theme-ui'

interface AssetsTableDataRiskProtectionIconProps {
  isOwner?: boolean
  level: number
  link: string
}

export function AssetsTableDataCellRiskProtectionIcon({
  isOwner,
  level,
}: AssetsTableDataRiskProtectionIconProps) {
  const { t } = useTranslation()

  return level > 0 ? (
    <Flex
      sx={{
        justifyContent: 'flex-end',
      }}
    >
      <Button
        variant="action"
        sx={{
          pointerEvents: 'none',
          backgroundColor: 'success100',
          borderRadius: 'round',
          color: 'transparent', // text is hidden, its only needed to set width and height
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {
          // all of this is just to have the button as same width as all of the other buttons
          isOwner ? t('discover.table.activate') : t('discover.table.inactive')
        }
        <Icon
          name="stop_loss_active"
          size={38}
          sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </Button>
    </Flex>
  ) : (
    <Button
      variant="action"
      sx={{
        pointerEvents: 'none',
      }}
    >
      {isOwner ? t('discover.table.activate') : t('discover.table.inactive')}
    </Button>
  )
}
