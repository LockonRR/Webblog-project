import React, { useEffect, useState } from "react";

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "system"
    );

    const setDarkClass = (newTheme) => {
        const isDark =
            newTheme === "dark" ||
            (newTheme === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDark);
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                setDarkClass("system");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center p-1 space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button
                    onClick={() => setDarkClass("light")}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                        theme === "light"
                            ? "bg-white text-gray-800"
                            : "text-gray-500 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-600"
                    }`}
                >
                    Light
                </button>
                <button
                    onClick={() => setDarkClass("dark")}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                        theme === "dark"
                            ? "bg-gray-900 text-white"
                            : "text-gray-500 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-600"
                    }`}
                >
                    Dark
                </button>
                <button
                    onClick={() => setDarkClass("system")}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                        theme === "system"
                            ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                            : "text-gray-500 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-600"
                    }`}
                >
                    System
                </button>
            </div>
        </div>
    );
};

export default ThemeSwitcher;
