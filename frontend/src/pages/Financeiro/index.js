import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload.invoices || action.payload;
    const newInvoices = [];

    invoices.forEach((invoice) => {
      const invoiceIndex = state.findIndex((i) => i.id === invoice.id);
      if (invoiceIndex !== -1) {
        state[invoiceIndex] = invoice;
      } else {
        newInvoices.push(invoice);
      }
    });

    return [...state, ...newInvoices];
  }

  if (action.type === "UPDATE_INVOICES") {
    const invoice = action.payload;
    const invoiceIndex = state.findIndex((i) => i.id === invoice.id);

    if (invoiceIndex !== -1) {
      state[invoiceIndex] = invoice;
      return [...state];
    } else {
      return [invoice, ...state];
    }
  }

  if (action.type === "DELETE_INVOICE") {
    const invoiceId = action.payload;

    const invoiceIndex = state.findIndex((i) => i.id === invoiceId);
    if (invoiceIndex !== -1) {
      state.splice(invoiceIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  headerCard: {
    width: "100%",
    borderRadius: 18,
    padding: theme.spacing(2),
    background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,248,255,0.9))",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 18px 45px rgba(31, 45, 61, 0.08)",
  },
  headerTitle: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  alertBanner: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(255,235,238,0.9), rgba(255,245,245,0.95))",
    border: "1px solid rgba(239,154,154,0.6)",
    color: "#b71c1c",
    fontWeight: 600,
  },
  summaryBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderRadius: 16,
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 12px 30px rgba(31, 45, 61, 0.06)",
  },
  summaryChip: {
    borderRadius: 999,
    padding: "2px 6px",
    background: "rgba(63,81,181,0.08)",
    border: "1px solid rgba(63,81,181,0.2)",
    fontWeight: 600,
  },
  summaryCount: {
    marginLeft: 6,
    fontWeight: 700,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    borderRadius: 18,
    background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,255,0.95) 100%)",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 20px 55px rgba(31, 45, 61, 0.08)",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  tableHeader: {
    fontWeight: 700,
    backgroundColor: "rgba(243,246,252,0.9)",
    color: theme.palette.text.secondary,
    borderBottom: "1px solid rgba(120,130,160,0.2)",
  },
  tableRow: {
    backgroundColor: "rgba(255,255,255,0.85)",
    boxShadow: "0 8px 18px rgba(31,45,61,0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 16px 30px rgba(31,45,61,0.12)",
    },
    "& > td": {
      borderBottom: "none",
    },
    "& td:first-child": {
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: 14,
    },
    "& td:last-child": {
      borderTopRightRadius: 14,
      borderBottomRightRadius: 14,
    },
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: "0.75rem",
    border: "1px solid rgba(120,130,160,0.2)",
  },
  statusPaid: {
    background: "linear-gradient(135deg, rgba(76,175,80,0.18), rgba(165,214,167,0.35))",
    color: "#1b5e20",
    borderColor: "rgba(76,175,80,0.3)",
  },
  statusOpen: {
    background: "linear-gradient(135deg, rgba(63,81,181,0.18), rgba(98,125,240,0.35))",
    color: theme.palette.primary.dark,
    borderColor: "rgba(63,81,181,0.3)",
  },
  statusExpired: {
    background: "linear-gradient(135deg, rgba(244,67,54,0.18), rgba(255,171,145,0.35))",
    color: "#b71c1c",
    borderColor: "rgba(244,67,54,0.3)",
  },
  actionButton: {
    height: 36,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: "none",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(120,130,160,0.2)",
  },
  actionPrimary: {
    height: 36,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: "none",
    background: "linear-gradient(135deg, rgba(233,30,99,0.9), rgba(244,67,54,0.9))",
    color: "#fff",
    border: "none",
    boxShadow: "0 12px 28px rgba(244,67,54,0.25)",
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  emptyStateIcon: {
    width: 78,
    height: 78,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(63,81,181,0.15), rgba(25,118,210,0.25))",
    border: "1px solid rgba(63,81,181,0.2)",
    color: theme.palette.primary.main,
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, ] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isCompanyExpired, setIsCompanyExpired] = useState(false);

  // Verificar se a empresa está vencida
  useEffect(() => {
    if (user && user.company) {
      const hoje = moment();
      const vencimento = moment(user.company.dueDate);
      const isExpired = hoje.isAfter(vencimento);
      setIsCompanyExpired(isExpired);
    }
  }, [user]);

  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          console.log("Buscando faturas...", { searchParam, pageNumber });
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });

          console.log("Dados recebidos:", data);
          dispatch({ type: "LOAD_INVOICES", payload: data });
          console.log("Dispatch realizado com payload:", data);
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          console.error("Erro ao buscar faturas:", err);
          toastError(err);
          setLoading(false);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const rowStyle = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();
    if (dias < 0 && record.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();
    const status = record.status;
    if (status === "paid") {
      return i18n.t("financial.paid");
    }
    if (dias < 0) {
      return i18n.t("financial.expired");
    } else {
      return i18n.t("financial.open");
    }
  }

  const getStatusClass = (statusLabel) => {
    if (statusLabel === i18n.t("financial.paid")) return classes.statusPaid;
    if (statusLabel === i18n.t("financial.expired")) return classes.statusExpired;
    return classes.statusOpen;
  };

  const summary = invoices.reduce(
    (acc, invoice) => {
      acc.total += 1;
      const statusLabel = rowStatus(invoice);
      if (statusLabel === i18n.t("financial.paid")) acc.paid += 1;
      if (statusLabel === i18n.t("financial.expired")) acc.expired += 1;
      if (statusLabel === i18n.t("financial.open")) acc.open += 1;
      return acc;
    },
    { total: 0, paid: 0, expired: 0, open: 0 }
  );
  
  const renderUseWhatsapp = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };
  const renderUseFacebook = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };
  const renderUseInstagram = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };
  const renderUseCampaigns = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };
  const renderUseSchedules = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };
  const renderUseInternalChat = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };
  const renderUseExternalApi = (row) => { return row.status === false ? i18n.t("financial.no") : i18n.t("financial.yes") };

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}

      ></SubscriptionModal>
      <MainHeader>
        <div className={classes.headerCard}>
          <Title className={classes.headerTitle}>{i18n.t("financial.title")}</Title>
          {isCompanyExpired && (
            <div className={classes.alertBanner}>
              <strong>{i18n.t("financial.attentionMessage")}</strong> {i18n.t("financial.expiredWarning")}
            </div>
          )}
        </div>
      </MainHeader>
      <Paper className={classes.summaryBar}>
        <span className={classes.summaryChip}>
          {i18n.t("financial.summary.total")}
          <span className={classes.summaryCount}>{summary.total}</span>
        </span>
        <span className={classes.summaryChip}>
          {i18n.t("financial.summary.open")}
          <span className={classes.summaryCount}>{summary.open}</span>
        </span>
        <span className={classes.summaryChip}>
          {i18n.t("financial.summary.paid")}
          <span className={classes.summaryCount}>{summary.paid}</span>
        </span>
        <span className={classes.summaryChip}>
          {i18n.t("financial.summary.expired")}
          <span className={classes.summaryCount}>{summary.expired}</span>
        </span>
      </Paper>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              {/* <TableCell align="center">Id</TableCell> */}
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.details")}</TableCell>

              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.users")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.connections")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.queues")}</TableCell>
              {/* <TableCell align="center">Whatsapp</TableCell>
              <TableCell align="center">Facebook</TableCell>
              <TableCell align="center">Instagram</TableCell> */}
              {/* <TableCell align="center">Campanhas</TableCell>
              <TableCell align="center">Agendamentos</TableCell>
              <TableCell align="center">Chat Interno</TableCell>
              <TableCell align="center">Rest PI</TableCell> */}

              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.value")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.expirationDate")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.status")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("financial.action")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {invoices.map((invoices) => (
                <TableRow style={rowStyle(invoices)} key={invoices.id} className={classes.tableRow}>
                  {/* <TableCell align="center">{invoices.id}</TableCell> */}
                  <TableCell align="center">{invoices.detail}</TableCell>

                  <TableCell align="center">{invoices.users}</TableCell>
                  <TableCell align="center">{invoices.connections}</TableCell>
                  <TableCell align="center">{invoices.queues}</TableCell>
                  {/* <TableCell align="center">{renderUseWhatsapp(invoices.useWhatsapp)}</TableCell>
                  <TableCell align="center">{renderUseFacebook(invoices.useFacebook)}</TableCell>
                  <TableCell align="center">{renderUseInstagram(invoices.useInstagram)}</TableCell> */}
                  {/* <TableCell align="center">{renderUseCampaigns(invoices.useCampaigns)}</TableCell>
                  <TableCell align="center">{renderUseSchedules(invoices.useSchedules)}</TableCell>
                  <TableCell align="center">{renderUseInternalChat(invoices.useInternalChat)}</TableCell>
                  <TableCell align="center">{renderUseExternalApi(invoices.useExternalApi)}</TableCell> */}

                  <TableCell style={{ fontWeight: 'bold' }} align="center">{invoices.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell align="center">{moment(invoices.dueDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell align="center">
                    <span className={`${classes.statusPill} ${getStatusClass(rowStatus(invoices))}`}>
                      {rowStatus(invoices)}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    {rowStatus(invoices) !== i18n.t("financial.paid") ?
                      <Button
                        size="small"
                        variant="contained"
                        className={classes.actionPrimary}
                        onClick={() => handleOpenContactModal(invoices)}
                      >
                        {i18n.t("financial.pay")}
                      </Button> :
                      <Button
                        size="small"
                        variant="outlined"
                        className={classes.actionButton}
                      // color="secondary"
                      >
                        {i18n.t("financial.paid")}
                      </Button>}

                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
              {!loading && invoices.length === 0 && (
                <TableRow>
                  <TableCell align="center" colSpan={8} className={classes.emptyState}>
                    <div className={classes.emptyStateIcon}>$</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      {i18n.t("financial.emptyState.title")}
                    </div>
                    <div>{i18n.t("financial.emptyState.description")}</div>
                  </TableCell>
                </TableRow>
              )}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
