"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Eye, Heart, TrendingUp, Crown, Medal, Award } from "lucide-react"
import Link from "next/link"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Work {
  id: string
  title: string
  type: string
  genre: string
  thumbnailUrl: string
  authorName: string
  views: number
  likes: number
  createdAt: any
}

export default function RankingsPage() {
  const [viewRanking, setViewRanking] = useState<Work[]>([])
  const [likeRanking, setLikeRanking] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)

        // 조회수 랭킹
        const viewQuery = query(collection(db, "works"), orderBy("views", "desc"), limit(20))
        const viewSnapshot = await getDocs(viewQuery)
        const viewData = viewSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]

        // 좋아요 랭킹
        const likeQuery = query(collection(db, "works"), orderBy("likes", "desc"), limit(20))
        const likeSnapshot = await getDocs(likeQuery)
        const likeData = likeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]

        setViewRanking(viewData)
        setLikeRanking(likeData)
      } catch (error) {
        console.error("Rankings fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
    }
  }

  const renderRankingList = (works: Work[], type: "views" | "likes") => (
    <div className="space-y-4">
      {works.map((work, index) => (
        <Card key={work.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                {getRankIcon(index + 1)}
              </div>

              <div className="w-16 h-20 flex-shrink-0">
                <img
                  src={work.thumbnailUrl || "/placeholder.svg?height=80&width=60"}
                  alt={work.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={work.type === "comic" ? "default" : "secondary"} className="text-xs">
                    {work.type === "comic" ? "만화" : "소설"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {work.genre}
                  </Badge>
                </div>
                <h3 className="font-semibold truncate">{work.title}</h3>
                <p className="text-sm text-muted-foreground">by {work.authorName}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold">
                  {type === "views" ? <Eye className="h-5 w-5" /> : <Heart className="h-5 w-5 text-red-500" />}
                  <span>{type === "views" ? work.views || 0 : work.likes || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">{type === "views" ? "조회수" : "좋아요"}</p>
              </div>

              <Button asChild>
                <Link href={`/work/${work.id}`}>보기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">랭킹</h1>
          </div>
          <p className="text-muted-foreground">인기 작품들을 확인해보세요</p>
        </div>

        <Tabs defaultValue="views" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="views" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              조회수 랭킹
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              좋아요 랭킹
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">조회수 TOP 20</h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="w-16 h-20 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-300 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : viewRanking.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">아직 랭킹 데이터가 없습니다.</p>
              </div>
            ) : (
              renderRankingList(viewRanking, "views")
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold">좋아요 TOP 20</h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="w-16 h-20 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-300 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : likeRanking.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">아직 랭킹 데이터가 없습니다.</p>
              </div>
            ) : (
              renderRankingList(likeRanking, "likes")
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
