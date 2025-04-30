
import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        {children}
      </main>
      <footer className="bg-gray-50 border-t py-4 px-6 text-center text-sm text-gray-500">
        ResuMatch &copy; {new Date().getFullYear()} - Smart Resume Selection Platform
      </footer>
    </div>
  );
}
