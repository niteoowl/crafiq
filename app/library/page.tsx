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
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface LibraryWork {
  id: string
  title: string
  type: string
  genre: string
  thumbnailUrl: string
  authorName: string
  addedAt: any
  progress?: number
  lastRead?: any
}

interface LikedWork {
  id: string
  title: string
  type: string
  genre: string
  thumbnailUrl: string
  authorName: string
  likedAt: any
}

interface RecentWork {
  id: string
  title: string
  type: string
  genre: string
  thumbnailUrl: string
  authorName: string
  viewedAt: any
  episode?: number
  page?: number
}

export default function LibraryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [libraryWorks, setLibraryWorks] = useState<LibraryWork[]>([])
  const [likedWorks, setLikedWorks] = useState<LikedWork[]>([])
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchLibraryData = async () => {
      try {
        setLoading(true)

        // 사용자의 라이브러리 데이터 가져오기 (실제로는 별도 컬렉션에서 관리)
        // 여기서는 임시로 좋아요한 작품들을 라이브러리로 사용
        const worksQuery = query(collection(db, "works"), where("likedBy", "array-contains", user.uid))
        const worksSnapshot = await getDocs(worksQuery)
        const works = worksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          addedAt: doc.data().createdAt,
          progress: Math.floor(Math.random() * 100), // 임시 진행률
        })) as LibraryWork[]

        setLibraryWorks(works)
        setLikedWorks(works.map((work) => ({ ...work, likedAt: work.addedAt })))

        // 최근 본 작품 (임시 데이터)
        const recentData = works.slice(0, 5).map((work, index) => ({
          ...work,
          viewedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
          episode: work.type === "comic" ? Math.floor(Math.random() * 10) + 1 : undefined,
          page: work.type === "novel" ? Math.floor(Math.random() * 50) + 1 : undefined,
        })) as RecentWork[]

        setRecentWorks(recentData)
      } catch (error) {
        console.error("Library data fetch error:", error)
        toast({
          title: "데이터 로드 실패",
          description: "라이브러리 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [user, router, toast])

  const removeFromLibrary = async (workId: string) => {
    if (!user) return

    try {
      // 실제로는 사용자의 라이브러리에서 제거
      await updateDoc(doc(db, "works", workId), {
        likedBy: arrayRemove(user.uid),
      })

      setLibraryWorks((prev) => prev.filter((work) => work.id !== workId))
      toast({
        title: "서재에서 제거됨",
        description: "작품이 내 서재에서 제거되었습니다.",
      })
    } catch (error) {
      console.error("Remove from library error:", error)
      toast({
        title: "제거 실패",
        description: "작품을 서재에서 제거하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const removeFromLiked = async (workId: string) => {
    if (!user) return

    try {
      await updateDoc(doc(db, "works", workId), {
        likedBy: arrayRemove(user.uid),
      })

      setLikedWorks((prev) => prev.filter((work) => work.id !== workId))
      toast({
        title: "좋아요 취소됨",
        description: "작품의 좋아요가 취소되었습니다.",
      })
    } catch (error) {
      console.error("Remove like error:", error)
      toast({
        title: "좋아요 취소 실패",
        description: "좋아요를 취소하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const clearHistory = () => {
    setRecentWorks([])
    toast({
      title: "기록 삭제됨",
      description: "시청 기록이 모두 삭제되었습니다.",
    })
  }

  if (!user) {
    return null
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
              {loading ? (
                <div className="text-center py-12">
                  <p>로딩 중...</p>
                </div>
              ) : libraryWorks.length === 0 ? (
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
                              <span>{work.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${work.progress || 0}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              추가한 날:{" "}
                              {work.addedAt?.toDate ? work.addedAt.toDate().toLocaleDateString("ko-KR") : "최근"}
                            </p>
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
              {loading ? (
                <div className="text-center py-12">
                  <p>로딩 중...</p>
                </div>
              ) : likedWorks.length === 0 ? (
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
                          <p className="text-xs text-muted-foreground mb-4">
                            좋아요한 날:{" "}
                            {work.likedAt?.toDate ? work.likedAt.toDate().toLocaleDateString("ko-KR") : "최근"}
                          </p>

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

              {loading ? (
                <div className="text-center py-12">
                  <p>로딩 중...</p>
                </div>
              ) : recentWorks.length === 0 ? (
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
                              {work.viewedAt?.toLocaleDateString ? work.viewedAt.toLocaleDateString("ko-KR") : "최근"} •{" "}
                              {work.type === "comic" ? `${work.episode}화` : `${work.page}페이지`}
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
