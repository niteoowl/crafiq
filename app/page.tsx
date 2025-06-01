import Header from "@/components/header"
import Hero from "@/components/hero"
import RecommendedWorks from "@/components/recommended-works"
import NewReleases from "@/components/new-releases"
import PopularWorks from "@/components/popular-works"
import GenreSection from "@/components/genre-section"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <RecommendedWorks />
        <NewReleases />
        <PopularWorks />
        <GenreSection />
      </main>
      <Footer />
    </div>
  )
}
