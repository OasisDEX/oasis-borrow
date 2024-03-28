import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { Modal } from 'components/Modal'
import { RefinanceHeader } from 'features/refinance/components/RefinanceHeader'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { RefinanceFormController } from 'features/refinance/controllers/RefinanceFormController'
import { RefinancePositionViewType } from 'features/refinance/types'
import { useModalContext } from 'helpers/modalHook'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'
import { Flex } from 'theme-ui'

export const RefinanceModal = () => {
  const { closeModal } = useModalContext()

  return (
    <Modal sx={{ margin: '0 auto' }} close={closeModal}>
      <Flex sx={{ flexDirection: 'column', m: 3, height: ['auto', '800px'] }}>
        <RefinanceHeader />
        {/* FOR NOW DUMMY CONTENT AND STYLING */}
        <Flex sx={{ gap: 3, flexWrap: 'wrap' }}>
          <RefinancePositionView
            type={RefinancePositionViewType.CURRENT}
            positionId={new BigNumber(18604)}
            primaryToken="ETH"
            secondaryToken="DAI"
            protocolData={{
              network: NetworkNames.ethereumMainnet,
              protocol: LendingProtocol.Maker,
            }}
            poolData={{
              maxLtv: new BigNumber(0.7),
              borrowRate: new BigNumber(0.0125),
            }}
            positionData={{
              ltv: new BigNumber(0.6),
              liquidationPrice: new BigNumber(743.34),
              collateral: new BigNumber(30),
              debt: new BigNumber(12000),
            }}
            automations={{
              stopLoss: { enabled: true },
              autoSell: { enabled: false },
              autoBuy: { enabled: false },
              takeProfit: { enabled: false },
            }}
          />
          <RefinanceFormController />
          {/*<RefinancePositionView type={RefinancePositionViewType.EMPTY} />*/}
          {/*<RefinanceAbout />*/}
        </Flex>
      </Flex>
    </Modal>
  )
}
