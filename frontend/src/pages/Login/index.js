import React, { useState, useContext, useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Helmet } from "react-helmet";
// Importar bandeiras do diretório public
const BRFlag = '/flags/br.png';
const USFlag = '/flags/us.png';
const ESFlag = '/flags/es.png';
const ARFlag = '/flags/sa.png';
const TRFlag = '/flags/tr.png';
const ITFlag = '/flags/it.png';
import PublicLogo from "../../components/PublicLogo";
import clsx from "clsx";
import { getBackendUrl } from "../../config";

const languageOptions = [
  { value: "pt", label: "Português", icon: BRFlag },
  { value: "en", label: "English", icon: USFlag },
  { value: "es", label: "Español", icon: ESFlag },
  { value: "ar", label: "العربية", icon: ARFlag },
  { value: "tr", label: "Türkçe", icon: TRFlag },
  { value: "it", label: "Italiano", icon: ITFlag },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    padding: 0,
    margin: 0,
    boxSizing: "border-box",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #f8fafc 100%)",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
      backgroundSize: "50px 50px",
      animation: "$float 20s ease-in-out infinite",
    },
  },
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-10px) rotate(180deg)" },
  },
  shell: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr",
    },
  },
  visualPanel: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px",
    overflow: "hidden",
    background:
      "linear-gradient(150deg, rgba(15,23,42,0.94) 0%, rgba(29,78,216,0.92) 48%, rgba(56,189,248,0.85) 100%)",
    color: "#ffffff",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18) 0, transparent 28%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.12) 0, transparent 24%), radial-gradient(circle at 70% 75%, rgba(59,130,246,0.32) 0, transparent 32%)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "10% auto auto 8%",
      width: "72%",
      height: "72%",
      borderRadius: "32px",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(6px)",
    },
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  visualBackground: {
    position: "absolute",
    inset: 0,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.18,
    mixBlendMode: "screen",
  },
  visualContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  visualLogoWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px 24px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
    width: "fit-content",
  },
  visualTitle: {
    fontSize: "clamp(2.4rem, 4vw, 4rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  },
  visualSubtitle: {
    maxWidth: 460,
    fontSize: "1.08rem",
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.84)",
  },
  visualBadgeRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  visualBadge: {
    padding: "12px 18px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.16)",
    fontWeight: 600,
    fontSize: "0.94rem",
    backdropFilter: "blur(8px)",
  },
  formPanel: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    [theme.breakpoints.down("sm")]: {
      padding: "18px",
    },
  },
  containerLogin: {
    width: "100%",
    position: "relative",
    zIndex: 5,
    maxWidth: 520,
  },
  paper: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    boxShadow: `
      0 24px 80px rgba(15, 23, 42, 0.12),
      0 8px 30px rgba(59, 130, 246, 0.08)
    `,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "44px 40px 32px",
    borderRadius: "24px",
    width: "100%",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    animation: "$slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    [theme.breakpoints.down("sm")]: {
      animation: "$slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      borderRadius: "24px",
      padding: "32px 22px 24px",
    },
  },
  "@keyframes slideInRight": {
    from: {
      opacity: 0,
      transform: "translateX(50px)",
    },
    to: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },

  "@keyframes slideInUp": {
    from: {
      opacity: 0,
      transform: "translateY(30px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  formHeader: {
    width: "100%",
    textAlign: "center",
    marginBottom: "28px",
  },
  mobileHero: {
    display: "none",
    width: "100%",
    marginBottom: "22px",
    padding: "18px 18px 16px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, rgba(29,78,216,0.98) 0%, rgba(56,189,248,0.92) 100%)",
    color: "#fff",
    [theme.breakpoints.down("md")]: {
      display: "block",
    },
  },
  mobileHeroTitle: {
    fontSize: "1.55rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    marginBottom: "8px",
  },
  mobileHeroText: {
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.84)",
  },
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginBottom: "20px",
  },
  form: {
    width: "100%",
    marginTop: 0,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 45%, #0ea5e9 100%)",
    color: "white",
    borderRadius: "16px",
    padding: "15px 0",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
    textTransform: "none",
    boxShadow: "0 14px 24px rgba(37, 99, 235, 0.22)",
    border: "none",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #0284c7 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 18px 28px rgba(37, 99, 235, 0.28)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  iconButton: {
    position: "absolute",
    top: 18,
    right: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#374151",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "#eff6ff",
      transform: "scale(1.05)",
    },
  },
  textField: {
    marginBottom: "8px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      backgroundColor: "#ffffff",
      transition: "all 0.3s ease",
      color: "#0f172a",
      "&:hover": {
        backgroundColor: "#ffffff",
      },
      "&.Mui-focused": {
        backgroundColor: "#ffffff",
        boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.08)",
      },
      "& input": {
        color: "#0f172a",
        "&::placeholder": {
          color: "#9ca3af",
          opacity: 1,
        },
      },
      "& fieldset": {
        borderColor: "#dbe3ef",
      },
      "&:hover fieldset": {
        borderColor: "#93c5fd",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563eb",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#6b7280",
      fontWeight: 600,
      "&.Mui-focused": {
        color: "#2563eb",
      },
    },
  },
  inputIcon: {
    color: "#94a3b8",
  },
  languageSelector: {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    background: theme.mode === "light" 
      ? "rgba(255, 255, 255, 0.9)" 
      : "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    border: theme.mode === "light"
      ? "1px solid rgba(0, 0, 0, 0.15)"
      : "1px solid rgba(255, 255, 255, 0.2)",
    padding: "8px 12px",
    boxShadow: theme.mode === "light"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "none",
  },
  registerLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 600,
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#2563eb",
      textDecoration: "underline",
    },
  },
  secondaryLink: {
    color: "#64748b",
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 0.25s ease",
    "&:hover": {
      color: "#1d4ed8",
      textDecoration: "underline",
    },
  },
  linksRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "6px",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  languageDropdown: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: theme.mode === "light" ? "#1f2937" : "white",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    gap: "8px",
    transition: "opacity 0.3s ease",
    "&:hover": {
      opacity: 0.8,
    },
  },

  languageOptions: {
    position: "absolute",
    top: "100%",
    left: "0",
    marginTop: "8px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "8px",
    zIndex: 1000,
    minWidth: "140px",
  },

  languageOption: {
    background: "none",
    border: "none",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px 12px",
    textAlign: "left",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(59, 130, 246, 0.1)",
      color: "#3b82f6",
    },
  },

  flagIcon: {
    width: 20,
    height: 15,
    borderRadius: 2,
  },
  formTitle: {
    color: "#0f172a",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    marginBottom: "8px",
  },
  formSubtitle: {
    color: "#64748b",
    lineHeight: 1.65,
  },
}));

