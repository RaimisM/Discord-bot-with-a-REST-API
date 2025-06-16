import 'dotenv/config'
import createApp from './app'
import createDatabase from './database'
import Logger from '@/config/configErrorLogger'
import { DATABASE_URL, GIPHY_API_KEY } from '@/config/config'
import createImagesManager from '@/modules/images/getImages'
import loadImages from '@/modules/images/loadImages'

const PORT = 3000

async function startServer() {
  try {
    const database = createDatabase(DATABASE_URL)
    const app = createApp(database)

    const imagesManager = createImagesManager(GIPHY_API_KEY)
    await loadImages(database, imagesManager, 'congratulation image')
    Logger.info('Images successfully loaded into the database')

    app.listen(PORT, () => {
      Logger.info(`Server is running at http://localhost:${PORT}`)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    Logger.error(`Server failed to start: ${message}`)
    process.exit(1)
  }
}

startServer()
