import React, { useState } from 'react';
import { IconButton } from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionIconButton = motion(IconButton);

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    // Toggle body class for theme switching
    document.body.classList.toggle('dark-theme');
  };

  return (
    <MotionIconButton
      aria-label="Toggle theme"
      onClick={toggleTheme}
      position="absolute"
      top="20px"
      right="20px"
      zIndex="10"
      borderRadius="full"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </MotionIconButton>
  );
};

export default ThemeToggle;
