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

      {/* Security Status Sub-bar */}
      <div className={`border-t py-2 px-6 ${theme === "dark" ? "border-gray-800" : "border-gray-150"}`}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Welcome back, SecOps Admin</span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Status: Secure
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last Scan: <strong className={`font-mono font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>2 mins ago</strong></span>
            <span className="text-gray-600">|</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase tracking-wider text-[9px]">Org Rating: A+ Compliance</span>
          </div>
        </div>
      </div>
    </header>
  );
}
