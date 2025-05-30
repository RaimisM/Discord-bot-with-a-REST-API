import Logger from './configErrorLogger'

const {
  DATABASE_URL,
  DISCORD_TOKEN_ID,
  DISCORD_CHANNEL_ID,
  GIPHY_API_KEY,
  NODE_ENV,
} = process.env as {
  DATABASE_URL?: string
  DISCORD_TOKEN_ID?: string
  DISCORD_CHANNEL_ID?: string
  GIPHY_API_KEY?: string
  NODE_ENV?: string
}

function validateEnv(): void {
  const missingKeys = []

  if (!DATABASE_URL) missingKeys.push('DATABASE_URL')
  if (!DISCORD_TOKEN_ID) missingKeys.push('DISCORD_TOKEN_ID')
  if (!DISCORD_CHANNEL_ID) missingKeys.push('DISCORD_CHANNEL_ID')
  if (!GIPHY_API_KEY) missingKeys.push('GIPHY_API_KEY')

  if (missingKeys.length > 0) {
    Logger.error(`Missing environment variables information: ${missingKeys.join(', ')}`)
    process.exit(1)
  }
}

if (NODE_ENV !== 'test') {
  validateEnv()
}

export {
  DATABASE_URL,
  DISCORD_TOKEN_ID,
  DISCORD_CHANNEL_ID,
  GIPHY_API_KEY,
}
