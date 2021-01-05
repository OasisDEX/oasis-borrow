import { configure, addDecorator } from '@storybook/react'
import themeDecorator from './ThemeDecorator'
import RouterDecorator from './RouterDecorator'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import { setConfig } from 'next/config'
import Router from 'next/router'

Router.router = {
  push: () => {},
  prefetch: () => {},
}

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: true,
})

// Set the NextJS publicRuntimeConfig property
const { API_HOST } = process.env

setConfig({
  publicRuntimeConfig: {
    apiHost: API_HOST,
  },
})

addDecorator((storyFn) => <I18nextProvider i18n={i18n}>{storyFn()}</I18nextProvider>)

// add theme decorator to all stories
addDecorator(themeDecorator)
addDecorator(RouterDecorator)

// automatically import all files from directory stories ending in *.stories.tsx
configure(require.context('..', true, /\.stories\.tsx?$/), module)
