import Logger from '@/config/configErrorLogger'

export type Image = {
  id: string
  url: string
  title: string
}

export interface ImagesManager {
  getGifs: (keywords: string) => Promise<Image[]>
}

type GiphyGifObject = {
  id: string
  title: string
  images: {
    original: {
      url: string
    }
  }
}

type GiphyResponse = {
  data: GiphyGifObject[]
}

const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search'

export default function createImagesManager(apiKey?: string): ImagesManager {
  return {
    async getGifs(keywords: string): Promise<Image[]> {
      if (!apiKey) {
        const errorMessage = 'Giphy API key is missing'
        Logger.error(errorMessage)
        throw new Error(errorMessage)
      }

      try {
        const params = new URLSearchParams({
          api_key: apiKey,
          q: keywords,
          limit: '25',
          lang: 'en',
          rating: 'g',
        })

        const response = await fetch(`${GIPHY_API_URL}?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Giphy API returned status ${response.status}`)
        }

        const data = (await response.json()) as GiphyResponse

        return data.data.map((gif) => ({
          id: gif.id,
          url: gif.images.original.url,
          title: gif.title,
        }))
      } catch (error) {
        const errorMessage = `Failed to fetch GIFs from Giphy: ${String(error)}`
        Logger.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
  }
}
