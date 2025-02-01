import { GithubIcon } from 'lucide-react';
import type React from 'react';

const GithubSection: React.FC = () => {
  return (
    <section
      id="github"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900"
    >
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          Open Source Innovation
        </h2>
        <p className="text-xl text-zinc-600 mb-12 max-w-2xl mx-auto dark:text-zinc-400">
          Polygon thrives on community collaboration. Join us in pushing the
          boundaries of semantic segmentation technology.
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-main-700 hover:bg-main-800 text-white px-8 py-4 text-lg inline-flex items-center rounded-md dark:bg-main-600 dark:hover:bg-main-700"
        >
          <GithubIcon className="mr-2 h-6 w-6" />
          Explore on GitHub
        </a>
      </div>
    </section>
  );
};

export default GithubSection;
