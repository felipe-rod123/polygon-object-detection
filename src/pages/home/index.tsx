import '../../index.css';
import Features from './components/features-section';
import Footer from './components/footer';
import GithubSection from './components/github-section';
import Header from './components/header';
import Hero from './components/hero-section';

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Header />
        <main>
          <Hero />
          <Features />
          <GithubSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
