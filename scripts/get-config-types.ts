import dotenv from 'dotenv'
import { writeFile } from 'fs/promises'
import JsonToTS from 'json-to-ts'
import fetch from 'node-fetch'
dotenv.config({
  path: '.env',
})
dotenv.config({
  path: '.env.local',
})

const getConfig = async () => {
  const response = await fetch(process.env.CONFIG_URL as string)
  return await response.json()
}

const getInterfaces = (configObject: {}) => {
  try {
    return JsonToTS(configObject)
      .map((typeInterface) => {
        if (typeInterface.includes('RootObject')) {
          return typeInterface.replace('interface RootObject', 'export interface AppConfigType')
        }
        return typeInterface
      })
      .join('\n\n')
  } catch (error) {
    console.error(`Error generating config types: ${error}`)
    return ''
  }
}

const main = async () => {
  const config = await getConfig()
  const interfaces = getInterfaces(config)

  interfaces !== '' &&
    writeFile('types/config.ts', interfaces)
      .then(() => {
        console.info('Config types generated')
      })
      .catch((error) => {
        console.error(`Error generating config types: ${error}`)
      })
}

void main()
