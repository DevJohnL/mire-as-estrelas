import { YouTubeVideo } from '../../domain/entities/Performance'

export interface IYouTubeService {
  searchVideos(query: string, maxResults?: number): Promise<YouTubeVideo[]>
}
