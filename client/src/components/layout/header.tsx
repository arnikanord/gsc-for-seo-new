import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import WebsiteSelector from "@/components/website-selector";

interface HeaderProps {
  selectedWebsite: string | null;
  setSelectedWebsite: (website: string | null) => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/keywords": "Keywords",
  "/performance": "Performance",
  "/settings": "Settings",
};

export default function Header({ selectedWebsite, setSelectedWebsite }: HeaderProps) {
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  // Get website list
  const { data: sitesData } = useQuery({
    queryKey: ["/api/search-console/sites"],
    enabled: !!selectedWebsite,
  });

  // Set page title based on current location
  useEffect(() => {
    setPageTitle(pageTitles[location] || "Dashboard");
  }, [location]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold font-display text-gray-900">
              {pageTitle}
            </h1>
          </div>

          {/* Website Selector */}
          <div className="flex items-center">
            {selectedWebsite && (
              <WebsiteSelector
                selectedWebsite={selectedWebsite}
                websites={sitesData?.sites || []}
                onSelectWebsite={setSelectedWebsite}
              />
            )}
          </div>

          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
