import { writeFile } from 'fs/promises'

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
    writeFile(`./svg/${name}.svg`, content)
      .then(() => {
        console.log(`Icon ${name} saved!`)
      })
      .catch((err) => {
        console.error(err)
      })
  })
}

saveIconsToFiles()
