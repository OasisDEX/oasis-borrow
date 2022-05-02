import _ from 'lodash'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export type EarnTableHeaderVM = {
  label: string,
  tooltip: JSX.Element | string
}

function EarnTableHeader({ label, tooltip }: EarnTableHeaderVM) {
  return <Box>
    {label} ({tooltip})
  </Box>
}

function pad(count: number) {
  return Array(count).fill(<div/>)
}

export function EarnTable({ headerData, rows }: { headerData: EarnTableHeaderVM[], rows: JSX.Element[][] }) {
  // @ts-ignore
  const columnCount = Math.max(headerData.length, ...rows.map(row => row.length))
  console.log(columnCount)
  const paddedRows = rows.map(row => row.concat(pad(columnCount - row.length)))
  return <Grid sx={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)`}}>
    {headerData.map(headerVM => <EarnTableHeader {...headerVM} />)} {pad(columnCount - headerData.length)}
    {paddedRows.flat()}
  </Grid>
}