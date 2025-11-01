"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Settings, User, Star, Gift, HelpCircle, LogOut } from "lucide-react";

const MENU_ITEMS = {
  profile: [
    { icon: User, label: "Your profile", action: "profile" },
    { icon: Settings, label: "Settings", action: "settings" }
  ],
  premium: [
    { 
      icon: Star, 
      label: "Upgrade to Premium", 
      action: "upgrade",
      iconClass: "text-amber-600",
      badge: { text: "Early Adopter", className: "bg-amber-600 text-white text-[11px]" }
    },
    { icon: Gift, label: "Referrals", action: "referrals" },
    { 
      icon: HelpCircle, 
      label: "Support", 
      action: "help"
    }
  ],
  account: [
    { icon: LogOut, label: "Log out", action: "logout" }
  ]
};

interface UserDropdownProps {
  user?: {
    name: string;
    username: string;
    avatar?: string;
    initials: string;
    tier: 'free' | 'premium' | 'business';
  };
  onAction?: (action: string) => void;
}

export const UserDropdown = ({ 
  user = {
    name: "User",
    username: "@user",
    avatar: "",
    initials: "U",
    tier: "free"
  },
  onAction = () => {}
}: UserDropdownProps) => {
  const renderMenuItem = (item: any, index: number) => {
    const IconComponent = item.icon;
    
    return (
      <DropdownMenuItem 
        key={index}
        className={cn(item.badge ? "justify-between" : "", "p-2 rounded-lg cursor-pointer")}
        onClick={() => onAction(item.action)}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <IconComponent
            className={`size-5 ${item.iconClass || "text-gray-500 dark:text-gray-400"}`}
          />
          {item.label}
        </span>
        {item.badge && (
          <Badge className={item.badge.className}>
            {item.badge.text}
          </Badge>
        )}
      </DropdownMenuItem>
    );
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { text: "Free", className: "bg-gray-100 text-gray-700" },
      premium: { text: "Premium", className: "bg-emerald-100 text-emerald-700" },
      business: { text: "Business", className: "bg-blue-100 text-blue-700" }
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  const tierBadge = getTierBadge(user.tier);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-10 border border-white shadow-sm hover:shadow-md transition-shadow">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[310px] rounded-2xl bg-white p-0" align="end">
        <section className="bg-white rounded-2xl p-1 shadow border border-gray-200">
          <div className="flex items-center p-3">
            <div className="flex-1 flex items-center gap-3">
              <Avatar className="size-12 border border-gray-200">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">{user.name}</h3>
                <p className="text-gray-500 text-xs">{user.username}</p>
                <Badge className={`${tierBadge.className} border-[0.5px] text-[11px] rounded-sm mt-1`}>
                  {tierBadge.text}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {MENU_ITEMS.profile.map(renderMenuItem)}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {MENU_ITEMS.premium.map(renderMenuItem)}
          </DropdownMenuGroup>
        </section>

        <section className="mt-1 p-1 rounded-2xl">
          <DropdownMenuGroup>
            {MENU_ITEMS.account.map(renderMenuItem)}
          </DropdownMenuGroup>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
