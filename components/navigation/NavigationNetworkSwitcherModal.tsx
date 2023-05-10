import { networks, networksByName } from 'blockchain/networksConfig'
import { Modal } from 'components/Modal'
import {
  CustomHardhatParameterFieldsType,
  CustomHardhatParameterType,
  mainnetNetworkParameter,
  useCustomHardhatParameter,
  useCustomNetworkParameter,
} from 'helpers/getCustomNetworkParameter'
import { ModalProps } from 'helpers/modalHook'
import { NetworkNames } from 'helpers/networkNames'
import React from 'react'
import { Box, Button, Flex, Image, Input, Text } from 'theme-ui'

export function NavigationNetworkSwitcherModal({ close }: ModalProps<{}>) {
  const [, setCustomNetwork] = useCustomNetworkParameter()
  const [hardhatSettings, setHardhatSettings] = useCustomHardhatParameter()
  const handleHardhatUpdate =
    (field: CustomHardhatParameterFieldsType) =>
    (networkName: NetworkNames) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setHardhatSettings({
        ...hardhatSettings,
        [networkName]: {
          ...hardhatSettings[networkName],
          [field]: event.target.value,
        },
      })
    }
  return (
    <Modal close={close} sx={{ maxWidth: '570px', margin: '0 auto' }}>
      <Box sx={{ p: 3 }}>
        <Text as="h2">👷‍♂️ Hardhat settings</Text>
      </Box>
      <Box sx={{ px: 3 }}>
        {networks
          .filter((network) => !network.testnet)
          .map((network, networkIndex) => {
            return (
              <Flex key={network.hexId}>
                <Flex
                  sx={{
                    height: '50px',
                    width: '120px',
                    ml: '15px',
                    mr: '-135px',
                    alignItems: 'center',
                    borderRight: '1px solid',
                    borderColor: 'neutral20',
                  }}
                >
                  <Image
                    src={networksByName[network.name].icon}
                    sx={{ width: '22px', height: '22px', mr: 3 }}
                  />
                  <Text sx={{ display: 'block' }}>{network.label}</Text>
                </Flex>
                <Input
                  type="text"
                  placeholder={`http://localhost:854${5 + networkIndex}`}
                  onChange={handleHardhatUpdate('url')(network.name)}
                  value={(hardhatSettings[network.name] && hardhatSettings[network.name].url) || ''}
                  sx={{
                    height: '50px',
                    fontSize: 3,
                    color: 'primary100',
                    borderColor: 'neutral20',
                    '::placeholder': {
                      opacity: 0.3,
                    },
                    p: 2,
                    mb: 2,
                    pl: '150px',
                    width: 'auto',
                  }}
                />
                <Input
                  type="text"
                  placeholder={`${2137 + networkIndex}`}
                  onChange={handleHardhatUpdate('id')(network.name)}
                  value={(hardhatSettings[network.name] && hardhatSettings[network.name].id) || ''}
                  sx={{
                    height: '50px',
                    fontSize: 3,
                    color: 'primary100',
                    borderColor: 'neutral20',
                    '::placeholder': {
                      opacity: 0.3,
                    },
                    p: 2,
                    mb: 2,
                    width: 'auto',
                  }}
                />
              </Flex>
            )
          })}
        <Flex sx={{ my: 3 }}>
          <Button
            variant="secondary"
            sx={{ width: '100%', mr: 2 }}
            onClick={() => {
              setHardhatSettings({} as CustomHardhatParameterType)
              setCustomNetwork(mainnetNetworkParameter)
              window.location.reload()
            }}
          >
            reset
          </Button>
          <Button
            variant="primary"
            sx={{ width: '100%', ml: 2 }}
            onClick={() => {
              window.location.reload()
            }}
          >
            save
          </Button>
        </Flex>
      </Box>
    </Modal>
  )
}
