import { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractDomain } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WebsiteSelectorProps {
  selectedWebsite: string | null;
  websites: string[];
  onSelectWebsite: (website: string) => void;
  isLoading?: boolean;
}

export default function WebsiteSelector({
  selectedWebsite,
  websites,
  onSelectWebsite,
  isLoading = false,
}: WebsiteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle website selection
  const handleSelectWebsite = (website: string) => {
    onSelectWebsite(website);
    setIsOpen(false);
  };

  // Display user-friendly domain name
  const getDisplayName = (url: string) => {
    return extractDomain(url);
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm text-gray-600">Website:</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-60 justify-between"
            role="combobox"
            aria-expanded={isOpen}
          >
            {selectedWebsite ? getDisplayName(selectedWebsite) : "Select website"}
            <svg 
              className="h-5 w-5 text-gray-400 ml-2" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-0">
          <div className="py-1">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading websites...
              </div>
            ) : websites.length > 0 ? (
              websites.map((website, index) => (
                <button
                  key={index}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  onClick={() => handleSelectWebsite(website)}
                >
                  {getDisplayName(website)}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No websites available from Search Console
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
