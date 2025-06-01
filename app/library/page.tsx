"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Heart, Clock, Trash2, Play } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// 임시 데이터 (실제로는 Firestore에서 가져와야 함)
const mockLibraryWorks = [
  {
    id: "1",
    title: "마법사의 여행",
    type: "novel",
    genre: "판타지",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    authorName: "김작가",
    lastRead: "2024-01-15",
    progress: 45,
  },
  {
    id: "2",
    title: "도시의 영웅",
    type: "comic",
    genre: "액션",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    authorName: "박작가",
    lastRead: "2024-01-14",
    progress: 80,
  },
]

const mockLikedWorks = [
  {
    id: "3",
    title: "로맨스 소설",
    type: "novel",
    genre: "로맨스",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    authorName: "이작가",
    likedAt: "2024-01-13",
  },
]

const mockRecentWorks = [
  {
    id: "4",
    title: "SF 어드벤처",
    type: "comic",
    genre: "SF",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    authorName: "최작가",
    viewedAt: "2024-01-15 14:30",
    episode: 5,
  },
]

export default function LibraryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [libraryWorks, setLibraryWorks] = useState(mockLibraryWorks)
  const [likedWorks, setLikedWorks] = useState(mockLikedWorks)
  const [recentWorks, setRecentWorks] = useState(mockRecentWorks)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const removeFromLibrary = (workId: string) => {
    setLibraryWorks((prev) => prev.filter((work) => work.id !== workId))
  }

  const removeFromLiked = (workId: string) => {
    setLikedWorks((prev) => prev.filter((work) => work.id !== workId))
  }

  const clearHistory = () => {
    setRecentWorks([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">내 서재</h1>
            <p className="text-muted-foreground">저장한 작품들과 읽기 기록을 관리하세요</p>
          </div>

          <Tabs defaultValue="library" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />내 서재 ({libraryWorks.length})
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                좋아요 ({likedWorks.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                최근 본 작품 ({recentWorks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-6">
              {libraryWorks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">서재가 비어있습니다</h3>
                  <p className="text-muted-foreground mb-4">관심있는 작품을 서재에 추가해보세요!</p>
                  <Button asChild>
                    <Link href="/works">작품 둘러보기</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {libraryWorks.map((work) => (
                    <Card key={work.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={work.thumbnailUrl || "/placeholder.svg"}
                            alt={work.title}
                            className="w-full h-64 object-cover rounded-t-lg"
                          />
                          <Badge
                            variant={work.type === "comic" ? "default" : "secondary"}
                            className="absolute top-2 left-2"
                          >
                            {work.type === "comic" ? "만화" : "소설"}
                          </Badge>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => removeFromLibrary(work.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{work.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">by {work.authorName}</p>
                          <Badge variant="outline" className="text-xs mb-3">
                            {work.genre}
                          </Badge>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>진행률</span>
                              <span>{work.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${work.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">마지막 읽은 날: {work.lastRead}</p>
                          </div>

                          <Button className="w-full mt-4" asChild>
                            <Link href={`/work/${work.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              이어서 읽기
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked" className="space-y-6">
              {likedWorks.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">좋아요한 작품이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">마음에 드는 작품에 좋아요를 눌러보세요!</p>
                  <Button asChild>
                    <Link href="/works">작품 둘러보기</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {likedWorks.map((work) => (
                    <Card key={work.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={work.thumbnailUrl || "/placeholder.svg"}
                            alt={work.title}
                            className="w-full h-64 object-cover rounded-t-lg"
                          />
                          <Badge
                            variant={work.type === "comic" ? "default" : "secondary"}
                            className="absolute top-2 left-2"
                          >
                            {work.type === "comic" ? "만화" : "소설"}
                          </Badge>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => removeFromLiked(work.id)}
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{work.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">by {work.authorName}</p>
                          <Badge variant="outline" className="text-xs mb-3">
                            {work.genre}
                          </Badge>
                          <p className="text-xs text-muted-foreground mb-4">좋아요한 날: {work.likedAt}</p>

                          <Button className="w-full" asChild>
                            <Link href={`/work/${work.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              읽기
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">최근 본 작품</h2>
                {recentWorks.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    기록 삭제
                  </Button>
                )}
              </div>

              {recentWorks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">최근 본 작품이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">작품을 읽으면 여기에 기록됩니다!</p>
                  <Button asChild>
                    <Link href="/works">작품 둘러보기</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentWorks.map((work) => (
                    <Card key={work.id} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={work.thumbnailUrl || "/placeholder.svg"}
                            alt={work.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={work.type === "comic" ? "default" : "secondary"} className="text-xs">
                                {work.type === "comic" ? "만화" : "소설"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {work.genre}
                              </Badge>
                            </div>
                            <h3 className="font-semibold mb-1">{work.title}</h3>
                            <p className="text-sm text-muted-foreground mb-1">by {work.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {work.viewedAt} • {work.type === "comic" ? `${work.episode}화` : "읽는 중"}
                            </p>
                          </div>
                          <Button asChild>
                            <Link href={`/work/${work.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              이어서 읽기
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
