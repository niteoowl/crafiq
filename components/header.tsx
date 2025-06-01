"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, Bookmark, History, Upload, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("로그아웃 실패:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            CRAFIQ
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/comics" className="text-sm font-medium hover:text-primary transition-colors">
            만화
          </Link>
          <Link href="/novels" className="text-sm font-medium hover:text-primary transition-colors">
            소설
          </Link>
          <Link href="/rankings" className="text-sm font-medium hover:text-primary transition-colors">
            랭킹
          </Link>
          <Link href="/new" className="text-sm font-medium hover:text-primary transition-colors">
            신작
          </Link>
          <Link href="/completed" className="text-sm font-medium hover:text-primary transition-colors">
            완결작
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="작품을 검색하세요..." className="pl-10 pr-4" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
          </Button>

          {user && (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/library">
                  <Bookmark className="h-5 w-5" />
                </Link>
              </Button>

              <Button asChild className="hidden sm:flex">
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  업로드
                </Link>
              </Button>
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/library" className="flex items-center">
                    <Bookmark className="mr-2 h-4 w-4" />내 서재
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    시청 기록
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/upload" className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    업로드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/register">회원가입</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link href="/comics" className="text-lg font-medium hover:text-primary transition-colors">
                  만화
                </Link>
                <Link href="/novels" className="text-lg font-medium hover:text-primary transition-colors">
                  소설
                </Link>
                <Link href="/rankings" className="text-lg font-medium hover:text-primary transition-colors">
                  랭킹
                </Link>
                <Link href="/new" className="text-lg font-medium hover:text-primary transition-colors">
                  신작
                </Link>
                <Link href="/completed" className="text-lg font-medium hover:text-primary transition-colors">
                  완결작
                </Link>
                {user && (
                  <Button asChild className="w-full mt-4">
                    <Link href="/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      업로드
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="lg:hidden border-t p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="작품을 검색하세요..." className="pl-10 pr-4" />
          </div>
        </div>
      )}
    </header>
  )
}
