import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define the valid theme values.
type Theme = "light" | "dark" | "auto";

// This interface defines the shape of the context that will be exposed by ThemeProvider.
interface ThemeContextType {
  /**
   * The currently selected theme. Possible values are "light", "dark" or "auto".
   */
  theme: Theme;
  /**
   * Function used to update the selected theme. This should update both the local
   * state and persist the preference either to Supabase or localStorage depending
   * on whether the user is authenticated.
   */
  setTheme: (theme: Theme) => void;
  /**
   * The actual resolved theme. If the theme is set to "auto", this will reflect
   * the system preference; otherwise it will match the selected theme. This value
   * is used to apply the correct class to the document root.
   */
  actualTheme: "light" | "dark";
}

// Create a context with an undefined default. We will perform a runtime check
// in useTheme to ensure that a provider is present.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * A safe wrapper around the useAuth hook. If the underlying AuthContext is not
 * available (for example when ThemeProvider is rendered outside of an AuthProvider),
 * this wrapper returns an object with a null user rather than throwing. This
 * prevents runtime errors like "useAuth must be used within an AuthProvider".
 */
const useSafeAuth = () => {
  try {
    return useAuth();
  } catch {
    return { user: null } as any;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persisted theme preference. Defaults to "auto" which will follow the system theme.
  const [theme, setThemeState] = useState<Theme>("auto");
  // The resolved theme after taking into account system preferences when theme === "auto".
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
  // Grab the authenticated user (if any) via our safe wrapper. This will never throw.
  const { user } = useSafeAuth();

  /**
   * Load the persisted theme on mount. For authenticated users, preferences are
   * stored in Supabase; for unauthenticated users we fall back to localStorage.
   */
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        // Fetch the user's saved theme preference from Supabase
        const { data } = await supabase
          .from('user_preferences')
          .select('theme_preference')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.theme_preference) {
          setThemeState(data.theme_preference as Theme);
        }
      } else {
        // Fallback to localStorage for unauthenticated users
        const savedTheme = localStorage.getItem('aura-theme') as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      }
    };
    loadTheme();
  }, [user]);

  /**
   * Update the resolved actualTheme whenever the selected theme changes.
   * When set to "auto", we reflect the system preference. Otherwise we
   * mirror the selected theme. We also listen for changes to the system
   * preference when in "auto" mode.
   */
  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === "auto") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setActualTheme(systemTheme);
      } else {
        setActualTheme(theme);
      }
    };
    updateActualTheme();
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateActualTheme);
      return () => mediaQuery.removeEventListener("change", updateActualTheme);
    }
  }, [theme]);

  /**
   * Apply the resolved theme to the document root by toggling the "dark" class.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (actualTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [actualTheme]);

  /**
   * Update the theme preference. This updates local state and persists the
   * preference either in Supabase (for authenticated users) or in localStorage.
   */
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme_preference: newTheme,
          updated_at: new Date().toISOString(),
        });
    } else {
      localStorage.setItem('aura-theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to consume the ThemeContext. Throws if no provider is present so that
 * developers are alerted to missing providers during development. Note that
 * ThemeProvider itself no longer throws if AuthProvider is missing thanks to
 * useSafeAuth.
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
