"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Eye, Heart, Trophy, Plus } from "lucide-react"
import Link from "next/link"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

interface Work {
  id: string
  title: string
  genre: string
  type: string
  thumbnailUrl: string
  views: number
  likes: number
}

export default function PopularWorks() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const q = query(collection(db, "works"), orderBy("views", "desc"), limit(5))
        const querySnapshot = await getDocs(q)
        const worksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]
        setWorks(worksData)
      } catch (error) {
        console.error("Popular works fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorks()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">인기 작품</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-64 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (works.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">인기 작품</h2>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">인기 작품이 없습니다</h3>
              <p className="text-sm text-muted-foreground">조회수가 높은 작품들이 여기에 표시됩니다.</p>
              {user && (
                <Button size="sm" asChild>
                  <Link href="/upload">
                    <Plus className="mr-2 h-3 w-3" />
                    업로드하기
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">인기 작품</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/works">전체 랭킹</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {works.map((work, index) => (
            <Card key={work.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={work.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                    alt={work.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
                      #{index + 1}
                    </Badge>
                  </div>
                  <Badge variant={work.type === "comic" ? "default" : "secondary"} className="absolute top-2 right-2">
                    {work.type === "comic" ? "만화" : "소설"}
                  </Badge>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" className="bg-white/90 text-black hover:bg-white" asChild>
                      <Link href={`/read/${work.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        읽기
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {work.title}
                  </h3>
                  <Badge variant="outline" className="mb-3">
                    {work.genre}
                  </Badge>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{work.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{work.likes || 0}</span>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/read/${work.id}`}>
                      <Play className="mr-2 h-3 w-3" />
                      지금 읽기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
