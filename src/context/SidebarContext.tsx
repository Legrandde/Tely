import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpenMobile,
        setIsOpenMobile,
        toggleMobile: () => setIsOpenMobile((prev) => !prev),
        closeMobile: () => setIsOpenMobile(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    return {
      isOpenMobile: false,
      setIsOpenMobile: () => {},
      toggleMobile: () => {},
      closeMobile: () => {},
    };
  }
  return ctx;
}
