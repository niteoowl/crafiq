"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sword, Heart, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

const genreIcons = {
  판타지: Sword,
  액션: Zap,
  로맨스: Heart,
  무협: Shield,
}

const genreColors = {
  판타지: "from-purple-500 to-purple-600",
  액션: "from-orange-500 to-red-600",
  로맨스: "from-pink-500 to-rose-600",
  무협: "from-amber-500 to-orange-600",
}

export default function GenreSection() {
  const [genreData, setGenreData] = useState<any[]>([])

  useEffect(() => {
    const fetchGenreData = async () => {
      const genres = ["판타지", "액션", "로맨스", "무협"]
      const genrePromises = genres.map(async (genre) => {
        try {
          const q = query(collection(db, "works"), where("genre", "==", genre))
          const querySnapshot = await getDocs(q)
          const works = querySnapshot.docs.slice(0, 3).map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          const Icon = genreIcons[genre as keyof typeof genreIcons] || Sword

          return {
            name: genre,
            icon: Icon,
            count: querySnapshot.size,
            color: genreColors[genre as keyof typeof genreColors] || "from-gray-500 to-gray-600",
            works: works,
          }
        } catch (error) {
          console.error(`Error fetching ${genre} works:`, error)
          return {
            name: genre,
            icon: genreIcons[genre as keyof typeof genreIcons] || Sword,
            count: 0,
            color: genreColors[genre as keyof typeof genreColors] || "from-gray-500 to-gray-600",
            works: [],
          }
        }
      })

      const results = await Promise.all(genrePromises)
      setGenreData(results.filter((genre) => genre.count > 0))
    }

    fetchGenreData()
  }, [])

  if (genreData.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">장르별 인기작</h2>
          <p className="text-muted-foreground">취향에 맞는 작품을 찾아보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {genreData.map((genre) => {
            const Icon = genre.icon
            return (
              <Link key={genre.name} href={`/works?genre=${genre.name}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${genre.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{genre.name}</h3>
                        <p className="text-sm text-muted-foreground">{genre.count}개 작품</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {genre.works.map((work: any, index: number) => (
                        <div key={index} className="relative group/work">
                          <img
                            src={work.thumbnailUrl || "/placeholder.svg?height=150&width=100"}
                            alt={work.title}
                            className="w-full h-20 object-cover rounded group-hover/work:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/work:bg-black/20 transition-colors duration-200 rounded" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <Badge
                        variant="outline"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        더 많은 {genre.name} 작품 보기
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
