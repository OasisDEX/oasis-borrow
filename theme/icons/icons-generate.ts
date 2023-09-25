import { writeFile } from 'fs/promises'
import { join } from 'path'

import { iconsTemp } from './icons-temp'

const saveIconsToFiles = async () => {
  const iconsList = Object.keys(iconsTemp)
    .map((key) => {
      return {
        name: key,
        content: iconsTemp[key as keyof typeof iconsTemp],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
  iconsList.forEach(({ name, content }) => {
    writeFile(
      join(__dirname, `./svg/${name}.tsx`),
      `
import React from 'react'
export const ${name} = {
  path: (${content.path.slice(1, -1)}),
  ${content.viewBox ? `viewBox: '${content.viewBox}',` : ''}
}`,
    )
      .then(() => {
        console.info(`Icon ${name} saved!`)
      })
      .catch((err) => {
        console.error(err)
      })
  })
}

void saveIconsToFiles()
