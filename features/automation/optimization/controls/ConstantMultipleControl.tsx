import React from 'react'
import { ColorMode, Grid } from 'theme-ui'
import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleControlProps{}

export function ConstantMultipleControl({}: ConstantMultipleControlProps) {

    return (
        <Grid>
            <ConstantMultipleDetailsLayout/>
        </Grid>
    )
}