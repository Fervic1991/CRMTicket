import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Pagination from "@material-ui/lab/Pagination";
import * as XLSX from "xlsx";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

import {
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { UsersFilter } from "../../components/UsersFilter";
import { TagsFilter } from "../../components/TagsFilter";
import { WhatsappsFilter } from "../../components/WhatsappsFilter";
import { StatusFilter } from "../../components/StatusFilter";
import useDashboard from "../../hooks/useDashboard";

import QueueSelectCustom from "../../components/QueueSelectCustom";
import moment from "moment";
import ShowTicketLogModal from "../../components/ShowTicketLogModal";

import { blue, green } from "@material-ui/core/colors";
import {
  Facebook,
  FilterList,
  Forward,
  History,
  Instagram,
  SaveAlt,
  Visibility,
  WhatsApp,
} from "@material-ui/icons";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { Field } from "formik";

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(0, 1, 0, 0),
  },
  switchBase: {
    padding: 2,
    "&$checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + $track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: "none",
      },
    },
  },
  thumb: {
    width: 22,
    height: 22,
    boxShadow: "0 2px 6px rgba(15,23,42,0.18)",
  },
  track: {
    borderRadius: 13,
    border: "1px solid rgba(148,163,184,0.35)",
    backgroundColor: "rgba(203,213,225,0.9)",
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
}))(Switch);

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    background:
      theme.palette.mode === "dark"
        ? "radial-gradient(1200px 600px at 8% -10%, rgba(59,130,246,0.16), transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(16,185,129,0.14), transparent 60%), linear-gradient(180deg, rgba(2,6,23,0.98), rgba(15,23,42,0.98))"
        : "radial-gradient(1200px 600px at 8% -10%, rgba(59,130,246,0.14), transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(16,185,129,0.12), transparent 60%), linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.98))",
    minHeight: "100%",
  },
  formControl: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 16,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(22,32,51,0.72), rgba(15,23,42,0.62))"
      : "rgba(255,255,255,0.96)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  headerMeta: {
    fontSize: 12,
    color: theme.appTokens?.colors?.textMuted || (theme.palette.mode === "dark" ? "rgba(226,232,240,0.7)" : "#64748b"),
  },
  pageTitle: {
    fontWeight: 700,
    color: "#1E293B",
  },
  filterCard: {
    flex: 1,
    overflow: "auto",
    padding: theme.spacing(2),
    borderRadius: 16,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(22,32,51,0.72), rgba(15,23,42,0.62))"
      : "rgba(255,255,255,0.96)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    ...theme.scrollbarStylesSoftBig,
  },
  mainPaperTable: {
    flex: 1,
    overflow: "auto",
    height: "68vh",
    borderRadius: 16,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(22,32,51,0.72), rgba(15,23,42,0.62))"
      : "rgba(255,255,255,0.96)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    ...theme.scrollbarStylesSoftBig,
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    alignItems: "end",
  },
  filterGroup: {
    minWidth: 0,
  },
  minimalField: {
    "& .MuiOutlinedInput-root": {
      minHeight: 40,
      borderRadius: 8,
      backgroundColor: theme.palette.mode === "dark" ? "rgba(248,250,252,0.08)" : "#F8FAFC",
      transition: "background-color 0.2s ease, box-shadow 0.2s ease",
      "&.Mui-focused": {
        backgroundColor: "#FFFFFF",
        boxShadow: "0 0 0 3px rgba(37,99,235,0.08)",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(226,232,240,0.9)",
        borderWidth: 1,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(203,213,225,1)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(191,219,254,1)",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#64748B",
    },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      opacity: 0.45,
      cursor: "pointer",
    },
  },
  toggleField: {
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    borderRadius: 8,
    padding: theme.spacing(0.5, 1.25),
    backgroundColor: theme.palette.mode === "dark" ? "rgba(248,250,252,0.08)" : "#F8FAFC",
    border: "1px solid rgba(226,232,240,0.9)",
  },
  toggleLabel: {
    margin: 0,
    width: "100%",
    justifyContent: "space-between",
    "& .MuiFormControlLabel-label": {
      color: "#475569",
      fontWeight: 500,
      fontSize: 14,
    },
  },
  mainHeaderBlock: {
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexWrap: "wrap",
    },
  },
  tableHeadCell: {
    fontWeight: 700,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#64748B",
    borderBottom: `1px solid ${theme.appTokens?.colors?.border || theme.palette.divider}`,
    background: "#FFFFFF",
    whiteSpace: "nowrap",
    paddingTop: 14,
    paddingBottom: 14,
  },
  tableRow: {
    transition: "background-color 0.2s ease",
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? "rgba(30, 41, 59, 0.5)"
          : "rgba(248, 250, 252, 1)",
    },
  },
  tableCell: {
    borderBottom: `1px solid ${theme.appTokens?.colors?.border || theme.palette.divider}`,
    paddingTop: 14,
    paddingBottom: 14,
    whiteSpace: "nowrap",
  },
  actionButton: {
    borderRadius: theme.appTokens?.radius?.md || 12,
    padding: 6,
    marginLeft: 6,
    background: theme.appTokens?.glass?.background,
    border: theme.appTokens?.glass?.border,
    boxShadow: theme.appTokens?.shadows?.sm,
    backdropFilter: theme.appTokens?.glass?.blur,
  },
  filterButton: {
    height: 40,
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    color: "#FFFFFF",
    background: "linear-gradient(135deg, rgba(37,99,235,0.96), rgba(56,189,248,0.92))",
    boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
    padding: theme.spacing(0, 2),
    "&:hover": {
      background: "linear-gradient(135deg, rgba(29,78,216,0.98), rgba(14,165,233,0.94))",
    },
  },
  tableScroller: {
    minWidth: 1220,
  },
}));

