import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

const ThemeSwitchButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button
      variant="default"
      className="px-3 bg-zinc-100 rounded-full hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <Sun className="text-zinc-200" />
      ) : (
        <Moon className="text-zinc-800" />
      )}
    </Button>
  );
};

export default ThemeSwitchButton;
