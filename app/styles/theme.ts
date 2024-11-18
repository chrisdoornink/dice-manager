export const lightTheme = {
  // Layout
  background: "#FFFFFF",

  // Die colors
  dieFaceBackground: "#FFFFF5",
  dieFaceBackgroundSelected: "#F5F5F0",
  dieFaceBackgroundHover: "#F8F8F3",
  dieFaceText: "#444444",

  // UI elements
  labelText: "#666666",
  editButtonText: "#999999",
  editButtonHoverText: "#666666",

  // Effects
  textShadowLight: "rgba(255,255,255,.5)",
  textShadowDark: "rgba(0,0,0,.3)",
  boxShadow: "rgba(0,0,0,0.1)",
  dieFaceBorder: "rgba(255,255,255,0.8)",

  // Buttons
  buttonBackground: "#FFFFFF",
  buttonBackgroundHover: "#F8F8F3",
  buttonText: "#666666",
  buttonTextHover: "#444444",
  buttonBorder: "rgba(0,0,0,0.1)",
};

export const darkTheme = {
  // Layout
  background: "#1A1A1A",

  // Die colors
  dieFaceBackground: "#2A2A2A",
  dieFaceBackgroundSelected: "#3A3A3A",
  dieFaceBackgroundHover: "#333333",
  dieFaceText: "#E0E0E0",

  // UI elements
  labelText: "#AAAAAA",
  editButtonText: "#888888",
  editButtonHoverText: "#AAAAAA",

  // Effects
  textShadowLight: "rgba(255,255,255,.2)",
  textShadowDark: "rgba(0,0,0,.5)",
  boxShadow: "rgba(255,255,255,0.1)",
  dieFaceBorder: "rgba(255,255,255,0.2)",

  // Buttons
  buttonBackground: "#2A2A2A",
  buttonBackgroundHover: "#333333",
  buttonText: "#E0E0E0",
  buttonTextHover: "#FFFFFF",
  buttonBorder: "rgba(255,255,255,0.2)",
};

export type Theme = typeof lightTheme;
