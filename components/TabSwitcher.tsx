import { Icon } from '@makerdao/dai-ui-icons'
import React, { MouseEvent, ReactNode, useState } from 'react'
import ReactSelect from 'react-select'
import { Box, Button, Flex, Grid, SxStyleProp } from 'theme-ui'

import { slideInAnimation } from '../theme/animations'

export type TabSwitcherTab = {
  tabLabel: string
  tabContent: ReactNode
  tabHeaderPara?: ReactNode // Positioned above tabs
}

const WideTabSelector = (props: {
  tabs: TabSwitcherTab[]
  wideTabsSx: SxStyleProp
  selectedTab: string
  selectTab: (event: MouseEvent<HTMLButtonElement>) => void
}) => {
  return (
    <Grid columns={props.tabs.length} variant="tabSwitcher" sx={props.wideTabsSx}>
      {props.tabs.map(({ tabLabel }, index) => {
        return (
          <Button
            key={tabLabel}
            onClick={props.selectTab}
            value={index}
            variant={
              props.selectedTab === index.toString()
                ? 'tabSwitcherTabActive'
                : 'tabSwitcherTabInactive'
            }
          >
            {tabLabel}
          </Button>
        )
      })}
    </Grid>
  )
}

const NarrowTabSelector = (props: {
  narrowTabsSx: SxStyleProp
  selectedTab: string
  tabs: TabSwitcherTab[]
  setSelectedTab: (tab: string) => void
}) => {
  return (
    <Box sx={props.narrowTabsSx}>
      <ReactSelect
        value={{
          value: parseInt(props.selectedTab),
          label: props.tabs[parseInt(props.selectedTab)].tabLabel,
        }}
        options={props.tabs.map(({ tabLabel }, index) => ({ label: tabLabel, value: index }))}
        onChange={(option) =>
          option && 'value' in option && props.setSelectedTab(option.value.toString())
        }
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
              <Icon name="chevron_down" />
            </Flex>
          ),
          Control: ({ children, innerProps }) => (
            <Flex
              sx={{
                border: 'light',
                px: 2,
                py: 2,
                borderRadius: 'medium',
                cursor: 'pointer',
                background: 'white',
                fontWeight: 'semiBold',
              }}
              {...innerProps}
            >
              {children}
            </Flex>
          ),
        }}
      />
    </Box>
  )
}

export function TabSwitcher(props: {
  tabs: TabSwitcherTab[]
  narrowTabsSx: SxStyleProp
  wideTabsSx: SxStyleProp
}) {
  const [selectedTab, setSelectedTab] = useState('0')

  const selectTab = (event: MouseEvent<HTMLButtonElement>) => {
    const nextTab = (event.currentTarget.value as unknown) as string
    setSelectedTab(nextTab)
  }

  const isEmpty = !props.tabs.length
  const isOneTab = props.tabs.length === 1

  return !isEmpty ? (
    <>
      {props.tabs
        .filter(({ tabLabel }) => tabLabel === props.tabs[parseInt(selectedTab)].tabLabel)
        .map(({ tabHeaderPara, tabLabel, tabContent }) => (
          <Flex
            key={`${tabLabel}-`}
            sx={{
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box key={tabLabel}>{tabHeaderPara}</Box>
            {!isOneTab && (
              <>
                <NarrowTabSelector
                  selectedTab={selectedTab}
                  tabs={props.tabs}
                  setSelectedTab={setSelectedTab}
                  narrowTabsSx={props.narrowTabsSx}
                />
                <WideTabSelector
                  wideTabsSx={props.wideTabsSx}
                  selectTab={selectTab}
                  selectedTab={selectedTab}
                  tabs={props.tabs}
                />
              </>
            )}
            <Box
              key={tabLabel}
              sx={{
                ...slideInAnimation,
                width: '100%',
              }}
            >
              {tabContent}
            </Box>
          </Flex>
        ))}
    </>
  ) : null
}
