import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

const ThemeSwitchButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
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
