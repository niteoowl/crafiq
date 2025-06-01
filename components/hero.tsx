"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Eye, Heart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
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

export default function Hero() {
  const [featuredWorks, setFeaturedWorks] = useState<Work[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchPopularWorks = async () => {
      try {
        // 인덱스 에러를 피하기 위해 단일 필드로 정렬
        const q = query(collection(db, "works"), orderBy("likes", "desc"), limit(3))
        const querySnapshot = await getDocs(q)
        const works = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Work[]

        setFeaturedWorks(works)
      } catch (error) {
        console.error("Featured works fetch error:", error)
        // 에러 발생 시 빈 배열로 설정
        setFeaturedWorks([])
      } finally {
        setLoading(false)
      }
    }

    fetchPopularWorks()
  }, [])

  useEffect(() => {
    if (featuredWorks.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredWorks.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [featuredWorks.length])

  if (loading) {
    return (
      <section className="relative h-[70vh] overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="relative container px-4 h-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-300 rounded-md mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredWorks.length === 0) {
    return (
      <section className="relative h-[70vh] overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="relative container px-4 h-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              CRAFIQ에 오신 것을{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                환영합니다
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              아직 업로드된 작품이 없습니다. 첫 번째 창작자가 되어보세요!
            </p>
            {user && (
              <Button size="lg" asChild>
                <Link href="/upload">
                  <Plus className="mr-2 h-5 w-5" />첫 작품 업로드하기
                </Link>
              </Button>
            )}
            {!user && (
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link href="/login">로그인</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">회원가입</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  const currentWork = featuredWorks[currentIndex]
  const backgroundColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ]

  return (
    <section className="relative h-[70vh] overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{ background: backgroundColors[currentIndex] || backgroundColors[0] }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative container px-4 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
          <div className="text-white space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  실시간 인기작
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {currentWork.type === "comic" ? "만화" : "소설"}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white">
                  {currentWork.genre}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">{currentWork.title}</h1>
            </div>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">{currentWork.description}</p>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{currentWork.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{currentWork.likes || 0}</span>
              </div>
              <span>by {currentWork.authorName}</span>
            </div>

            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-white/90" asChild>
                <Link href={`/work/${currentWork.id}`}>
                  <Play className="mr-2 h-5 w-5" />
                  지금 읽기
                </Link>
              </Button>
              {user && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />내 서재에 추가
                </Button>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <img
                src={currentWork.thumbnailUrl || "/placeholder.svg?height=600&width=400"}
                alt={currentWork.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {featuredWorks.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredWorks.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
