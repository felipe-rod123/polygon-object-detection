import { Box } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router';
import ThemeSwitchButton from '../../components/theme-switch-button';
import { Button } from '../../components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-zinc-300 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex flex-row justify-center items-center text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          <Box
            className="mr-0.5 text-main-700 dark:text-main-300"
            strokeWidth={3}
          />
          polygon
        </div>
        <nav className="hidden md:flex space-x-8">
          <a
            href="#features"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Features
          </a>
          <a
            href="#github"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            GitHub
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeSwitchButton />
          <Link to="/draw">
            <Button
              variant="default"
              className="px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
            >
              Draw
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
