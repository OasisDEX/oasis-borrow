import React, { MouseEvent, ReactNode, useCallback, useState } from 'react'
import { Box, Button, Flex, Grid } from 'theme-ui'
import ReactSelect from 'react-select'
import { Icon } from '@makerdao/dai-ui-icons'

type ArrayWithAtLeastOne<T> = {
  0: T
} & Array<T>

type TabSwitcherTab = {
  tabLabel: string
  tabContent: ReactNode
}

export function TabSwitcher(props: { tabs: ArrayWithAtLeastOne<TabSwitcherTab> }) {
  const [selectedTab, setSelectedTab] = useState('0')

  const selectTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setSelectedTab((event.currentTarget.value as unknown) as string),
    [],
  )

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: ['block', 'none'],
          maxWidth: '343px',
          width: '100%',
        }}
      >
        <ReactSelect
          value={{
            value: parseInt(selectedTab),
            label: props.tabs[parseInt(selectedTab)].tabLabel,
          }}
          options={props.tabs.map(({ tabLabel }, index) => ({ label: tabLabel, value: index }))}
          onChange={(option) =>
            option && 'value' in option && setSelectedTab(option.value.toString())
          }
          styles={{
            container: (base) => ({
              ...base,
              maxWidth: '343px',
              width: '100%',
            }),
          }}
          components={{
            IndicatorsContainer: ({ selectProps: { menuIsOpen } }) => (
              <Flex
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  mr: 3,
                  transform: `rotate(${menuIsOpen ? '180deg' : 0})`,
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <Icon name="chevron" />
              </Flex>
            ),
            Control: ({ children, innerProps }) => (
              <Flex
                sx={{
                  border: 'light',
                  px: 2,
                  py: 3,
                  borderRadius: 'medium',
                  cursor: 'pointer',
                  background: 'white',
                }}
                {...innerProps}
              >
                {children}
              </Flex>
            ),
          }}
        />
      </Box>
      <Grid columns={props.tabs.length} variant="tabSwitcher" sx={{ display: ['none', 'block'] }}>
        {props.tabs.map(({ tabLabel }, index) => {
          return (
            <Button
              key={index}
              onClick={selectTab}
              value={index}
              variant={
                selectedTab === index.toString() ? 'tabSwitcherTabActive' : 'tabSwitcherTabInactive'
              }
            >
              {tabLabel}
            </Button>
          )
        })}
      </Grid>
      {props.tabs[parseInt(selectedTab)].tabContent}
    </Flex>
  )
}
