"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Heart, Search, Play } from "lucide-react"
import Link from "next/link"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  createdAt: any
}

export default function ComicsPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [sortBy, setSortBy] = useState("latest")

  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, "works"), where("type", "==", "comic"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const worksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]
        setWorks(worksData)
      } catch (error) {
        console.error("Comics fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComics()
  }, [])

  useEffect(() => {
    let filtered = works.filter((work) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGenre = selectedGenre === "all" || work.genre === selectedGenre

      return matchesSearch && matchesGenre
    })

    // Sort works
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.views || 0) - (a.views || 0)
        case "likes":
          return (b.likes || 0) - (a.likes || 0)
        case "latest":
        default:
          if (a.createdAt?.toDate && b.createdAt?.toDate) {
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          }
          return 0
      }
    })

    setFilteredWorks(filtered)
  }, [works, searchTerm, selectedGenre, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">만화</h1>
          <p className="text-muted-foreground">다양한 장르의 만화를 만나보세요</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="만화 제목이나 작가명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder="장르" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 장르</SelectItem>
                <SelectItem value="fantasy">판타지</SelectItem>
                <SelectItem value="romance">로맨스</SelectItem>
                <SelectItem value="action">액션</SelectItem>
                <SelectItem value="sf">SF</SelectItem>
                <SelectItem value="horror">호러</SelectItem>
                <SelectItem value="slice-of-life">일상</SelectItem>
                <SelectItem value="mystery">미스터리</SelectItem>
                <SelectItem value="comedy">코미디</SelectItem>
                <SelectItem value="martial-arts">무협</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">조회순</SelectItem>
                <SelectItem value="likes">좋아요순</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">총 {filteredWorks.length}개 만화</div>
          </div>
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
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
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">조건에 맞는 만화가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredWorks.map((work) => (
              <Link key={work.id} href={`/work/${work.id}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={work.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                        alt={work.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge variant="default" className="absolute top-2 left-2">
                        만화
                      </Badge>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                          <Play className="mr-2 h-4 w-4" />
                          읽기
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {work.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">by {work.authorName}</p>
                      <Badge variant="outline" className="text-xs mb-3">
                        {work.genre}
                      </Badge>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{work.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{work.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
