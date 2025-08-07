import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("auto");
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
  const { user } = useAuth();

  // Load theme from user preferences or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        // Load from user preferences
        const { data } = await supabase
          .from('user_preferences')
          .select('theme_preference')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.theme_preference) {
          setThemeState(data.theme_preference as Theme);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedTheme = localStorage.getItem('aura-theme') as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      }
    };

    loadTheme();
  }, [user]);

  // Update actual theme based on preference and system
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

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (actualTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [actualTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (user) {
      // Save to user preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme_preference: newTheme,
          updated_at: new Date().toISOString()
        });
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('aura-theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};