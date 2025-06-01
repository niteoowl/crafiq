"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Plus } from "lucide-react"
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
  createdAt: any
}

export default function NewReleases() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const q = query(collection(db, "works"), orderBy("createdAt", "desc"), limit(6))
        const querySnapshot = await getDocs(q)
        const worksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]
        setWorks(worksData)
      } catch (error) {
        console.error("New releases fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorks()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">신작 & 업데이트</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-32 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
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
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">신작 & 업데이트</h2>
          </div>
          <div className="text-center py-8">
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">신작이 없습니다</h3>
              <p className="text-sm text-muted-foreground">새로운 작품이 업로드되면 여기에 표시됩니다.</p>
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
    <section className="py-12 bg-muted/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">신작 & 업데이트</h2>
          <Button variant="ghost" asChild>
            <Link href="/works">더보기</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {works.map((work, index) => (
            <Card key={work.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={work.thumbnailUrl || "/placeholder.svg?height=200&width=300"}
                    alt={work.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {index < 3 && <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">NEW</Badge>}
                  <Badge variant={work.type === "comic" ? "default" : "secondary"} className="absolute top-2 right-2">
                    {work.type === "comic" ? "만화" : "소설"}
                  </Badge>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" className="bg-white/90 text-black hover:bg-white" asChild>
                      <Link href={`/read/${work.id}`}>
                        <Play className="mr-1 h-3 w-3" />
                        읽기
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {work.title}
                  </h3>
                  <Badge variant="outline" className="text-xs mb-2">
                    {work.genre}
                  </Badge>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>신작</span>
                    </div>
                    <span>
                      {work.createdAt?.toDate
                        ? work.createdAt.toDate().toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
                        : "최근"}
                    </span>
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
