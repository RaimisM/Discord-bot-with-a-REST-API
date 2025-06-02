import Logger from '@/config/configErrorLogger'

export type Image = {
  id: string
  url: string
  title: string
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

export default function createImagesManager(apiKey?: string) {
  return {
    async fetchGifs(query: string): Promise<Image[]> {
      if (!apiKey) {
        const errorMessage = 'Giphy API key is missing'
        Logger.error(errorMessage)
        throw new Error(errorMessage)
      }

      try {
        const params = new URLSearchParams({
          api_key: apiKey,
          q: query,
          limit: '2',
        })

        const response = await fetch(`${GIPHY_API_URL}?${params.toString()}`)
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
