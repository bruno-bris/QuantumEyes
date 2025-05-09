import { useLocation } from "wouter";
import { Menu, Bell, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  // Get page title based on current location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Tableau de Bord";
      case "/assessment":
        return "Évaluation Cyber";
      case "/protection":
        return "Protection (NDR)";
      case "/continuity":
        return "Continuité d'Activité";
      case "/reports":
        return "Rapports";
      case "/settings":
        return "Paramètres";
      default:
        return "QuantumEyes";
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-neutral-600"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-3 lg:hidden">
            <div className="flex items-center">
              <div className="quantum-gradient h-8 w-8 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="ml-2 text-neutral-900 font-semibold">QuantumEyes</span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 lg:px-0 flex justify-end sm:justify-between">
          <div className="hidden sm:block">
            <h1 className="text-2xl font-semibold text-neutral-900">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center p-2 rounded-full hover:bg-neutral-100"
              >
                <Bell className="h-6 w-6 text-neutral-600" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center p-2 rounded-full hover:bg-neutral-100"
              >
                <Search className="h-6 w-6 text-neutral-600" />
              </Button>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center p-2 rounded-full hover:bg-neutral-100"
              >
                <MoreVertical className="h-6 w-6 text-neutral-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
