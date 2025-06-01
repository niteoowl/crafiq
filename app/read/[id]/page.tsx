"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, Share2, Heart, MessageCircle, Send } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Work {
  id: string
  title: string
  description: string
  genre: string
  type: string
  thumbnailUrl: string
  authorName: string
  authorId: string
  views: number
  likes: number
  likedBy: string[]
  contentUrls: string[]
  novelContent: Array<{ id: string; content: string; pageNumber: number }>
}

interface Comment {
  id: string
  content: string
  authorName: string
  authorId: string
  createdAt: any
}

export default function ReadPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const fetchWork = async () => {
      if (!params?.id) return

      try {
        const workDoc = await getDoc(doc(db, "works", params.id as string))
        if (workDoc.exists()) {
          const workData = { id: workDoc.id, ...workDoc.data() } as Work
          setWork(workData)

          // Check if user liked this work
          if (user && workData.likedBy?.includes(user.uid)) {
            setIsLiked(true)
          }

          // Increment view count
          await updateDoc(doc(db, "works", params.id as string), {
            views: increment(1),
          })
        }
      } catch (error) {
        console.error("Work fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWork()
  }, [params?.id, user])

  useEffect(() => {
    const fetchComments = async () => {
      if (!params?.id) return

      try {
        const q = query(collection(db, "works", params.id as string, "comments"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
        setComments(commentsData)
      } catch (error) {
        console.error("Comments fetch error:", error)
      }
    }

    fetchComments()
  }, [params?.id])

  const handleLike = async () => {
    if (!user || !work) return

    try {
      const workRef = doc(db, "works", work.id)

      if (isLiked) {
        await updateDoc(workRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid),
        })
        setIsLiked(false)
      } else {
        await updateDoc(workRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid),
        })
        setIsLiked(true)
      }
    } catch (error) {
      console.error("Like error:", error)
    }
  }

  const handleComment = async () => {
    if (!user || !work || !newComment.trim()) return

    try {
      await addDoc(collection(db, "works", work.id, "comments"), {
        content: newComment.trim(),
        authorName: user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      })

      setNewComment("")

      // Refresh comments
      const q = query(collection(db, "works", work.id, "comments"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
      setComments(commentsData)
    } catch (error) {
      console.error("Comment error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>작품을 찾을 수 없습니다.</div>
      </div>
    )
  }

  const isNovel = work.type === "novel"
  const totalPages = isNovel ? work.novelContent?.length || 0 : work.contentUrls?.length || 0

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-800">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/works">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">{work.title}</h1>
                <p className="text-sm text-gray-400">
                  {currentPage + 1} / {totalPages} {isNovel ? "페이지" : "화"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? "text-yellow-400" : ""}
              >
                <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowComments(!showComments)}>
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showComments ? "mr-80" : ""}`}>
          {/* Reader */}
          <div className="relative min-h-screen">
            {isNovel ? (
              // Novel Reader
              <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white text-black rounded-lg p-8 min-h-[80vh]">
                  <div className="mb-6 text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">{work.title}</h2>
                    <p className="text-gray-600">페이지 {currentPage + 1}</p>
                  </div>
                  <div className="prose prose-lg max-w-none leading-relaxed whitespace-pre-wrap">
                    {work.novelContent?.[currentPage]?.content || "내용이 없습니다."}
                  </div>
                </div>
              </div>
            ) : (
              // Comic Reader
              <div className="flex items-center justify-center min-h-screen p-4">
                <img
                  src={work.contentUrls?.[currentPage] || "/placeholder.svg?height=800&width=600"}
                  alt={`${work.title} ${currentPage + 1}화`}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              </div>
            )}

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex pointer-events-none">
              <button
                className="flex-1 hover:bg-black/20 transition-colors pointer-events-auto"
                onClick={goToPreviousPage}
                disabled={currentPage <= 0}
              />
              <button
                className="flex-1 hover:bg-black/20 transition-colors pointer-events-auto"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
              />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="sticky bottom-0 bg-black/90 backdrop-blur border-t border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={goToPreviousPage} disabled={currentPage <= 0}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {user && (
                  <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? "text-red-400" : ""}>
                    <Heart className="h-4 w-4 mr-2" fill={isLiked ? "currentColor" : "none"} />
                    좋아요 {work.likes || 0}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  댓글 {comments.length}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>
                  {currentPage + 1}
                  {isNovel ? "페이지" : "화"}
                </span>
                <span>
                  {totalPages}
                  {isNovel ? "페이지" : "화"}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="fixed right-0 top-16 bottom-0 w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">댓글 ({comments.length})</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowComments(false)}>
                  닫기
                </Button>
              </div>

              {/* Add Comment */}
              {user && (
                <div className="mb-6 space-y-2">
                  <Textarea
                    placeholder="댓글을 작성하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button size="sm" onClick={handleComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    댓글 작성
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{comment.authorName}</span>
                        <span className="text-xs text-gray-400">
                          {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString("ko-KR") : "방금"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}

                {comments.length === 0 && (
                  <div className="text-center text-gray-400 py-8">첫 번째 댓글을 작성해보세요!</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
