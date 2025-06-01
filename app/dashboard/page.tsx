"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, BookOpen, Edit, Eye, Heart, MessageSquare, Plus, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface Work {
  id: string
  title: string
  type: string
  genre: string
  thumbnailUrl: string
  views: number
  likes: number
  createdAt: any
  updatedAt: any
  visibility: string
  comicContent?: any[]
  novelContent?: any[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWorks: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  })

  useEffect(() => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "대시보드에 접근하려면 로그인해주세요.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchMyWorks = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, "works"), where("authorId", "==", user.uid), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const worksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]

        setWorks(worksData)

        // 통계 계산
        const totalViews = worksData.reduce((sum, work) => sum + (work.views || 0), 0)
        const totalLikes = worksData.reduce((sum, work) => sum + (work.likes || 0), 0)

        setStats({
          totalWorks: worksData.length,
          totalViews,
          totalLikes,
          totalComments: 0, // 댓글 수는 별도로 계산 필요
        })
      } catch (error) {
        console.error("내 작품 조회 실패:", error)
        toast({
          title: "작품 조회 실패",
          description: "작품 목록을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMyWorks()
  }, [user, router, toast])

  const handleDeleteWork = async (workId: string) => {
    if (!confirm("정말로 이 작품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "works", workId))
      setWorks((prevWorks) => prevWorks.filter((work) => work.id !== workId))
      toast({
        title: "작품 삭제 완료",
        description: "작품이 성공적으로 삭제되었습니다.",
      })
    } catch (error) {
      console.error("작품 삭제 실패:", error)
      toast({
        title: "작품 삭제 실패",
        description: "작품을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
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
            <h1 className="text-3xl font-bold mb-2">내 작품 관리</h1>
            <p className="text-muted-foreground">작품을 관리하고 통계를 확인하세요</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">총 작품 수</p>
                  <p className="text-3xl font-bold">{stats.totalWorks}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary opacity-80" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">총 조회수</p>
                  <p className="text-3xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500 opacity-80" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">총 좋아요</p>
                  <p className="text-3xl font-bold">{stats.totalLikes}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500 opacity-80" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">총 댓글</p>
                  <p className="text-3xl font-bold">{stats.totalComments}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500 opacity-80" />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">내 작품 목록</h2>
            <Button asChild>
              <Link href="/upload">
                <Plus className="mr-2 h-4 w-4" />
                새 작품 업로드
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="comic">만화</TabsTrigger>
              <TabsTrigger value="novel">소설</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p>작품을 불러오는 중...</p>
                </div>
              ) : works.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">아직 업로드한 작품이 없습니다</h3>
                    <p className="text-muted-foreground mb-6">첫 작품을 업로드하고 창작 활동을 시작하세요!</p>
                    <Button asChild>
                      <Link href="/upload">
                        <Plus className="mr-2 h-4 w-4" />
                        작품 업로드하기
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {works.map((work) => (
                    <Card key={work.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-48 h-48 md:h-auto">
                            <img
                              src={work.thumbnailUrl || "/placeholder.svg?height=200&width=150"}
                              alt={work.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={work.type === "comic" ? "default" : "secondary"}>
                                    {work.type === "comic" ? "만화" : "소설"}
                                  </Badge>
                                  <Badge variant="outline">{work.genre}</Badge>
                                  <Badge
                                    variant={
                                      work.visibility === "public"
                                        ? "default"
                                        : work.visibility === "unlisted"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {work.visibility === "public"
                                      ? "공개"
                                      : work.visibility === "unlisted"
                                      ? "링크 공개"
                                      : "비공개"}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-semibold">{work.title}</h3>
                              </div>
                              <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Eye className="h-4 w-4" />
                                  <span>{work.views || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Heart className="h-4 w-4" />
                                  <span>{work.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  {work.type === "comic" ? (
                                    <>
                                      <BookOpen className="h-4 w-4" />
                                      <span>{work.comicContent?.length || 0}화</span>
                                    </>
                                  ) : (
                                    <>
                                      <BookOpen className="h-4 w-4" />
                                      <span>{work.novelContent?.length || 0}페이지</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                              <Button size="sm" asChild>
                                <Link href={`/work/${work.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  작품 보기
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/edit/${work.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  수정
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/stats/${work.id}`}>
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  통계
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteWork(work.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comic" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p>작품을 불러오는 중...</p>
                </div>
              ) : works.filter((work) => work.type === "comic").length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">아직 업로드한 만화가 없습니다</h3>
                    <p className="text-muted-foreground mb-6">첫 만화를 업로드하고 창작 활동을 시작하세요!</p>
                    <Button asChild>
                      <Link href="/upload">
                        <Plus className="mr-2 h-4 w-4" />
                        만화 업로드하기
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {works
                    .filter((work) => work.type === "comic")
                    .map((work) => (
                      <Card key={work.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-48 h-48 md:h-auto">
                              <img
                                src={work.thumbnailUrl || "/placeholder.svg?height=200&width=150"}
                                alt={work.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="default">만화</Badge>
                                    <Badge variant="outline">{work.genre}</Badge>
                                    <Badge
                                      variant={
                                        work.visibility === "public"
                                          ? "default"
                                          : work.visibility === "unlisted"
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {work.visibility === "public"
                                        ? "공개"
                                        : work.visibility === "unlisted"
                                        ? "링크 공개"
                                        : "비공개"}
                                    </Badge>
                                  </div>
                                  <h3 className="text-xl font-semibold">{work.title}</h3>
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>{work.views || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Heart className="h-4 w-4" />
                                    <span>{work.likes || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{work.comicContent?.length || 0}화</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button size="sm" asChild>
                                  <Link href={`/work/${work.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    작품 보기
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/dashboard/edit/${work.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    수정
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/dashboard/stats/${work.id}`}>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    통계
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteWork(work.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  삭제
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="novel" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p>작품을 불러오는 중...</p>
                </div>
              ) : works.filter((work) => work.type === "novel").length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">아직 업로드한 소설이 없습니다</h3>
                    <p className="text-muted-foreground mb-6">첫 소설을 업로드하고 창작 활동을 시작하세요!</p>
                    <Button asChild>
                      <Link href="/upload">
                        <Plus className="mr-2 h-4 w-4" />
                        소설 업로드하기
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {works
                    .filter((work) => work.type === "novel")
                    .map((work) => (
                      <Card key={work.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-48 h-48 md:h-auto">
                              <img
                                src={work.thumbnailUrl || "/placeholder.svg?height=200&width=150"}
                                alt={work.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">소설</Badge>
                                    <Badge variant="outline">{work.genre}</Badge>
                                    <Badge
                                      variant={
                                        work.visibility === "public"
                                          ? "default"
                                          : work.visibility === "unlisted"
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {work.visibility === "public"
                                        ? "공개"
                                        : work.visibility === "unlisted"
                                        ? "링크 공개"
                                        : "비공개"}
                                    </Badge>
                                  </div>
                                  <h3 className="text-xl font-semibold">{work.title}</h3>
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>{work.views || 0}</span>
                                  </div>
                                  \
