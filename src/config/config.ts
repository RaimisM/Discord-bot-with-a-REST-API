import Logger from './configErrorLogger'

interface Config {
  DATABASE_URL: string
  DISCORD_TOKEN_ID: string
  DISCORD_CHANNEL_ID: string
  GIPHY_API_KEY: string
}

function validateEnv(): Config {
  const {
    DATABASE_URL,
    DISCORD_TOKEN_ID,
    DISCORD_CHANNEL_ID,
    GIPHY_API_KEY,
  } = process.env

  const missingKeys: string[] = []

  if (!DATABASE_URL) missingKeys.push('DATABASE_URL')
  if (!DISCORD_TOKEN_ID) missingKeys.push('DISCORD_TOKEN_ID')
  if (!DISCORD_CHANNEL_ID) missingKeys.push('DISCORD_CHANNEL_ID')
  if (!GIPHY_API_KEY) missingKeys.push('GIPHY_API_KEY')

  if (missingKeys.length > 0) {
    Logger.error(
      `Missing environment variables information: ${missingKeys.join(', ')}`
    )
    process.exit(1)
  }

  return {
    DATABASE_URL: DATABASE_URL!,
    DISCORD_TOKEN_ID: DISCORD_TOKEN_ID!,
    DISCORD_CHANNEL_ID: DISCORD_CHANNEL_ID!,
    GIPHY_API_KEY: GIPHY_API_KEY!,
  }
}

const config = process.env.NODE_ENV !== 'test' ? validateEnv() : ({} as Config)
export const { DATABASE_URL, DISCORD_TOKEN_ID, DISCORD_CHANNEL_ID, GIPHY_API_KEY } = config