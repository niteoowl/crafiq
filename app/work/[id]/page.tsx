"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, Eye, Share2, Bookmark, Calendar, User, Tag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface Work {
  id: string
  title: string
  description: string
  genre: string
  type: string
  thumbnailUrl: string
  authorName: string
  authorId: string
  views: number
  likes: number
  likedBy: string[]
  tags: string[]
  ageRating: string
  createdAt: any
  novelContent?: Array<{ id: string; content: string; pageNumber: number }>
  comicContent?: Array<{ id: string; title: string; episodeNumber: number; images: string[] }>
}

export default function WorkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const fetchWork = async () => {
      if (!params?.id) return

      try {
        const workDoc = await getDoc(doc(db, "works", params.id as string))
        if (workDoc.exists()) {
          const workData = { id: workDoc.id, ...workDoc.data() } as Work
          setWork(workData)

          // Check if user liked this work
          if (user && workData.likedBy?.includes(user.uid)) {
            setIsLiked(true)
          }

          // Increment view count
          await updateDoc(doc(db, "works", params.id as string), {
            views: increment(1),
          })
        }
      } catch (error) {
        console.error("Work fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWork()
  }, [params?.id, user])

  const handleLike = async () => {
    if (!user || !work) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const workRef = doc(db, "works", work.id)

      if (isLiked) {
        await updateDoc(workRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid),
        })
        setIsLiked(false)
        setWork((prev) => (prev ? { ...prev, likes: (prev.likes || 0) - 1 } : null))
      } else {
        await updateDoc(workRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid),
        })
        setIsLiked(true)
        setWork((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null))
      }
    } catch (error) {
      console.error("Like error:", error)
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  const handleAddToLibrary = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "내 서재에 추가하려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "서재에서 제거되었습니다" : "서재에 추가되었습니다",
      description: isBookmarked ? "내 서재에서 제거되었습니다." : "내 서재에 추가되었습니다.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <div className="text-center">작품을 찾을 수 없습니다.</div>
        </main>
        <Footer />
      </div>
    )
  }

  const isComic = work.type === "comic"
  const totalContent = isComic ? work.comicContent?.length || 0 : work.novelContent?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Work Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnail */}
                <div className="w-full md:w-64 flex-shrink-0">
                  <img
                    src={work.thumbnailUrl || "/placeholder.svg?height=400&width=300"}
                    alt={work.title}
                    className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isComic ? "default" : "secondary"}>{isComic ? "만화" : "소설"}</Badge>
                      <Badge variant="outline">{work.genre}</Badge>
                      {work.ageRating && <Badge variant="outline">{work.ageRating}</Badge>}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{work.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{work.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{work.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{work.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {work.createdAt?.toDate ? work.createdAt.toDate().toLocaleDateString("ko-KR") : "최근"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{work.description}</p>

                  {/* Tags */}
                  {work.tags && work.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {work.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button size="lg" asChild>
                      <Link href={`/read/${work.id}`}>
                        <Play className="mr-2 h-5 w-5" />
                        {isComic ? "1화 읽기" : "읽기 시작"}
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleAddToLibrary}
                      className={`transition-all duration-300 ${
                        isBookmarked
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      <Bookmark className={`mr-2 h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
                      {isBookmarked ? "서재에서 제거" : "내 서재에 추가"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleLike}
                      className={`transition-all duration-300 ${
                        isLiked ? "bg-red-500 text-white hover:bg-red-600" : "hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      <Heart className={`mr-2 h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                      좋아요
                    </Button>
                    <Button size="lg" variant="outline">
                      <Share2 className="mr-2 h-5 w-5" />
                      공유
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Episode/Chapter List */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    {isComic ? `에피소드 (${totalContent}화)` : `페이지 (${totalContent}페이지)`}
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isComic ? (
                      work.comicContent?.map((episode) => (
                        <Link
                          key={episode.id}
                          href={`/read/${work.id}?episode=${episode.episodeNumber}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                            <div>
                              <p className="font-medium">{episode.title}</p>
                              <p className="text-sm text-muted-foreground">{episode.images.length}장</p>
                            </div>
                            <Play className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <Link href={`/read/${work.id}`} className="block">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <div>
                            <p className="font-medium">소설 읽기</p>
                            <p className="text-sm text-muted-foreground">{totalContent}페이지</p>
                          </div>
                          <Play className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Author Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">작가 정보</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{work.authorName}</p>
                      <p className="text-sm text-muted-foreground">작가</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
