import { IYouTubeService } from '../../application/ports/IYouTubeService'
import { YouTubeVideo } from '../../domain/entities/Performance'

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    thumbnails: { medium: { url: string } }
  }
}

export class YouTubeService implements IYouTubeService {
  private readonly apiKey = process.env.YOUTUBE_API_KEY!

  async searchVideos(query: string, maxResults = 3): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: String(maxResults),
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      key: this.apiKey,
    })

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    if (!res.ok) {
      console.error(`YouTube API error: ${res.status}`)
      return []
    }

    const data = await res.json() as { items: YouTubeSearchItem[] }
    return (data.items ?? []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
    }))
  }
}
