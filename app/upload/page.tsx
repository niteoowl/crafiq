"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, BookOpen, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface NovelPage {
  id: string
  content: string
  pageNumber: number
}

interface ComicEpisode {
  id: string
  title: string
  episodeNumber: number
  imageUrls: string[] // URL 문자열 배열로 변경
}

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Novel specific states
  const [novelPages, setNovelPages] = useState<NovelPage[]>([{ id: "1", content: "", pageNumber: 1 }])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Comic specific states
  const [comicEpisodes, setComicEpisodes] = useState<ComicEpisode[]>([
    { id: "1", title: "1화", episodeNumber: 1, imageUrls: [] },
  ])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    ageRating: "",
    description: "",
    visibility: "public",
  })

  useEffect(() => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "작품을 업로드하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, router, toast])

  if (!user) {
    return null
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // 이미지 URL 처리 함수 (Base64 대신 외부 URL 사용)
  const handleThumbnailUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailUrl(e.target.value)
  }

  const handleComicImageUrlAdd = () => {
    const imageUrl = prompt("이미지 URL을 입력하세요")
    if (imageUrl) {
      const currentEpisode = comicEpisodes[currentEpisodeIndex]
      const updatedEpisodes = comicEpisodes.map((episode, index) =>
        index === currentEpisodeIndex ? { ...episode, imageUrls: [...episode.imageUrls, imageUrl] } : episode,
      )
      setComicEpisodes(updatedEpisodes)
    }
  }

  const removeComicImage = (imageIndex: number) => {
    const currentEpisode = comicEpisodes[currentEpisodeIndex]
    const updatedImages = currentEpisode.imageUrls.filter((_, index) => index !== imageIndex)
    const updatedEpisodes = comicEpisodes.map((episode, index) =>
      index === currentEpisodeIndex ? { ...episode, imageUrls: updatedImages } : episode,
    )
    setComicEpisodes(updatedEpisodes)
  }

  const addComicEpisode = () => {
    const newEpisode: ComicEpisode = {
      id: Date.now().toString(),
      title: `${comicEpisodes.length + 1}화`,
      episodeNumber: comicEpisodes.length + 1,
      imageUrls: [],
    }
    setComicEpisodes([...comicEpisodes, newEpisode])
    setCurrentEpisodeIndex(comicEpisodes.length)
  }

  const deleteComicEpisode = (episodeIndex: number) => {
    if (comicEpisodes.length > 1) {
      const updatedEpisodes = comicEpisodes.filter((_, index) => index !== episodeIndex)
      const renumberedEpisodes = updatedEpisodes.map((episode, index) => ({
        ...episode,
        episodeNumber: index + 1,
        title: `${index + 1}화`,
      }))
      setComicEpisodes(renumberedEpisodes)

      if (currentEpisodeIndex >= renumberedEpisodes.length) {
        setCurrentEpisodeIndex(renumberedEpisodes.length - 1)
      }
    }
  }

  const updateEpisodeTitle = (title: string) => {
    const updatedEpisodes = comicEpisodes.map((episode, index) =>
      index === currentEpisodeIndex ? { ...episode, title } : episode,
    )
    setComicEpisodes(updatedEpisodes)
  }

  // Novel page management (기존 코드 유지)
  const addNovelPage = () => {
    const newPage: NovelPage = {
      id: Date.now().toString(),
      content: "",
      pageNumber: novelPages.length + 1,
    }
    setNovelPages([...novelPages, newPage])
    setCurrentPageIndex(novelPages.length)
  }

  const deleteNovelPage = (pageIndex: number) => {
    if (novelPages.length > 1) {
      const updatedPages = novelPages.filter((_, index) => index !== pageIndex)
      const renumberedPages = updatedPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1,
      }))
      setNovelPages(renumberedPages)

      if (currentPageIndex >= renumberedPages.length) {
        setCurrentPageIndex(renumberedPages.length - 1)
      }
    }
  }

  const updatePageContent = (content: string) => {
    const updatedPages = novelPages.map((page, index) => (index === currentPageIndex ? { ...page, content } : page))
    setNovelPages(updatedPages)
  }

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPageIndex < novelPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  const goToPreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1)
    }
  }

  const goToNextEpisode = () => {
    if (currentEpisodeIndex < comicEpisodes.length - 1) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !selectedType || !formData.genre) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목, 유형, 장르는 필수 항목입니다.",
        variant: "destructive",
      })
      return
    }

    if (selectedType === "novel" && novelPages.every((page) => !page.content.trim())) {
      toast({
        title: "소설 내용을 입력해주세요",
        description: "최소 한 페이지 이상의 내용이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    if (selectedType === "comic" && comicEpisodes.every((episode) => episode.imageUrls.length === 0)) {
      toast({
        title: "만화 이미지를 업로드해주세요",
        description: "최소 한 화 이상의 이미지가 필요합니다.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (!user || !user.uid) {
        throw new Error("로그인이 필요합니다.")
      }

      // 데이터 구조 변경: 중첩 배열 대신 단순 구조로 변경
      let novelContent = []
      let comicContent = []

      if (selectedType === "novel") {
        novelContent = novelPages
          .filter((page) => page.content.trim())
          .map((page) => ({
            id: page.id,
            content: page.content,
            pageNumber: page.pageNumber,
          }))
      } else if (selectedType === "comic") {
        comicContent = comicEpisodes
          .filter((episode) => episode.imageUrls.length > 0)
          .map((episode) => ({
            id: episode.id,
            title: episode.title,
            episodeNumber: episode.episodeNumber,
            imageUrls: episode.imageUrls,
          }))
      }

      const workData = {
        title: formData.title,
        type: selectedType,
        genre: formData.genre,
        ageRating: formData.ageRating,
        description: formData.description,
        tags,
        visibility: formData.visibility,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "익명",
        thumbnailUrl,
        novelContent: selectedType === "novel" ? novelContent : [],
        comicContent: selectedType === "comic" ? comicContent : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        likes: 0,
        likedBy: [],
      }

      const docRef = await addDoc(collection(db, "works"), workData)

      toast({
        title: "업로드 성공!",
        description: "작품이 성공적으로 업로드되었습니다.",
      })

      router.push(`/work/${docRef.id}`)
    } catch (error: any) {
      console.error("업로드 실패:", error)
      toast({
        title: "업로드 실패",
        description: error.message || "작품 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">작품 업로드</h1>
            <p className="text-muted-foreground">당신의 창작물을 CRAFIQ에 공유해보세요!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>작품의 기본 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">작품 제목 *</Label>
                      <Input
                        id="title"
                        placeholder="작품 제목을 입력하세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">작품 유형 *</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comic">만화</SelectItem>
                          <SelectItem value="novel">소설</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre">장르 *</Label>
                      <Select
                        value={formData.genre}
                        onValueChange={(value) => setFormData({ ...formData, genre: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="장르를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="space-y-2">
                      <Label htmlFor="age-rating">연령 등급</Label>
                      <Select
                        value={formData.ageRating}
                        onValueChange={(value) => setFormData({ ...formData, ageRating: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="연령 등급을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 이용가</SelectItem>
                          <SelectItem value="12">12세 이용가</SelectItem>
                          <SelectItem value="15">15세 이용가</SelectItem>
                          <SelectItem value="18">18세 이용가</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">작품 소개 *</Label>
                    <Textarea
                      id="description"
                      placeholder="작품에 대한 간단한 소개를 작성해주세요"
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>태그</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="태그를 입력하세요"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Upload */}
              {selectedType === "comic" && (
                <Card>
                  <CardHeader>
                    <CardTitle>만화 업로드 ({comicEpisodes.length}화)</CardTitle>
                    <CardDescription>화별로 만화를 업로드해주세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Episode Navigation */}
                      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousEpisode}
                          disabled={currentEpisodeIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          이전 화
                        </Button>

                        <div className="flex items-center gap-2">
                          <Input
                            value={comicEpisodes[currentEpisodeIndex]?.title || ""}
                            onChange={(e) => updateEpisodeTitle(e.target.value)}
                            className="w-32 text-center"
                          />
                          <Button variant="outline" size="sm" onClick={addComicEpisode}>
                            <Plus className="h-4 w-4 mr-1" />화 추가
                          </Button>
                          {comicEpisodes.length > 1 && (
                            <Button variant="outline" size="sm" onClick={() => deleteComicEpisode(currentEpisodeIndex)}>
                              <X className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextEpisode}
                          disabled={currentEpisodeIndex === comicEpisodes.length - 1}
                        >
                          다음 화
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      {/* Image URL Input */}
                      <div className="space-y-2">
                        <Label>이미지 URL 추가</Label>
                        <div className="flex gap-2">
                          <Button onClick={handleComicImageUrlAdd} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            이미지 URL 추가
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          외부 이미지 호스팅 서비스(imgur, postimages 등)에 이미지를 업로드하고 URL을 추가하세요.
                        </p>
                      </div>

                      {/* Uploaded Images */}
                      {comicEpisodes[currentEpisodeIndex]?.imageUrls.length > 0 && (
                        <div className="space-y-2">
                          <Label>업로드된 이미지 ({comicEpisodes[currentEpisodeIndex].imageUrls.length}개)</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {comicEpisodes[currentEpisodeIndex].imageUrls.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                                  <img
                                    src={imageUrl || "/placeholder.svg"}
                                    alt={`Page ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs mt-1 truncate">페이지 {index + 1}</p>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeComicImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Episode Preview */}
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {comicEpisodes.map((episode, index) => (
                          <div
                            key={episode.id}
                            className={`aspect-[3/4] border-2 rounded cursor-pointer p-2 text-xs overflow-hidden ${
                              index === currentEpisodeIndex
                                ? "border-primary bg-primary/10"
                                : "border-muted hover:border-primary/50"
                            }`}
                            onClick={() => setCurrentEpisodeIndex(index)}
                          >
                            <div className="text-center font-medium mb-1">{episode.title}</div>
                            <div className="text-muted-foreground text-center">
                              {episode.imageUrls.length > 0 ? `${episode.imageUrls.length}장` : "빈 화"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedType === "novel" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      소설 작성 ({novelPages.length}페이지)
                    </CardTitle>
                    <CardDescription>책처럼 페이지별로 소설을 작성해보세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Page Navigation */}
                      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPageIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          이전 페이지
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {currentPageIndex + 1} / {novelPages.length} 페이지
                          </span>
                          <Button variant="outline" size="sm" onClick={addNovelPage}>
                            <Plus className="h-4 w-4 mr-1" />
                            페이지 추가
                          </Button>
                          {novelPages.length > 1 && (
                            <Button variant="outline" size="sm" onClick={() => deleteNovelPage(currentPageIndex)}>
                              <X className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPageIndex === novelPages.length - 1}
                        >
                          다음 페이지
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      {/* Page Content Editor */}
                      <div className="border rounded-lg p-4 min-h-[400px] bg-white dark:bg-gray-950">
                        <div className="mb-4 pb-2 border-b">
                          <h3 className="font-medium">페이지 {currentPageIndex + 1}</h3>
                        </div>
                        <Textarea
                          placeholder="이 페이지의 내용을 작성하세요..."
                          className="min-h-[300px] border-0 p-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
                          value={novelPages[currentPageIndex]?.content || ""}
                          onChange={(e) => updatePageContent(e.target.value)}
                        />
                      </div>

                      {/* Page Preview */}
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {novelPages.map((page, index) => (
                          <div
                            key={page.id}
                            className={`aspect-[3/4] border-2 rounded cursor-pointer p-2 text-xs overflow-hidden ${
                              index === currentPageIndex
                                ? "border-primary bg-primary/10"
                                : "border-muted hover:border-primary/50"
                            }`}
                            onClick={() => setCurrentPageIndex(index)}
                          >
                            <div className="text-center font-medium mb-1">P.{page.pageNumber}</div>
                            <div className="text-muted-foreground line-clamp-6">{page.content || "빈 페이지"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>썸네일</CardTitle>
                  <CardDescription>작품을 대표할 이미지 URL을 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="thumbnailUrl">썸네일 URL</Label>
                      <Input
                        id="thumbnailUrl"
                        placeholder="https://example.com/image.jpg"
                        value={thumbnailUrl}
                        onChange={handleThumbnailUrlChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        외부 이미지 호스팅 서비스(imgur, postimages 등)에 이미지를 업로드하고 URL을 입력하세요.
                      </p>
                    </div>

                    {thumbnailUrl && (
                      <div className="aspect-[3/4] border rounded-lg overflow-hidden">
                        <img
                          src={thumbnailUrl || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>발행 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibility">공개 설정</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">전체 공개</SelectItem>
                        <SelectItem value="unlisted">링크로만 공개</SelectItem>
                        <SelectItem value="private">비공개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        작품 업로드
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
