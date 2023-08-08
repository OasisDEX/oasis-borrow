import { Icon } from '@makerdao/dai-ui-icons'
import {
  CustomForkParameterFieldsType,
  CustomForkParameterType,
  useCustomForkParameter,
} from 'blockchain/networks'
import { NetworkNames } from 'blockchain/networks'
import { networks, networksByName } from 'blockchain/networks'
import { Modal } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import React from 'react'
import { Box, Button, Flex, IconButton, Image, Input, Text } from 'theme-ui'

export function NavigationNetworkSwitcherModal({ close: _close }: ModalProps<{}>) {
  const [forkSettings, setForkSettings] = useCustomForkParameter()
  const handleForkUpdate =
    (field: CustomForkParameterFieldsType) =>
    (networkName: NetworkNames) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForkSettings({
        ...forkSettings,
        [networkName]: {
          ...forkSettings[networkName],
          [field]: event.target.value,
        },
      })
    }
  const removeForkNetwork = (networkName: NetworkNames) => () => {
    const { [networkName]: _, ...rest } = forkSettings
    setForkSettings(rest as CustomForkParameterType)
  }
  const saveAndReset = () => {
    window && window.location.reload() // duh
  }
  const closeProxy = () => {
    saveAndReset()
  }
  return (
    <Modal close={closeProxy} sx={{ maxWidth: '570px', margin: '0 auto' }}>
      <Box sx={{ p: 3 }}>
        <Text as="h2">👷‍♂️ Fork network settings</Text>
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
                  onChange={handleForkUpdate('url')(network.name)}
                  value={forkSettings[network.name]?.url || ''}
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
                    mr: 2,
                    pl: '150px',
                    width: '80%',
                  }}
                />
                <Input
                  type="text"
                  placeholder={`${2137 + networkIndex}`}
                  onChange={handleForkUpdate('id')(network.name)}
                  value={forkSettings[network.name]?.id || ''}
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
                    width: '70px',
                  }}
                />
                <IconButton
                  onClick={removeForkNetwork(network.name)}
                  sx={{
                    cursor: 'pointer',
                    color: 'neutral60',
                    mt: 2,
                    '&:hover': {
                      color: 'primary100',
                    },
                  }}
                >
                  <Icon name="close_squared" size={14} />
                </IconButton>
              </Flex>
            )
          })}
        <Flex sx={{ my: 3, mb: 4 }}>
          <Text variant="paragraph3">
            Saving or closing this window will reset your current network parameter to Ethereum to
            avoid the situation where you have a custom network parameter (fork) which is no longer
            in the config. This is for your own good.
          </Text>
        </Flex>
        <Flex sx={{ my: 3 }}>
          <Button
            variant="secondary"
            sx={{ width: '100%', mr: 2 }}
            onClick={() => {
              setForkSettings({} as CustomForkParameterType)
              saveAndReset()
            }}
          >
            reset
          </Button>
          <Button
            variant="primary"
            sx={{ width: '100%', ml: 2 }}
            onClick={() => {
              saveAndReset()
            }}
          >
            save
          </Button>
        </Flex>
      </Box>
    </Modal>
  )
}
