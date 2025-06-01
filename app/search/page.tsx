"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Heart, Play } from "lucide-react"
import Link from "next/link"
import { collection, query, getDocs, orderBy } from "firebase/firestore"
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
  tags: string[]
  createdAt: any
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [works, setWorks] = useState<Work[]>([])
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("q") || "")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchAllWorks = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, "works"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const worksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]
        setWorks(worksData)
      } catch (error) {
        console.error("Works fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllWorks()
  }, [])

  useEffect(() => {
    let filtered = works.filter((work) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesGenre = selectedGenre === "all" || work.genre === selectedGenre
      const matchesType = selectedType === "all" || work.type === selectedType

      return matchesSearch && matchesGenre && matchesType
    })

    // Sort works
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.views || 0) - (a.views || 0)
        case "likes":
          return (b.likes || 0) - (a.likes || 0)
        case "title":
          return a.title.localeCompare(b.title)
        case "latest":
        default:
          if (a.createdAt?.toDate && b.createdAt?.toDate) {
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          }
          return 0
      }
    })

    setFilteredWorks(filtered)
  }, [works, searchTerm, selectedGenre, selectedType, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 검색은 실시간으로 이미 적용되므로 별도 처리 불필요
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">작품 검색</h1>
            <p className="text-muted-foreground">원하는 작품을 찾아보세요</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="제목, 작가, 태그로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                필터
              </Button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">장르</label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="장르 선택" />
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
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">유형</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 유형</SelectItem>
                        <SelectItem value="comic">만화</SelectItem>
                        <SelectItem value="novel">소설</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">정렬</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="정렬 방식" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">최신순</SelectItem>
                        <SelectItem value="popular">조회순</SelectItem>
                        <SelectItem value="likes">좋아요순</SelectItem>
                        <SelectItem value="title">제목순</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedGenre("all")
                        setSelectedType("all")
                        setSortBy("latest")
                        setSearchTerm("")
                      }}
                    >
                      초기화
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {loading ? "검색 중..." : `총 ${filteredWorks.length}개의 작품을 찾았습니다`}
                {searchTerm && ` "${searchTerm}"에 대한 검색 결과`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-4">다른 키워드로 검색하거나 필터를 조정해보세요</p>
              <Button asChild>
                <Link href="/works">모든 작품 보기</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                        <Badge
                          variant={work.type === "comic" ? "default" : "secondary"}
                          className="absolute top-2 left-2"
                        >
                          {work.type === "comic" ? "만화" : "소설"}
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

                        {/* Tags */}
                        {work.tags && work.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {work.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {work.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{work.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
