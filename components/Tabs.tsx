// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Flex, Grid, SxStyleProp, Text } from 'theme-ui'

export interface Tab {
  label: any
  content?: any
}

export interface ProgressTabsProps {
  tabs: Tab[]
  step: number
  sx?: SxStyleProp
}

interface TabsNavProps extends WithChildren {
  sx?: SxStyleProp
}

export const TabsNav = ({ children, sx }: TabsNavProps) => (
  <Grid
    columns={children.length}
    sx={{
      width: '100%',
      bg: 'surface',
      borderRadius: 'round',
      border: 'light',
      borderColor: 'muted',
      gap: 0,
      ...sx,
    }}
  >
    {children}
  </Grid>
)

export const ProgressTabs = function ({ tabs, step, sx }: ProgressTabsProps) {
  return (
    <TabsNav sx={{ borderRadius: 'small', ...sx }}>
      {tabs.map((tab: Tab, index) => {
        return (
          <Flex key={index}>
            <Flex
              sx={{
                flexGrow: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text variant={index === step - 1 ? 'altBold' : 'text'} sx={{ fontSize: [2, 2, 3] }}>
                {tab.label}
              </Text>
            </Flex>
            {index < tabs.length - 1 && (
              <Icon size="auto" name="breadcrumb" height="53" width="12" />
            )}
          </Flex>
        )
      })}
    </TabsNav>
  )
}
