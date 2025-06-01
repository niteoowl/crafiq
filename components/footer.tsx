import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CRAFIQ
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">최고의 만화와 소설을 언제 어디서나. 무제한으로 즐기세요.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold mb-4">둘러보기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/comics" className="text-muted-foreground hover:text-primary">
                  만화
                </Link>
              </li>
              <li>
                <Link href="/novels" className="text-muted-foreground hover:text-primary">
                  소설
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="text-muted-foreground hover:text-primary">
                  랭킹
                </Link>
              </li>
              <li>
                <Link href="/new" className="text-muted-foreground hover:text-primary">
                  신작
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold mb-4">인기 장르</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/genre/fantasy" className="text-muted-foreground hover:text-primary">
                  판타지
                </Link>
              </li>
              <li>
                <Link href="/genre/action" className="text-muted-foreground hover:text-primary">
                  액션
                </Link>
              </li>
              <li>
                <Link href="/genre/romance" className="text-muted-foreground hover:text-primary">
                  로맨스
                </Link>
              </li>
              <li>
                <Link href="/genre/martial-arts" className="text-muted-foreground hover:text-primary">
                  무협
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 CRAFIQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