const Login = () => {
  const classes = useStyles();
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName, mode } = colorMode;
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [allowSignup, setAllowSignup] = useState(false);
  const { getPublicSetting } = useSettings();
  const { handleLogin } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const ref = useRef();
  const [enabledLanguages, setEnabledLanguages] = useState(["pt", "en", "es", "ar", "tr", "it"]);
  const [backgroundLight, setBackgroundLight] = useState("");
  const [backgroundDark, setBackgroundDark] = useState("");

  const getCompanyIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get("companyId");
    return companyId ? parseInt(companyId) : null;
  };

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  useEffect(() => {
    let isMounted = true;
    const companyId = getCompanyIdFromUrl();

    getPublicSetting("userCreation", companyId)
      .then((data) => {
        if (isMounted) {
          setAllowSignup(data === "enabled");
        }
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    
    getPublicSetting("enabledLanguages", companyId)
      .then((langs) => {
        if (isMounted) {
          let arr = ["pt", "en", "es", "ar", "tr","it"];
          try {
            if (langs) {
              const parsed = JSON.parse(langs);
              // Mapear pt-BR para pt se necessário
              arr = parsed.map(lang => lang === "pt-BR" ? "pt" : lang);
            }
          } catch {}
          setEnabledLanguages(arr);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEnabledLanguages(["pt", "en", "es", "ar", "tr", "it"]);
        }
      });

    getPublicSetting("appLogoBackgroundLight", companyId)
      .then((bgLight) => {
        if (isMounted) {
          if (bgLight) {
            setBackgroundLight(getBackendUrl() + "/public/" + bgLight);
          } else {
            setBackgroundLight("");
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackgroundLight("");
        }
      });

    getPublicSetting("appLogoBackgroundDark", companyId)
      .then((bgDark) => {
        if (isMounted) {
          if (bgDark) {
            setBackgroundDark(getBackendUrl() + "/public/" + bgDark);
          } else {
            setBackgroundDark("");
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackgroundDark("");
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, []);

  // Mapear pt-BR para pt para compatibilidade
  const currentLang = i18n.language === "pt-BR" ? "pt" : i18n.language;
  const current =
    languageOptions.find((opt) => opt.value === currentLang) ||
    languageOptions[0];

  const handleSelect = (opt) => {
    i18n.changeLanguage(opt.value);
    localStorage.setItem("i18nextLng", opt.value);
    localStorage.setItem("language", opt.value);
    setOpen(false);
    window.location.reload();
  };

    let finalBackground;
  if (mode === "light") {
    if (backgroundLight) {
      finalBackground = `url(${backgroundLight})`;
    } else {
      finalBackground = "#f5f7fb";
    }
  } else {
    if (backgroundDark) {
      finalBackground = `url(${backgroundDark})`;
    } else {
      finalBackground = "#0f172a";
    }
  }

  finalBackground = String(finalBackground || "#f5f5f5");


  return (
    <>
      <Helmet>
        <title>{appName || "Multi100"}</title>
        <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
      </Helmet>
      
      <div className={clsx(classes.root, "login-page")}>
        {/* Seletor de idioma */}
        <div
          ref={ref}
          className={classes.languageSelector}
        >
          <button 
            onClick={() => setOpen((o) => !o)}
            className={classes.languageDropdown}
          >
            <img
              src={current.icon}
              alt={current.label}
              className={classes.flagIcon}
            />
            {current.label}
            <span>▾</span>
          </button>

          {open && (
            <div className={classes.languageOptions}>
              {languageOptions
                .filter((opt) => enabledLanguages.includes(opt.value))
                .map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={classes.languageOption}
                  >
                    <img
                      src={opt.icon}
                      alt={opt.label}
                      className={classes.flagIcon}
                    />
                    {opt.label}
                  </button>
                ))}
            </div>
          )}
        </div>
        <CssBaseline />
        <main className={classes.shell}>
          <section className={classes.visualPanel}>
            {typeof finalBackground === "string" && finalBackground.includes("url(") && (
              <div
                className={classes.visualBackground}
                style={{ backgroundImage: finalBackground }}
              />
            )}
            <div className={classes.visualContent}>
              <div className={classes.visualLogoWrap}>
                <PublicLogo
                  style={{
                    width: "100%",
                    maxWidth: "240px",
                    height: "auto",
                    maxHeight: "72px",
                    filter: "brightness(0) invert(1)",
                  }}
                  alt="logo"
                />
              </div>
              <Typography component="h1" className={classes.visualTitle}>
                {i18n.t("login.heroTitle")}
              </Typography>
              <Typography component="p" className={classes.visualSubtitle}>
                {i18n.t("login.heroDescription")}
              </Typography>
              <div className={classes.visualBadgeRow}>
                <span className={classes.visualBadge}>WhatsApp</span>
                <span className={classes.visualBadge}>Facebook</span>
                <span className={classes.visualBadge}>Instagram</span>
              </div>
            </div>
          </section>

          <section className={classes.formPanel}>
            <div className={classes.containerLogin}>
              <div className={classes.mobileHero}>
                <Typography className={classes.mobileHeroTitle}>
                  {i18n.t("login.heroTitle")}
                </Typography>
                <Typography className={classes.mobileHeroText}>
                  {i18n.t("login.heroDescription")}
                </Typography>
              </div>

              <div className={classes.paper}>
                <IconButton
                  className={classes.iconButton}
                  onClick={colorMode.toggleColorMode}
                >
                  {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

                <div className={classes.logoWrap}>
                  <PublicLogo
                    style={{
                      width: "100%",
                      maxWidth: "260px",
                      height: "auto",
                      maxHeight: "78px",
                    }}
                    alt="logo"
                  />
                </div>

                <div className={classes.formHeader}>
                  <Typography variant="h4" className={classes.formTitle}>
                    {i18n.t("login.welcomeBack")}
                  </Typography>
                  <Typography variant="body1" className={classes.formSubtitle}>
                    {i18n.t("login.subtitle")}
                  </Typography>
                </div>

                <form className={classes.form} noValidate onSubmit={handlSubmit}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={i18n.t("login.form.email")}
                    name="email"
                    value={user.email}
                    onChange={handleChangeInput}
                    autoComplete="email"
                    autoFocus
                    className={classes.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon className={classes.inputIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={i18n.t("login.form.password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={user.password}
                    onChange={handleChangeInput}
                    autoComplete="current-password"
                    className={classes.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon className={classes.inputIcon} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            style={{ color: "#6b7280" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    {i18n.t("login.buttons.submit")}
                  </Button>

                  <div className={classes.linksRow}>
                    <Link
                      href="#"
                      variant="body2"
                      onClick={(event) => event.preventDefault()}
                      className={classes.secondaryLink}
                    >
                      {i18n.t("login.buttons.forgotPassword")}
                    </Link>

                    {allowSignup && (
                      <Link
                        href="#"
                        variant="body2"
                        component={RouterLink}
                        to="/signup"
                        className={classes.registerLink}
                      >
                        {i18n.t("login.buttons.register")}
                      </Link>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Login;
