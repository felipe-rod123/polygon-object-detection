import '../../index.css';
import Features from './Features';
import Footer from './Footer';
import GithubSection from './GithubSection';
import Header from './Header';
import Hero from './Hero';

function Home() {
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

export default Home;
