import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  PieChart,
  Shield,
  FileText,
  FileSymlink,
  Link as LinkIcon,
  HelpCircle,
  Settings,
} from "lucide-react";

export default function NavigationMenu() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      name: "Tableau de bord",
      path: "/",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      name: "Évaluation Cyber",
      path: "/assessment",
      icon: <PieChart className="mr-3 h-5 w-5" />,
    },
    {
      name: "Protection (NDR)",
      path: "/protection",
      icon: <Shield className="mr-3 h-5 w-5" />,
    },
    {
      name: "Continuité d'Activité",
      path: "/continuity",
      icon: <FileText className="mr-3 h-5 w-5" />,
    },
    {
      name: "Rapports",
      path: "/reports",
      icon: <FileSymlink className="mr-3 h-5 w-5" />,
    },
    {
      name: "Paramètres",
      path: "/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ];

  const resourceItems = [
    {
      name: "Centre ANSSI",
      path: "https://www.ssi.gouv.fr/",
      icon: <LinkIcon className="mr-3 h-5 w-5" />,
      external: true,
    },
    {
      name: "Centre d'aide",
      path: "/help",
      icon: <HelpCircle className="mr-3 h-5 w-5" />,
    },
  ];

  return (
    <nav className="p-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive(item.path)
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.icon}
              {item.name}
            </a>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Ressources
        </h3>
        <div className="mt-2 space-y-1">
          {resourceItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {item.icon}
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
