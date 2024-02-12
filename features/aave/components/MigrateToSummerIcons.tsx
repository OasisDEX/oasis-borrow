import { Icon } from 'components/Icon'
import type { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import logoCircle from 'public/static/img/logos/circle_color.svg'
import migrateArrows from 'public/static/img/migrate_arrows.svg'
import React from 'react'
import { tick_circle } from 'theme/icons'
import { Box, Flex, Image } from 'theme-ui'

const imageSize = '86px'
const arrowsSize = '66px'

export const MigrateToSummerIcons = ({
  fromProtocol,
  success = false,
}: {
  fromProtocol: LendingProtocol
  success?: boolean
}) => (
  <Flex sx={{ flexDirection: 'row', justifyContent: 'center' }}>
    <Image
      sx={{ width: imageSize, height: 'auto', mx: 2, my: 4 }}
      src={lendingProtocolsByName[fromProtocol].icon}
    />
    <Image sx={{ width: arrowsSize, height: 'auto', mx: 3, my: 4 }} src={migrateArrows} />
    <Box sx={{ position: 'relative', mx: 2, my: 4 }}>
      <Image sx={{ width: imageSize, height: 'auto' }} src={logoCircle} />
      {success && (
        <Icon
          icon={tick_circle}
          size={'35px'}
          sx={{ position: 'absolute', right: '-2px', bottom: '-2px' }}
          color="#FB855C"
        />
      )}
    </Box>
  </Flex>
)
