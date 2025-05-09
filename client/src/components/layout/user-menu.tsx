import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function UserMenu() {
  const { data } = useQuery({
    queryKey: ['/api/user'],
    staleTime: Infinity,
  });

  const user = data?.user || {
    name: "Entreprise Client",
    role: "Admin",
    initials: "EC"
  };

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          {user.initials}
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-neutral-900">{user.name}</p>
        <p className="text-xs text-neutral-500">{user.role}</p>
      </div>
      <button className="ml-auto text-neutral-500 hover:text-neutral-700">
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
