"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Plus, Star, Upload } from "lucide-react"
import Link from "next/link"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

interface Work {
  id: string
  title: string
  description: string
  genre: string
  type: string
  thumbnailUrl: string
  authorName: string
  views: number
  likes: number
}

export default function RecommendedWorks() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const q = query(collection(db, "works"), orderBy("likes", "desc"), limit(4))
        const querySnapshot = await getDocs(q)
        const worksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]
        setWorks(worksData)
      } catch (error) {
        console.error("Recommended works fetch error:", error)
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
            <h2 className="text-2xl font-bold">추천 작품</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
            <h2 className="text-2xl font-bold">추천 작품</h2>
          </div>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Upload className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">아직 작품이 없습니다</h3>
              <p className="text-muted-foreground">첫 번째 창작자가 되어 멋진 작품을 공유해보세요!</p>
              {user && (
                <Button asChild>
                  <Link href="/upload">
                    <Plus className="mr-2 h-4 w-4" />
                    작품 업로드하기
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
          <h2 className="text-2xl font-bold">추천 작품</h2>
          <Button variant="ghost" asChild>
            <Link href="/works">더보기</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {works.map((work) => (
            <Card key={work.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={work.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                    alt={work.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" className="bg-white/90 text-black hover:bg-white" asChild>
                      <Link href={`/read/${work.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        읽기
                      </Link>
                    </Button>
                  </div>
                  <Badge variant={work.type === "comic" ? "default" : "secondary"} className="absolute top-2 left-2">
                    {work.type === "comic" ? "만화" : "소설"}
                  </Badge>
                  <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
                    {work.genre}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {work.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{work.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{work.likes || 0}</span>
                    </div>
                    <span className="text-muted-foreground">by {work.authorName}</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/read/${work.id}`}>
                        <Play className="mr-2 h-3 w-3" />
                        읽기
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
