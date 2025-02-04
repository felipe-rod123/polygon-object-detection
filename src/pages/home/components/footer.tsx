import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
      <div className="container mx-auto text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          © {new Date().getFullYear()} Polygon. Advancing the future of
          computer vision.
        </p>

        <p className="text-sm mt-4 text-zinc-900 dark:text-zinc-50">
          This project was created by Felipe Rodrigues as part of a take-home
          frontend case.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
