import { Link, useLocation } from "wouter";
import UserMenu from "./user-menu";
import NavigationMenu from "./navigation-menu";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-neutral-200 shadow-sm overflow-y-auto">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <div className="quantum-gradient h-10 w-10 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <circle cx="12" cy="8" r="2"></circle>
            </svg>
          </div>
          <span className="text-lg font-bold text-neutral-900">QuantumEyes</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu />

      {/* User Menu */}
      <div className="mt-auto p-4 border-t border-neutral-200">
        <UserMenu />
      </div>
    </aside>
  );
}
