'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface Video {
  id: string
  title: string
  url: string
  videoId: string
  channelName?: string
  thumbnailUrl: string
  position: number
}

interface Playlist {
  name: string
  videos: Video[]
}

export default function YouTubePage() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Record<string, Playlist>>({})
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create')
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [videoLinks, setVideoLinks] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPlaylists()
  }, [user])

  async function loadPlaylists() {
    try {
      setLoading(true)
      let allData: any[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true
      
      while (hasMore) {
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .eq('category', 'youtube-playlist')
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1)
        
        if (error) throw error
        
        if (data && data.length > 0) {
          allData = allData.concat(data)
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }
      
      const playlistsData: Record<string, Playlist> = {}
      
      allData.forEach(link => {
        let metadata: any = {}
        try {
          metadata = JSON.parse(link.description || '{}')
        } catch (e) {
          metadata = { playlist_id: 'unknown' }
        }
        
        const playlistId = metadata.playlist_id || 'unknown'
        const playlistNameValue = metadata.playlist_name || 'Unknown Playlist'
        
        if (!playlistsData[playlistId]) {
          playlistsData[playlistId] = {
            name: playlistNameValue,
            videos: []
          }
        }
        
        playlistsData[playlistId].videos.push({
          id: link.id,
          title: link.name,
          url: link.url,
          videoId: metadata.video_id || extractVideoId(link.url),
          channelName: metadata.channel_name || '',
          thumbnailUrl: metadata.thumbnail_url || `https://img.youtube.com/vi/${metadata.video_id}/mqdefault.jpg`,
          position: link.position || 0
        })
      })
      
      // Sort videos by position
      Object.values(playlistsData).forEach(playlist => {
        playlist.videos.sort((a, b) => a.position - b.position)
      })
      
      setPlaylists(playlistsData)
      
      // Set first playlist as current
      const firstPlaylistId = Object.keys(playlistsData)[0]
      if (firstPlaylistId) {
        setCurrentPlaylistId(firstPlaylistId)
      }
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  function extractVideoId(url: string): string {
    if (url.includes('/shorts/')) {
      const match = url.match(/shorts\/([^#&?]*)/)
      return match ? match[1] : ''
    }
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^#&?]*).*/,
      /^([^#&?]*).*/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1].length === 11) {
        return match[1]
      }
    }
    return ''
  }

  function extractPlaylistId(url: string): string | null {
    const match = url.match(/[&?]list=([^&]+)/)
    return match ? match[1] : null
  }

  async function handleImport() {
    if (!playlistUrl || !playlistName) {
      alert('플레이리스트 URL과 이름을 입력하세요')
      return
    }

    const playlistId = extractPlaylistId(playlistUrl)
    if (!playlistId) {
      // Manual video links mode
      const lines = videoLinks.split('\n')
      const videos: any[] = []
      
      lines.forEach((line, index) => {
        const url = line.trim()
        if (url) {
          const videoId = extractVideoId(url)
          if (videoId) {
            videos.push({
              url: url,
              videoId: videoId,
              title: `Video ${index + 1}`,
              position: index
            })
          }
        }
      })
      
      if (videos.length > 0) {
        await savePlaylist(`manual-${Date.now()}`, playlistName, videos, false)
      }
    } else {
      // Fetch from YouTube API
      const videos = await fetchPlaylistVideos(playlistId)
      if (videos.length > 0) {
        await savePlaylist(playlistId, playlistName, videos, modalMode === 'update')
      }
    }
  }

  async function fetchPlaylistVideos(playlistId: string) {
    const API_KEY = 'AIzaSyCCbyfWSpCbZE5irT8jl6eG9tzX_rJnJtw'
    const videos: any[] = []
    let nextPageToken = ''
    
    try {
      do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${nextPageToken ? '&pageToken=' + nextPageToken : ''}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('YouTube API 요청 실패')
        }
        
        const data = await response.json()
        
        if (data.items) {
          data.items.forEach((item: any) => {
            const snippet = item.snippet
            videos.push({
              url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
              videoId: snippet.resourceId.videoId,
              title: snippet.title,
              description: snippet.description,
              thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
              channelTitle: snippet.channelTitle,
              position: snippet.position !== undefined ? snippet.position : videos.length
            })
          })
        }
        
        nextPageToken = data.nextPageToken
      } while (nextPageToken)
      
      return videos
      
    } catch (error) {
      console.error('API error:', error)
      alert('YouTube API 오류: ' + (error as Error).message)
      return []
    }
  }

  async function savePlaylist(playlistId: string, playlistName: string, videos: any[], isUpdate: boolean) {
    try {
      if (isUpdate) {
        const { error: deleteError } = await supabase
          .from('links')
          .delete()
          .eq('category', 'youtube-playlist')
          .like('description', `%"playlist_id":"${playlistId}"%`)
        
        if (deleteError) throw deleteError
      }
      
      const batchSize = 50
      let savedCount = 0
      
      for (let i = 0; i < videos.length; i += batchSize) {
        const batch = videos.slice(i, i + batchSize)
        const { error } = await supabase
          .from('links')
          .insert(
            batch.map((video, index) => ({
              name: video.title || `${playlistName} - Video ${i + index + 1}`,
              url: video.url,
              category: 'youtube-playlist',
              description: JSON.stringify({
                playlist_id: playlistId,
                playlist_name: playlistName,
                video_id: video.videoId,
                channel_name: video.channelTitle || '',
                channel_title: video.channelTitle || '',
                thumbnail_url: video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
                position: video.position !== undefined ? video.position : i + index
              }),
              position: i + index
            }))
          )
        
        if (error) throw error
        savedCount += batch.length
      }
      
      setShowModal(false)
      setPlaylistUrl('')
      setPlaylistName('')
      setVideoLinks('')
      await loadPlaylists()
      
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 실패: ' + (error as Error).message)
    }
  }

  async function deletePlaylist(playlistId: string) {
    if (!confirm('이 플레이리스트를 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('category', 'youtube-playlist')
        .like('description', `%"playlist_id":"${playlistId}"%`)
      
      if (error) throw error
      
      await loadPlaylists()
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 실패: ' + (error as Error).message)
    }
  }

  async function deleteVideo(videoId: string) {
    if (!confirm('이 동영상을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', videoId)
      
      if (error) throw error
      
      await loadPlaylists()
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 실패: ' + (error as Error).message)
    }
  }

  function playPlaylist(playlistId: string) {
    const playlist = playlists[playlistId]
    if (playlist && playlist.videos.length > 0) {
      const firstVideo = playlist.videos[0]
      const playlistVideoIds = playlist.videos.map(v => v.videoId).join(',')
      window.open(`https://www.youtube.com/watch?v=${firstVideo.videoId}&list=${playlistVideoIds}`, '_blank')
    }
  }

  function playVideo(videoId: string) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
  }

  const currentPlaylist = playlists[currentPlaylistId]
  const filteredVideos = currentPlaylist?.videos.filter(video => 
    searchQuery === '' || 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.channelName && video.channelName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-2xl text-text-secondary">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          YOUTUBE
        </h1>
        <p className="text-text-secondary mb-8">나만의 YouTube 플레이리스트 관리</p>
        
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{Object.keys(playlists).length}</div>
            <div className="text-sm text-text-secondary">플레이리스트</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">
              {Object.values(playlists).reduce((acc, p) => acc + p.videos.length, 0)}
            </div>
            <div className="text-sm text-text-secondary">동영상</div>
          </div>
        </div>

        <button
          onClick={() => {
            setModalMode('create')
            setShowModal(true)
          }}
          className="btn-primary"
        >
          <i className="fas fa-plus mr-2"></i>
          플레이리스트 추가
        </button>
      </div>

      {Object.keys(playlists).length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="동영상 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-card-bg border border-border-color rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {Object.entries(playlists).map(([id, playlist]) => (
              <div
                key={id}
                className={`playlist-tab ${currentPlaylistId === id ? 'active' : ''}`}
              >
                <span onClick={() => setCurrentPlaylistId(id)}>{playlist.name}</span>
                <div className="tab-actions">
                  <button
                    className="tab-action play"
                    onClick={(e) => {
                      e.stopPropagation()
                      playPlaylist(id)
                    }}
                    title="재생"
                  >
                    <i className="fas fa-play"></i>
                  </button>
                  <button
                    className="tab-action delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePlaylist(id)
                    }}
                    title="삭제"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="video-card group" onClick={() => playVideo(video.videoId)}>
                <button
                  className="video-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteVideo(video.id)
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className="video-thumbnail-container">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="video-thumbnail"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                    }}
                  />
                  <div className="video-overlay">
                    <div className="play-button">
                      <i className="fas fa-play ml-1"></i>
                    </div>
                  </div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  {video.channelName && (
                    <p className="video-channel">{video.channelName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {Object.keys(playlists).length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-music text-6xl text-text-secondary mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">플레이리스트가 없습니다</h3>
          <p className="text-text-secondary">첫 번째 플레이리스트를 만들어보세요!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? '플레이리스트 추가' : '플레이리스트 업데이트'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">플레이리스트 이름</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary"
                  placeholder="예: 좋아하는 음악"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">YouTube 플레이리스트 URL</label>
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary"
                  placeholder="https://www.youtube.com/playlist?list=..."
                />
              </div>
              
              <div className="text-center text-text-secondary">
                <p>또는</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">동영상 링크들 (한 줄에 하나씩)</label>
                <textarea
                  value={videoLinks}
                  onChange={(e) => setVideoLinks(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary h-32"
                  placeholder="https://www.youtube.com/watch?v=...
https://youtu.be/..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleImport}
                className="btn-primary"
              >
                {modalMode === 'create' ? '추가' : '업데이트'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .playlist-tab {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .playlist-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .playlist-tab.active {
          background: #ff0000;
          color: white;
          border-color: #ff0000;
          box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);
        }

        .tab-actions {
          display: flex;
          gap: 8px;
          margin-left: 10px;
        }

        .tab-action {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s;
        }

        .tab-action:hover {
          transform: scale(1.2);
        }

        .tab-action.play:hover {
          background: #4caf50;
        }

        .tab-action.delete:hover {
          background: #f44336;
        }

        .video-card {
          background: var(--card-bg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
        }

        .video-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(255, 0, 0, 0.3);
          border-color: rgba(255, 0, 0, 0.5);
        }

        .video-delete-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          background: rgba(244, 67, 54, 0.9);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s;
          z-index: 10;
        }

        .video-card:hover .video-delete-btn {
          opacity: 1;
          transform: scale(1);
        }

        .video-delete-btn:hover {
          background: #f44336;
          transform: scale(1.1);
        }

        .video-thumbnail-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          overflow: hidden;
          background: #000;
        }

        .video-thumbnail {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .video-card:hover .video-thumbnail {
          transform: scale(1.1);
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-card:hover .video-overlay {
          opacity: 1;
        }

        .play-button {
          width: 60px;
          height: 60px;
          background: rgba(255, 0, 0, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          transform: scale(0);
          transition: transform 0.3s;
        }

        .video-card:hover .play-button {
          transform: scale(1);
        }

        .video-info {
          padding: 16px;
        }

        .video-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-channel {
          font-size: 12px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}