const Reports = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getReport } = useDashboard();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Defina o tamanho da página

  const [searchParam, setSearchParam] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // const [tagIds, setTagIds] = useState([]);
  const [queueIds, setQueueIds] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [onlyRated, setOnlyRated] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets, setTickets] = useState([]);

  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  // const handleSelectedTags = (selecteds) => {
  //   const tags = selecteds.map((t) => t.id);
  //   setTagIds(tags);
  // };

  const exportarGridParaExcel = async () => {
    setLoading(true); // Define o estado de loading como true durante o carregamento

    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        // tags: JSON.stringify(tagIds),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        // tags: tagIds,
        dateFrom,
        dateTo,
        page: 1, // Passa o número da página para a API
        pageSize: 9999999, // Passa o tamanho da página para a API
        onlyRated: onlyRated ? "true" : "false",
      });

      const ticketsData = data.tickets.map((ticket) => {
        const formatDate = (dateString) => {
          if (!dateString || dateString === null) {
            return { date: "", time: "" };
          }

          if (dateString.includes("/") && dateString.includes(" ")) {
            const [datePart, timePart] = dateString.split(" ");
            return {
              date: datePart,
              time: timePart,
            };
          }

          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return { date: "", time: "" };
          }

          return {
            date: date.toLocaleDateString("pt-BR"),
            time: date.toLocaleTimeString("pt-BR"),
          };
        };

        const formatSupportTime = (timeString) => {
          if (!timeString) return "";

          if (timeString === "0") return "0min";

          const match = timeString.match(
            /(\d+)\s*d,?\s*(\d+)\s*hr?s?\s*e?\s*(\d+)\s*m/
          );
          if (!match) return timeString;

          const days = parseInt(match[1]);
          const hours = parseInt(match[2]);
          const minutes = parseInt(match[3]);

          let result = "";
          if (days > 0) result += `${days}d`;
          if (hours > 0) result += `${hours}h`;
          if (minutes > 0) result += `${minutes}min`;

          return result || "0min";
        };

        const createdAtFormatted = formatDate(ticket.createdAt);
        const closedAtFormatted = formatDate(ticket.closedAt);

        return {
          id: ticket.id,
          Connessione: ticket.whatsappName,
          Contato: ticket.contactName,
          Utente: ticket.userName,
          Coda: ticket.queueName,
          Status: ticket.status,
          UltimoMessaggio: ticket.lastMessage,
          DataApertura: createdAtFormatted.date,
          OraApertura: createdAtFormatted.time,
          DataChiusura: closedAtFormatted.date,
          OraChiusura: closedAtFormatted.time,
          TempoDiAssistenza: formatSupportTime(ticket.supportTime),
          nps: ticket.NPS || "",
          ValorDaVenda:
            ticket.valorVenda !== undefined && ticket.valorVenda !== null
              ? ticket.valorVenda
              : "-",
          MotivoMancataVendita: ticket.motivoNaoVenda || "-",
          ConclusoConVendita:
            ticket.finalizadoComVenda === true
              ? i18n.t("reports.finalizadoComVenda.sim")
              : ticket.finalizadoComVenda === false
              ? i18n.t("reports.finalizadoComVenda.nao")
              : "-",
        };
      });

      console.log(ticketsData);

      // RDS.CHAT - preparando os dados aqui...
      const getTranslation = (key, fallback) => {
        const translation = i18n.t(key);
        return translation !== key ? translation : fallback;
      };

      const formatDateBR = (dateStr) => {
        if (!dateStr)
          return getTranslation(
            "reports.exportExcel.notInformed",
            "Non specificato"
          );
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      };

      const translations = {
        title: getTranslation(
          "reports.exportExcel.title",
          "Report Assistenze"
        ),
        startDate: getTranslation(
          "reports.exportExcel.startDate",
          "Data inicial"
        ),
        endDate: getTranslation("reports.exportExcel.endDate", "Data final"),
        columns: {
          id: getTranslation("reports.exportExcel.columns.id", "ID"),
          connection: getTranslation(
            "reports.exportExcel.columns.connection",
            "Connessione"
          ),
          contact: getTranslation(
            "reports.exportExcel.columns.contact",
            "Contato"
          ),
          user: getTranslation("reports.exportExcel.columns.user", "Utente"),
          queue: getTranslation("reports.exportExcel.columns.queue", "Coda"),
          status: getTranslation(
            "reports.exportExcel.columns.status",
            "Status"
          ),
          lastMessage: getTranslation(
            "reports.exportExcel.columns.lastMessage",
            "Ultimo messaggio"
          ),
          openDate: getTranslation(
            "reports.exportExcel.columns.openDate",
            "Data apertura"
          ),
          openTime: getTranslation(
            "reports.exportExcel.columns.openTime",
            "Ora apertura"
          ),
          closeDate: getTranslation(
            "reports.exportExcel.columns.closeDate",
            "Data chiusura"
          ),
          closeTime: getTranslation(
            "reports.exportExcel.columns.closeTime",
            "Ora chiusura"
          ),
          supportTime: getTranslation(
            "reports.exportExcel.columns.supportTime",
            "Tempo di assistenza"
          ),
          nps: getTranslation("reports.exportExcel.columns.nps", "NPS"),
          valorVenda: getTranslation(
            "reports.exportExcel.columns.valorVenda",
            "Valore della vendita"
          ),
          motivoNaoVenda: getTranslation(
            "reports.exportExcel.columns.motivoNaoVenda",
            "Motivo mancata vendita"
          ),
          finalizadoComVenda: getTranslation(
            "reports.exportExcel.columns.finalizadoComVenda",
            "Concluso con vendita"
          ),
        },
      };

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        [translations.title],
        [`${translations.startDate}: ${formatDateBR(dateFrom)}`],
        [`${translations.endDate}: ${formatDateBR(dateTo)}`],
        [],
        [
          translations.columns.id,
          translations.columns.connection,
          translations.columns.contact,
          translations.columns.user,
          translations.columns.queue,
          translations.columns.status,
          translations.columns.lastMessage,
          translations.columns.openDate,
          translations.columns.openTime,
          translations.columns.closeDate,
          translations.columns.closeTime,
          translations.columns.supportTime,
          translations.columns.nps,
          translations.columns.valorVenda,
          translations.columns.motivoNaoVenda,
          translations.columns.finalizadoComVenda,
        ],
      ]);

      XLSX.utils.sheet_add_json(ws, ticketsData, {
        origin: "A6",
        skipHeader: true,
      });

      if (!ws["!merges"]) ws["!merges"] = [];
      ws["!merges"].push({ s: { c: 0, r: 0 }, e: { c: 12, r: 0 } });

      if (!ws["!cols"]) ws["!cols"] = [];
      ws["!cols"] = [
        { wch: 8 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 30 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 8 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      if (!ws["!rows"]) ws["!rows"] = [];
      ws["!rows"] = [
        { hpt: 25 },
        { hpt: 20 },
        { hpt: 20 },
        { hpt: 10 },
        { hpt: 25 },
      ];

      const range = XLSX.utils.decode_range(ws["!ref"]);

      for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
          if (!ws[cellAddress]) continue;

          if (!ws[cellAddress].s) ws[cellAddress].s = {};

          if (rowNum === 0) {
            ws[cellAddress].s = {
              font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "4472C4" } },
              alignment: { horizontal: "center", vertical: "center" },
            };
          } else if (rowNum === 1 || rowNum === 2) {
            ws[cellAddress].s = {
              font: { bold: true, sz: 12 },
              fill: { fgColor: { rgb: "E7E6E6" } },
            };
          } else if (rowNum === 4) {
            ws[cellAddress].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "70AD47" } },
              alignment: { horizontal: "center", vertical: "center" },
            };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, "ReportAssistenze");
      XLSX.writeFile(wb, "report-assistenze.xlsx", {
        cellStyles: true,
        bookType: "xlsx",
      });

      setPageNumber(pageNumber);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (pageNumber) => {
    setLoading(true); // Define o estado de loading como true durante o carregamento
    console.log(onlyRated);
    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        // tags: JSON.stringify(tagIds),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        // tags: tagIds,
        dateFrom,
        dateTo,
        page: pageNumber, // Passa o número da página para a API
        pageSize: pageSize, // Passa o tamanho da página para a API
        onlyRated: onlyRated ? "true" : "false",
      });

      setTotalTickets(data.totalTickets.total);

      // Verifica se há mais resultados para definir hasMore
      setHasMore(data.tickets.length === pageSize);

      setTickets(data.tickets); // Se for a primeira página, substitua os tickets

      setPageNumber(pageNumber); // Atualiza o estado da página atual
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false); // Define o estado de loading como false após o carregamento
    }
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setUserIds(users);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);

    setSelectedStatus(statusFilter);
  };
  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return (
          <Facebook style={{ color: "#3b5998", verticalAlign: "middle" }} />
        );
      case "instagram":
        return (
          <Instagram style={{ color: "#e1306c", verticalAlign: "middle" }} />
        );
      case "whatsapp":
        return (
          <WhatsApp style={{ color: "#25d366", verticalAlign: "middle" }} />
        );
      default:
        return "error";
    }
  };

  const renderOption = (option) => {
    if (option.number) {
      return (
        <>
          {IconChannel(option.channel)}
          <Typography
            component="span"
            style={{
              fontSize: 14,
              marginLeft: "10px",
              display: "inline-flex",
              alignItems: "center",
              lineHeight: "2",
            }}
          >
            {option.name} - {option.number}
          </Typography>
        </>
      );
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const handleSelectOption = (e, newValue) => {
    setSelectedContactId(newValue.id);
    setSearchParam("");
  };

  const renderOptionLabel = (option) => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };
  const filter = createFilterOptions({
    trim: true,
  });

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };
  const renderContactAutocomplete = () => {
    return (
        <Autocomplete
          fullWidth
          options={options}
          loading={loading}
          clearOnBlur
          autoHighlight
          freeSolo
          size="small"
          clearOnEscape
          getOptionLabel={renderOptionLabel}
          renderOption={renderOption}
          filterOptions={createAddContactOption}
          onChange={(e, newValue) => handleSelectOption(e, newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t("newTicketModal.fieldLabel")}
              variant="outlined"
              autoFocus
              size="small"
              className={classes.minimalField}
              onChange={(e) => setSearchParam(e.target.value)}
              // onKeyPress={(e, newValue) => handleSelectOption(e, newValue)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
        />
    );
  };

  return (
    <MainContainer className={classes.mainContainer}>
      {openTicketMessageDialog && (
        <ShowTicketLogModal
          isOpen={openTicketMessageDialog}
          handleClose={() => setOpenTicketMessageDialog(false)}
          ticketId={ticketOpen.id}
        />
      )}
      <Title className={classes.pageTitle}>{i18n.t("reports.title")}</Title>

      <MainHeader
        className={classes.mainHeaderFilter}
        style={{ display: "flex" }}
      >
        <Paper className={classes.filterCard}>
          <div className={classes.headerCard} style={{ marginBottom: 12 }}>
            <div>
              <Typography variant="h6">{i18n.t("reports.title")}</Typography>
              <Typography className={classes.headerMeta}>
                {moment(dateFrom).format("DD/MM/YYYY")} → {moment(dateTo).format("DD/MM/YYYY")}
              </Typography>
            </div>
          </div>
          <div className={classes.filtersGrid}>
            <div className={classes.filterGroup}>
              {renderContactAutocomplete()}
            </div>
            <div className={classes.filterGroup}>
              <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
            </div>
            <div className={classes.filterGroup}>
              <StatusFilter onFiltered={handleSelectedStatus} />
            </div>
            <div className={classes.filterGroup}>
              <UsersFilter onFiltered={handleSelectedUsers} />
            </div>
            {/* <Grid item xs={12} md={4} xl={4}>
              <TagsFilter onFiltered={handleSelectedTags} />
            </Grid> */}
            <div className={classes.filterGroup}>
              <QueueSelectCustom
                selectedQueueIds={queueIds}
                onChange={(values) => setQueueIds(values)}
              />
            </div>

            <div className={classes.filterGroup}>
              <TextField
                label={i18n.t("reports.startDate")}
                type="date"
                value={dateFrom}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.minimalField}
              />
            </div>
            <div className={classes.filterGroup}>
              <TextField
                label={i18n.t("reports.endDate")}
                type="date"
                value={dateTo}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.minimalField}
              />
            </div>
            <div className={`${classes.filterGroup} ${classes.toggleField}`}>
              <FormControlLabel
                className={classes.toggleLabel}
                control={
                  <IOSSwitch
                    checked={onlyRated}
                    onChange={() => setOnlyRated(!onlyRated)}
                  />
                }
                label={i18n.t("reports.buttons.onlyRated")}
              />
            </div>
            <div className={classes.filterGroup} style={{ display: "flex", gap: 8 }}>
              <IconButton
                onClick={exportarGridParaExcel}
                aria-label={i18n.t("reports.buttons.exportExcel")}
                className={classes.actionButton}
              >
                <SaveAlt />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleFilter(pageNumber)}
                size="small"
                className={classes.filterButton}
                startIcon={<FilterList fontSize="small" />}
              >
                {i18n.t("reports.buttons.filter")}
              </Button>
            </div>
          </div>
        </Paper>
      </MainHeader>
      <Paper className={classes.mainPaperTable} variant="outlined">
        <div className={classes.tableScroller}>
        <Table size="small" id="grid-attendants">
          <TableHead>
            <TableRow>
              {/* <TableCell padding="checkbox" /> */}
              <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reports.table.id")}</TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                {i18n.t("reports.table.whatsapp")}
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                {i18n.t("reports.table.contact")}
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reports.table.user")}</TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                {i18n.t("reports.table.queue")}
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reports.table.wallet")}</TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("reports.table.status")}
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                {i18n.t("reports.table.lastMessage")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("reports.table.dateOpen")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("reports.table.dateClose")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("reports.table.supportTime")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("reports.table.NPS")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reports.table.valorVenda")}</TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reports.table.motivoNaoVenda")}</TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reports.table.finalizadoComVenda")}</TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("reports.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className={classes.tableRow}>
                  <TableCell align="center" className={classes.tableCell}>{ticket.id}</TableCell>
                  <TableCell align="left" className={classes.tableCell}>{ticket?.whatsappName}</TableCell>
                  <TableCell align="left" className={classes.tableCell}>{ticket?.contactName}</TableCell>
                  <TableCell align="left" className={classes.tableCell}>{ticket?.userName}</TableCell>
                  <TableCell align="left" className={classes.tableCell}>{ticket?.queueName}</TableCell>
                  <TableCell align="left" className={classes.tableCell}>
                    {ticket?.walletName || "-"}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>{ticket?.status}</TableCell>
                  <TableCell align="left" className={classes.tableCell}>{ticket?.lastMessage}</TableCell>
                  <TableCell align="center" className={classes.tableCell}>{ticket?.createdAt}</TableCell>
                  <TableCell align="center" className={classes.tableCell}>{ticket?.closedAt}</TableCell>
                  <TableCell align="center" className={classes.tableCell}>{ticket?.supportTime}</TableCell>
                  <TableCell align="center" className={classes.tableCell}>{ticket?.NPS}</TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    {ticket?.valorVenda !== undefined &&
                    ticket?.valorVenda !== null
                      ? ticket.valorVenda
                      : "-"}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    {ticket?.motivoNaoVenda || "-"}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    {ticket?.finalizadoComVenda === true
                      ? i18n.t("reports.finalizadoComVenda.sim")
                      : ticket?.finalizadoComVenda === false
                      ? i18n.t("reports.finalizadoComVenda.nao")
                      : "-"}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    <Typography
                      noWrap
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      <Tooltip title={i18n.t("reports.tooltips.logsTicket")}>
                        <IconButton
                          className={classes.actionButton}
                          onClick={() => {
                            setOpenTicketMessageDialog(true);
                            setTicketOpen(ticket);
                          }}
                          size="small"
                        >
                          <History fontSize="small" style={{ color: blue[700] }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("reports.tooltips.accessTicket")}>
                        <IconButton
                          className={classes.actionButton}
                          onClick={() => {
                            history.push(`/tickets/${ticket.uuid}`);
                          }}
                          size="small"
                        >
                          <Forward fontSize="small" style={{ color: green[700] }} />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
        </div>
      </Paper>

      <div>
        <Grid container>
          <Grid item xs={12} sm={10} md={10}>
            <Pagination
              count={Math.ceil(totalTickets / pageSize)} // Calcula o nmero total de páginas com base no nmero total de tickets e no tamanho da página
              page={pageNumber} // Define a página atual
              onChange={(event, value) => handleFilter(value)} // Função de callback para mudanças de página
            />
          </Grid>
          <Grid item xs={12} sm={2} md={2}>
            <FormControl margin="dense" variant="outlined" fullWidth>
              <InputLabel>{i18n.t("reports.table.ticketsPerPage")}</InputLabel>
              <Select
                labelId="dialog-select-prompt-label"
                id="dialog-select-prompt"
                name="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                }}
                label={i18n.t("reports.table.ticketsPerPage")}
                fullWidth
                MenuProps={{
                  anchorOrigin: {
                    vertical: "center",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "center",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
              >
                <MenuItem value={5}>{"5"}</MenuItem>
                <MenuItem value={10}>{"10"}</MenuItem>
                <MenuItem value={20}>{"20"}</MenuItem>
                <MenuItem value={50}>{"50"}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    </MainContainer>
  );
};

export default Reports;
