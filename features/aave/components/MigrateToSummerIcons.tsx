import type { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import logoCircle from 'public/static/img/logos/circle_color.svg'
import migrateArrows from 'public/static/img/migrate_arrows.svg'
import React from 'react'
import { Flex, Image } from 'theme-ui'

const imageSize = '86px'
const arrowsSize = '66px'

export const MigrateToSummerIcons = ({ fromProtocol }: { fromProtocol: LendingProtocol }) => (
  <Flex sx={{ flexDirection: 'row', justifyContent: 'center' }}>
    <Image
      sx={{ width: imageSize, height: 'auto', mx: 2, my: 4 }}
      src={lendingProtocolsByName[fromProtocol].icon}
    />
    <Image sx={{ width: arrowsSize, height: 'auto', mx: 3, my: 4 }} src={migrateArrows} />
    <Image sx={{ width: imageSize, height: 'auto', mx: 2, my: 4 }} src={logoCircle} />
  </Flex>
)
