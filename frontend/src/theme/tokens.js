export const getAppTokens = (mode, primaryColor) => {
  const isLight = mode === "light";
  const darkBase = "#0F172A";
  const darkSurface = "#111C31";
  const darkElevated = "#162033";
  const darkText = "#CBD5E1";
  const electricBlue = "#38BDF8";

  const colors = {
    primary: isLight ? primaryColor : electricBlue,
    text: isLight ? "#0f172a" : darkText,
    textMuted: isLight ? "#64748b" : "#94A3B8",
    surface: isLight ? "#ffffff" : darkBase,
    surfaceAlt: isLight ? "#f8fafc" : darkSurface,
    surfaceElevated: isLight ? "#ffffff" : darkElevated,
    border: isLight ? "rgba(15,23,42,0.12)" : "rgba(148,163,184,0.18)",
    borderStrong: isLight ? "rgba(15,23,42,0.2)" : "rgba(56,189,248,0.3)",
    backdrop: isLight ? "rgba(15,23,42,0.04)" : "rgba(15,23,42,0.55)",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    electricBlue,
  };

  const radius = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 26
  };

  const glass = {
    background: isLight
      ? "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))"
      : "linear-gradient(135deg, rgba(15,23,42,0.72), rgba(22,32,51,0.52))",
    border: isLight ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(56,189,248,0.16)",
    shadow: isLight
      ? "0 12px 28px rgba(15,23,42,0.08)"
      : "0 12px 28px rgba(15,23,42,0.32)",
    blur: "blur(14px)"
  };

  const shadows = {
    sm: isLight ? "0 4px 12px rgba(15,23,42,0.08)" : "0 4px 12px rgba(15,23,42,0.28)",
    md: isLight ? "0 8px 20px rgba(15,23,42,0.12)" : "0 8px 20px rgba(15,23,42,0.32)",
    lg: isLight ? "0 16px 36px rgba(15,23,42,0.16)" : "0 16px 36px rgba(15,23,42,0.38)"
  };

  const spacing = {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32
  };

  return {
    colors,
    radius,
    glass,
    shadows,
    spacing,
    isLight
  };
};
