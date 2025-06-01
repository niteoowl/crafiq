import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Zap, Heart, Sword, Rocket, Ghost } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    name: "판타지",
    icon: Sword,
    count: "1,234",
    color: "from-purple-500 to-purple-600",
    description: "마법과 모험이 가득한 세계",
  },
  {
    name: "로맨스",
    icon: Heart,
    count: "856",
    color: "from-pink-500 to-rose-600",
    description: "설레는 사랑 이야기",
  },
  {
    name: "액션",
    icon: Zap,
    count: "967",
    color: "from-orange-500 to-red-600",
    description: "스릴 넘치는 액션",
  },
  {
    name: "SF",
    icon: Rocket,
    count: "543",
    color: "from-blue-500 to-cyan-600",
    description: "미래와 과학의 세계",
  },
  {
    name: "호러",
    icon: Ghost,
    count: "321",
    color: "from-gray-700 to-gray-900",
    description: "오싹한 공포 이야기",
  },
  {
    name: "일상",
    icon: BookOpen,
    count: "789",
    color: "from-green-500 to-emerald-600",
    description: "따뜻한 일상의 이야기",
  },
]

export default function Categories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">장르별 탐색</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">다양한 장르의 작품들을 만나보세요</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.name} href={`/category/${category.name}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                    <p className="text-xs font-medium text-primary">{category.count}개 작품</p>
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
