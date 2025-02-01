import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-200">
      <div className="container mx-auto text-center">
        <p className="text-sm text-zinc-600">
          © {new Date().getFullYear()} Polygon. Advancing the future of
          computer vision.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
