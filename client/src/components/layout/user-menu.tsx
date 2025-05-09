import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { user, isAuthenticated } = useAuth();

  // Fonction pour générer des initiales à partir du nom
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => window.location.href = "/api/login"}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Se connecter
        </Button>
      </div>
    );
  }

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email
    ? user.email.split("@")[0]
    : "Utilisateur";

  const initials = getInitials(displayName);
  const role = "Client";

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {user?.profileImageUrl ? (
          <img 
            src={user.profileImageUrl} 
            alt={displayName}
            className="h-9 w-9 rounded-full"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
            {initials}
          </div>
        )}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-neutral-900">{displayName}</p>
        <p className="text-xs text-neutral-500">{role}</p>
      </div>
      <a 
        href="/api/logout" 
        className="ml-auto text-neutral-500 hover:text-neutral-700"
      >
        <LogOut className="h-5 w-5" />
      </a>
    </div>
  );
}
