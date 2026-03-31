import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren
} from "react";

type ThemeMode = "light" | "dark";

interface UIContextValue {
    theme: ThemeMode;
    isDesktop: boolean;
    mobileSidebarOpen: boolean;
    desktopSidebarExpanded: boolean;
    toggleTheme: () => void;
    toggleMobileSidebar: () => void;
    closeMobileSidebar: () => void;
    toggleDesktopSidebar: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);
const THEME_STORAGE_KEY = "fund-me:theme";
const SIDEBAR_STORAGE_KEY = "fund-me:desktop-sidebar-expanded";
const DESKTOP_MEDIA = "(min-width: 1080px)";

function getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
}

export function UIProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(() => {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        return stored !== "false";
    });
    const [isDesktop, setIsDesktop] = useState(window.matchMedia(DESKTOP_MEDIA).matches);

    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(desktopSidebarExpanded));
    }, [desktopSidebarExpanded]);

    useEffect(() => {
        const media = window.matchMedia(DESKTOP_MEDIA);

        const handleChange = (event: MediaQueryListEvent) => {
            setIsDesktop(event.matches);
            if (event.matches) {
                setMobileSidebarOpen(false);
            }
        };

        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    }, []);

    const toggleMobileSidebar = useCallback(() => {
        setMobileSidebarOpen((current) => !current);
    }, []);

    const closeMobileSidebar = useCallback(() => {
        setMobileSidebarOpen(false);
    }, []);

    const toggleDesktopSidebar = useCallback(() => {
        setDesktopSidebarExpanded((current) => !current);
    }, []);

    const value = useMemo(() => ({
        theme,
        isDesktop,
        mobileSidebarOpen,
        desktopSidebarExpanded,
        toggleTheme,
        toggleMobileSidebar,
        closeMobileSidebar,
        toggleDesktopSidebar
    }), [
        closeMobileSidebar,
        desktopSidebarExpanded,
        isDesktop,
        mobileSidebarOpen,
        theme,
        toggleDesktopSidebar,
        toggleMobileSidebar,
        toggleTheme
    ]);

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
    const context = useContext(UIContext);

    if (!context) {
        throw new Error("useUI must be used inside UIProvider.");
    }

    return context;
}
