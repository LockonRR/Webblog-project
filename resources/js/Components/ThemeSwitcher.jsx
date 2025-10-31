import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme;
        }
        // If no theme is saved, check system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    const themes = ["light", "dark", "system"];

    const handleThemeChange = (newTheme) => {
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    };

    useEffect(() => {
        const isDark =
            theme === "dark" ||
            (theme === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDark);

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            if (theme === "system") {
                document.documentElement.classList.toggle("dark", e.matches);
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const toggleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        handleThemeChange(themes[nextIndex]);
    };

    const ThemeIcon = () => {
        if (theme === "light") return <Sun className="w-5 h-5" />;
        if (theme === "dark") return <Moon className="w-5 h-5" />;
        return <Monitor className="w-5 h-5" />;
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Switch to ${
                    themes[(themes.indexOf(theme) + 1) % themes.length]
                } theme`}
            >
                <ThemeIcon />
            </button>
        </div>
    );
};

export default ThemeSwitcher;
