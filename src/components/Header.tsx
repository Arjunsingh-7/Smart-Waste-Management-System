"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, Recycle, Menu, X, BookOpen } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

// Memoized navigation link component with enhanced hover effects
const NavLink = memo(({ href, isActive, children, onClick }: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    prefetch={isActive ? true : false}
    className={`text-sm font-medium transition-all duration-200 relative z-[10000] px-3 py-2 rounded-lg ${
      isActive
        ? "text-primary font-bold bg-primary/10"
        : "text-foreground/80 hover:text-primary hover:bg-primary/5"
    }`}
  >
    {children}
    {isActive && (
      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
    )}
  </Link>
));
NavLink.displayName = "NavLink";

// Memoized theme toggle button
const ThemeToggle = memo(({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={toggleTheme}
    className="rounded-full hover:bg-accent"
  >
    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    <span className="sr-only">Toggle theme</span>
  </Button>
));
ThemeToggle.displayName = "ThemeToggle";

export const Header = memo(function Header() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  // Optimized scroll handler with RAF and throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const isLoggedIn = !isPending && !!session?.user;

  // Memoize navigation links based on auth state
  // While session is loading, use the appropriate links based on current path
  // to avoid flickering between public/dashboard nav
  const isDashboardPath = pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/devices") ||
    pathname?.startsWith("/analytics") ||
    pathname?.startsWith("/collections") ||
    pathname?.startsWith("/notifications") ||
    pathname?.startsWith("/myaccount");

  const navLinks = useMemo(() => {
    // During loading, infer nav from path to prevent flicker
    const showDashboardNav = isLoggedIn || (isPending && isDashboardPath);
    return showDashboardNav
      ? [
          { name: "Dashboard", href: "/dashboard" },
          { name: "Devices", href: "/devices" },
          { name: "Analytics", href: "/analytics" },
          { name: "Collections", href: "/collections" },
          { name: "Notifications", href: "/notifications" },
        ]
      : [
          { name: "Home", href: "/" },
          { name: "Pricing", href: "/pricing" },
          { name: "Hardware Guide", href: "/hardware-guide" },
          { name: "Support", href: "/support" },
        ];
  }, [isLoggedIn, isPending, isDashboardPath]);

  // Memoize active link check
  const isActiveLink = useCallback((href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname?.startsWith(href)) return true;
    return false;
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-200 ${
        isScrolled ? "glass shadow-lg bg-background/80 backdrop-blur-xl" : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            href={(isLoggedIn || (isPending && isDashboardPath)) ? "/dashboard" : "/"} 
            className="flex items-center gap-2 sm:gap-3 relative z-[10000] hover:scale-105 transition-transform"
            prefetch={true}
          >
            <div className="bg-primary rounded-full p-2 sm:p-2.5">
              <Recycle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">Waste Wizard</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                href={link.href}
                isActive={isActiveLink(link.href)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 relative z-[10000]">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            
            {isLoggedIn ? (
              <Link href="/myaccount" prefetch={false}>
                <Button className="text-sm bg-primary hover:bg-primary/90 transition-all hover:scale-105">My Account</Button>
              </Link>
            ) : isPending && isDashboardPath ? (
              // Skeleton placeholder while loading on dashboard routes
              <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
            ) : (
              <>
                <Link href="/login" prefetch={false}>
                  <Button variant="ghost" className="text-sm hover:bg-accent transition-all">
                    Login
                  </Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button className="text-sm bg-primary hover:bg-primary/90 transition-all hover:scale-105">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2 relative z-[10000]">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className="rounded-full"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass rounded-2xl mt-2 mb-4 p-4 shadow-xl animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-background/95 backdrop-blur-xl relative z-[10000]">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  href={link.href}
                  isActive={isActiveLink(link.href)}
                  onClick={handleMenuClose}
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {isLoggedIn ? (
                  <Link href="/myaccount" onClick={handleMenuClose} prefetch={false}>
                    <Button className="w-full bg-primary hover:bg-primary/90">My Account</Button>
                  </Link>
                ) : isPending && isDashboardPath ? (
                  <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
                ) : (
                  <>
                    <Link href="/login" onClick={handleMenuClose} prefetch={false}>
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={handleMenuClose} prefetch={false}>
                      <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});