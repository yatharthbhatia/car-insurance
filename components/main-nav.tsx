"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Shield, FileText, PlusCircle, Search, LayoutDashboard, ChevronDown } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/register",
      label: "New Claim",
      icon: <PlusCircle className="h-4 w-4 mr-2" />,
      active: pathname === "/register",
    },
    {
      href: "/history",
      label: "Claims History",
      icon: <FileText className="h-4 w-4 mr-2" />,
      active: pathname === "/history",
    },
    {
      href: "/search",
      label: "Search",
      icon: <Search className="h-4 w-4 mr-2" />,
      active: pathname === "/search",
    },
  ]

  return (
    <div className="border-b bg-background">
      <div className="container flex flex-col md:flex-row h-auto md:h-16 items-center justify-center px-4">
        <div className="mx-auto flex">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">InsureClaim</span>
          </Link>
        </div>
        <button
          className="md:hidden flex items-center space-x-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="text-xl text-slate-500 font-bold">Menu</span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
        <nav
          className={`flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 flex-1 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}
        >
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                route.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
