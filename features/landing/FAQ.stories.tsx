import React from 'react'
import { FAQ as FAQComponent } from './LandingView'
import { Router } from 'next/router'

export const FAQ = () => (
    <FAQComponent />
)

// eslint-disable-next-line import/no-default-export
export default {
    title: 'Landing',
}
