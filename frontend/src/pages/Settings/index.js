import React, { useState, useEffect, useContext, useCallback } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import FinalizacaoAtendimento from "../../components/Settings/FinalizacaoAtendimento";

import { i18n } from "../../translate/i18n";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage";
import { useSafeSocket } from "../../helpers/safeSocket";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "auto",
    flex: 1,
  },
  tab: {
    // background: "#f2f5f3",
    backgroundColor: theme.mode === "light" ? "#f2f2f2" : "#7f7f7f",
    borderRadius: 4,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const safeSocket = useSafeSocket(socket);
  
  // ========== VERIFICAÇÃO DE PERMISSÃO ANTES DE TUDO ==========
  // Se não houver usuário ou se for usuário comum, retornar ForbiddenPage imediatamente
  if (!user || user.profile === "user") {
    return (
      <MainContainer className={classes.root}>
        <ForbiddenPage />
      </MainContainer>
    );
  }
  
  // Estados - só serão criados se o usuário tiver permissão
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [oldSettings, setOldSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  // Hooks - só serão executados se o usuário tiver permissão
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();

  // Carregar dados da empresa
  useEffect(() => {
    async function findData() {
      // Verificações adicionais de segurança
      if (!user?.companyId) {
        console.log("⚠️ Usuário sem companyId");
        return;
      }
      
      // Verificar token antes de fazer requisições
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("⚠️ Token não encontrado");
        return;
      }

      setLoading(true);
      try {
        const companyId = user.companyId;
        const company = await find(companyId);
        const settingList = await getAllSettings(companyId);
        const settingListOld = await getAllSettingsOld();

        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);
        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        if (e?.response?.status === 401) {
          console.log("🔐 Erro de autenticação ao carregar configurações");
          // Não fazer nada, o interceptor do axios vai lidar com isso
        } else {
          toast.error("Erro ao carregar configurações");
        }
      } finally {
        setLoading(false);
      }
    }
    
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  // Socket listener usando SafeSocket
  useEffect(() => {
    // Verificações de segurança
    if (!user?.companyId) return;
    
    const eventName = `company-${user.companyId}-settings`;
    
    const onSettingsEvent = () => {
      getAllSettingsOld()
        .then(setOldSettings)
        .catch((error) => {
          console.error("Erro ao atualizar configurações via socket:", error);
        });
    };
    
    // Usar SafeSocket para adicionar listener
    safeSocket.on(eventName, onSettingsEvent);
    
    // Cleanup
    return () => {
      safeSocket.off(eventName, onSettingsEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success(i18n.t("settings.settings.options.successOperation"));
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    // Retorna true APENAS se o usuário tem a flag super = true
    return currentUser && currentUser.super === true;
  };

  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  // Renderização principal - só chega aqui se o usuário tiver permissão
  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={1}>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          onChange={handleTabChange}
          className={classes.tab}
        >
          <Tab label={i18n.t("settings.tabs.options")} value={"options"} />
          {schedulesEnabled && <Tab label={i18n.t("settings.settings.options.schedules")} value={"schedules"} />}
          {user.profile === "admin" &&
            user.finalizacaoComValorVendaAtiva && (
              <Tab
                label={i18n.t("settings.settings.options.finalizationAttendance")}
                value={"finalizacao"}
              />
            )}
          {isSuper() ? (
            <Tab
              label={i18n.t("settings.tabs.companies")}
              value={"companies"}
            />
          ) : null}
          {isSuper() ? (
            <Tab label={i18n.t("settings.tabs.plans")} value={"plans"} />
          ) : null}
          {isSuper() ? (
            <Tab label={i18n.t("settings.tabs.helps")} value={"helps"} />
          ) : null}
          {isSuper() ? (
            <Tab label="Whitelabel" value={"whitelabel"} />
          ) : null}
        </Tabs>
        <Paper className={classes.paper} elevation={0}>
          {schedulesEnabled && (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"schedules"}
            >
              <SchedulesForm
                loading={loading}
                onSubmit={handleSubmitSchedules}
                initialValues={schedules}
              />
            </TabPanel>
          )}
          {/* Tab de Planos - Disponível APENAS para super, NUNCA para user ou admin */}
          {isSuper() && (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"plans"}
            >
              <PlansManager />
            </TabPanel>
          )}
          
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <>
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"companies"}
                >
                  <CompaniesManager />
                </TabPanel>

                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"helps"}
                >
                  <HelpsManager />
                </TabPanel>
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"whitelabel"}
                >
                  <Whitelabel settings={oldSettings} />
                </TabPanel>
              </>
            )}
          />
          {user.profile === "admin" && user.finalizacaoComValorVendaAtiva && (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"finalizacao"}
            >
              <FinalizacaoAtendimento
                settings={settings}
                onSettingsChange={handleSettingsChange}
              />
            </TabPanel>
          )}
          <TabPanel
            className={classes.container}
            value={tab}
            name={"options"}
          >
            <Options
              settings={settings}
              oldSettings={oldSettings}
              user={currentUser}
              scheduleTypeChanged={(value) =>
                setSchedulesEnabled(value === "company")
              }
            />
          </TabPanel>
        </Paper>
      </Paper>
    </MainContainer>
  );
};

export default SettingsCustom;