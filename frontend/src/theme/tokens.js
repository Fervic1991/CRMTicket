export const getAppTokens = (mode, primaryColor) => {
  const isLight = mode === "light";

  const colors = {
    primary: primaryColor,
    text: isLight ? "#0f172a" : "#e2e8f0",
    textMuted: isLight ? "#64748b" : "#94a3b8",
    surface: isLight ? "#ffffff" : "#0f172a",
    surfaceAlt: isLight ? "#f8fafc" : "#111827",
    surfaceElevated: isLight ? "#ffffff" : "#111827",
    border: isLight ? "rgba(15,23,42,0.12)" : "rgba(226,232,240,0.12)",
    borderStrong: isLight ? "rgba(15,23,42,0.2)" : "rgba(226,232,240,0.2)",
    backdrop: isLight ? "rgba(15,23,42,0.04)" : "rgba(15,23,42,0.45)",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
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
      : "linear-gradient(135deg, rgba(15,23,42,0.65), rgba(17,24,39,0.4))",
    border: isLight ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(148,163,184,0.15)",
    shadow: isLight
      ? "0 12px 28px rgba(15,23,42,0.08)"
      : "0 12px 28px rgba(2,6,23,0.35)",
    blur: "blur(14px)"
  };

  const shadows = {
    sm: isLight ? "0 4px 12px rgba(15,23,42,0.08)" : "0 4px 12px rgba(2,6,23,0.5)",
    md: isLight ? "0 8px 20px rgba(15,23,42,0.12)" : "0 8px 20px rgba(2,6,23,0.55)",
    lg: isLight ? "0 16px 36px rgba(15,23,42,0.16)" : "0 16px 36px rgba(2,6,23,0.65)"
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
