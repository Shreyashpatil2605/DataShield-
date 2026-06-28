import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

export default function DashboardHeader() {
  const { theme } = useTheme();

  return (
    <header
      className={`border-b transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1
            className={`text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            DataShield
          </h1>
          <nav className="hidden md:flex gap-6">
            <button
              className={`font-medium ${
                theme === "dark"
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
