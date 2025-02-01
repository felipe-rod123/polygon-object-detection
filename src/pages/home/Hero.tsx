import { ArrowRight } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

const Hero: React.FC = () => {
  return (
    <section className="py-20 px-8 sm:px-10 lg:px-12 bg-zinc-50">
      <div className="container mx-auto text-left">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-zinc-900 mb-6 leading-tight">
          Semantic segmentation,
          <br />
          <span className="text-main-700">redefined</span>
        </h1>
        <p className="text-xl text-zinc-600 mb-12 max-w-2xl">
          Empower your AI vision projects with Polygon's
          cutting-edge labeling tool. Precision meets efficiency in every
          annotation.
        </p>
        <div className="flex justify-start space-x-4 items-center">
          <Link to="/draw">
            <Button
              size="lg"
              variant="default"
              className="px-8 py-6 text-lg bg-main-700 hover:bg-main-800 border-none text-zinc-50"
            >
              Get started
              <ArrowRight />
            </Button>
          </Link>

          <Button
            size="lg"
            variant="link"
            className="text-zinc-800 text-lg underline"
            onClick={() => {
              const featuresSection = document.getElementById('features');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Learn more
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
