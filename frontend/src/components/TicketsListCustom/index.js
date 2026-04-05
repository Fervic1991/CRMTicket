import React, { useState, useEffect, useReducer, useContext, useMemo, useCallback, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";

import TicketListItem from "../TicketListItemCustom";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { throttle, debounce } from "../../utils/debounce";

const useStyles = makeStyles((theme) => ({
    ticketsListWrapper: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        background: theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(17, 24, 39, 0.88))"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.94))",
    },

    ticketsList: {
        flex: 1,
        maxHeight: "100%",
        overflowY: "scroll",
        ...theme.scrollbarStyles,
        borderTop: "1px solid rgba(148, 163, 184, 0.16)",
        background: "transparent",
        padding: theme.spacing(1.5, 1.5, 2),
    },

    ticketsListHeader: {
        color: "rgb(67, 83, 105)",
        zIndex: 2,
        backgroundColor: "white",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },

    ticketsCount: {
        fontWeight: "normal",
        color: "rgb(104, 121, 146)",
        marginLeft: "8px",
        fontSize: "14px",
    },

    noTicketsText: {
        textAlign: "center",
        color: theme.palette.mode === "dark" ? "rgba(226, 232, 240, 0.74)" : "rgb(100, 116, 139)",
        fontSize: "13px",
        lineHeight: "1.85",
        fontWeight: 500,
        maxWidth: 320,
        margin: theme.spacing(0.75, 0, 0),
    },

    noTicketsTitle: {
        textAlign: "center",
        fontSize: "18px",
        fontWeight: 700,
        color: theme.palette.mode === "dark" ? "#F8FAFC" : "#0F172A",
        margin: theme.spacing(2, 0, 0),
    },

    noTicketsDiv: {
        display: "flex",
        margin: "40px 16px",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
        borderRadius: 24,
        padding: theme.spacing(4, 3),
        background: theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(30, 41, 59, 0.72), rgba(15, 23, 42, 0.86))"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(241, 245, 249, 0.96))",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    },
}));

const EmptyTicketsIllustration = () => (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <linearGradient id="ticketsEmptyBg" x1="34" y1="28" x2="185" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E0F2FE" />
                <stop offset="1" stopColor="#F8FAFC" />
            </linearGradient>
            <linearGradient id="ticketsEmptyCard" x1="66" y1="42" x2="160" y2="124" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#EFF6FF" />
            </linearGradient>
        </defs>
        <circle cx="110" cy="80" r="64" fill="url(#ticketsEmptyBg)" />
        <circle cx="52" cy="42" r="10" fill="#C7D2FE" opacity="0.6" />
        <circle cx="174" cy="116" r="14" fill="#BFDBFE" opacity="0.7" />
        <circle cx="188" cy="44" r="6" fill="#86EFAC" opacity="0.7" />
        <rect x="58" y="40" width="104" height="82" rx="20" fill="url(#ticketsEmptyCard)" stroke="#DBEAFE" />
        <rect x="78" y="58" width="64" height="10" rx="5" fill="#BFDBFE" />
        <rect x="78" y="76" width="46" height="8" rx="4" fill="#E2E8F0" />
        <rect x="78" y="90" width="54" height="8" rx="4" fill="#E2E8F0" />
        <circle cx="143" cy="92" r="12" fill="#D1FAE5" />
        <path d="M137 92L141 96L149 88" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ticketSortAsc = (a, b) => {
    
    if (a.updatedAt < b.updatedAt) {
        return -1;
    }
    if (a.updatedAt > b.updatedAt) {
        return 1;
    }
    return 0;
}

const ticketSortDesc = (a, b) => {
   
    if (a.updatedAt > b.updatedAt) {
        return -1;
    }
    if (a.updatedAt < b.updatedAt) {
        return 1;
    }
    return 0;
}

const reducer = (state, action) => {
    //console.log("action", action, state)
    const sortDir = action.sortDir;
    
    if (action.type === "LOAD_TICKETS") {
        const newTickets = action.payload;

        newTickets.forEach((ticket) => {
            const ticketIndex = state.findIndex((t) => t.id === ticket.id);
            if (ticketIndex !== -1) {
                state[ticketIndex] = ticket;
                if (ticket.unreadMessages > 0) {
                    state.unshift(state.splice(ticketIndex, 1)[0]);
                }
            } else {
                state.push(ticket);
            }
        });
        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "RESET_UNREAD") {
        const ticketId = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
            state[ticketIndex].unreadMessages = 0;
        }

        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
        } else {
            state.unshift(ticket);
        }
        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
            state.unshift(state.splice(ticketIndex, 1)[0]);
        } else {
            if (action.status === action.payload.status) {
                state.unshift(ticket);
            }
        }
        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_CONTACT") {
        const contact = action.payload;
        const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
        if (ticketIndex !== -1) {
            state[ticketIndex].contact = contact;
        }
        return [...state];
    }

    if (action.type === "DELETE_TICKET") {
        const ticketId = action.payload;
        const ticketIndex = state.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
            state.splice(ticketIndex, 1);
        }

        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const TicketsListCustom = (props) => {
    const {
        setTabOpen,
        status,
        searchParam,
        searchOnMessages,
        tags,
        users,
        showAll,
        selectedQueueIds,
        updateCount,
        style,
        whatsappIds,
        forceSearch,
        statusFilter,
        userFilter,
        sortTickets
    } = props;

    const classes = useStyles();
    const [pageNumber, setPageNumber] = useState(1);
    let [ticketsList, dispatch] = useReducer(reducer, []);
    //   const socketManager = useContext(SocketContext);
    const { user, socket } = useContext(AuthContext);

    const { profile, queues } = user;
    const showTicketWithoutQueue = user.allTicket === 'enable';
    const companyId = user.companyId;

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [status, searchParam, dispatch, showAll, tags, users, forceSearch, selectedQueueIds, whatsappIds, statusFilter, sortTickets, searchOnMessages]);

    const { tickets, hasMore, loading } = useTickets({
        pageNumber,
        searchParam,
        status,
        showAll,
        searchOnMessages: searchOnMessages ? "true" : "false",
        tags: JSON.stringify(tags),
        users: JSON.stringify(users),
        queueIds: JSON.stringify(selectedQueueIds),
        whatsappIds: JSON.stringify(whatsappIds),
        statusFilter: JSON.stringify(statusFilter),
        userFilter,
        sortTickets
    });


    useEffect(() => {
        // const queueIds = queues.map((q) => q.id);
        // const filteredTickets = tickets.filter(
        //     (t) => queueIds.indexOf(t.queueId) > -1
        // );
        // const allticket = user.allTicket === 'enabled';
        // if (profile === "admin" || allTicket || allowGroup || allHistoric) {
        if (companyId) {
            dispatch({
                type: "LOAD_TICKETS",
                payload: tickets,
                status,
                sortDir: sortTickets
            });
        }
        // } else {
        //  dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });
        // }

    }, [tickets]);

    // Funções de validação memoizadas
    const shouldUpdateTicket = useCallback((ticket) => {
        return (!ticket?.userId || ticket?.userId === user?.id || showAll) &&
            ((!ticket?.queueId && showTicketWithoutQueue) || selectedQueueIds.indexOf(ticket?.queueId) > -1)
    }, [user?.id, showAll, showTicketWithoutQueue, selectedQueueIds]);

    const notBelongsToUserQueues = useCallback((ticket) =>
        ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1,
    [selectedQueueIds]);

    // Handlers com throttle/debounce
    const throttledDispatch = useMemo(
        () => throttle((action) => dispatch(action), 100),
        []
    );

    // Socket handlers memoizados
const onCompanyTicketTicketsList = useCallback((data) => {
    console.log("🔔 Socket event ricevuto:", data.action, data.ticket?.status, data.ticketId);
    if (data.action === "updateUnread") {
        throttledDispatch({
            type: "RESET_UNREAD",
            payload: data.ticketId,
            status: status,
            sortDir: sortTickets
        });
    }
     // PATCH: aggiorna la lista anche se il ticket è "pending"
    if (data.action === "update" && data.ticket) {
        if (
            shouldUpdateTicket(data.ticket) &&
            (data.ticket.status === status || data.ticket.status === "pending")
        ) {
            throttledDispatch({
                type: "UPDATE_TICKET",
                payload: data.ticket,
                status: status,
                sortDir: sortTickets
            });
        }

        if (notBelongsToUserQueues(data.ticket)) {
            throttledDispatch({
                type: "DELETE_TICKET", 
                payload: data.ticket?.id, 
                status: status,
                sortDir: sortTickets
            });
        }
    }

    // Quando arriva "delete" SENZA ticket object (solo ticketId)
    if (data.action === "delete") {
        console.log("❌ Eliminando ticket:", data?.ticketId);
        dispatch({
            type: "DELETE_TICKET", 
            payload: data?.ticketId, 
            status: status,
            sortDir: sortTickets
        });
        
        // FORCE RELOAD: Ricarica la lista dal server dopo 500ms
        /*setTimeout(() => {
            console.log("🔄 Ricaricando lista ticket...");
            dispatch({ type: "RESET" });
            setPageNumber(1);
        }, 500);*/
    }
}, [shouldUpdateTicket, notBelongsToUserQueues, status, sortTickets, throttledDispatch]);

    const onCompanyAppMessageTicketsList = useCallback((data) => {
        if (data.action === "create" &&
            shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
            throttledDispatch({
                type: "UPDATE_TICKET",
                payload: data.ticket,
                status: status,
                sortDir: sortTickets
            });
        }
    }, [shouldUpdateTicket, status, sortTickets, throttledDispatch]);

    const onCompanyContactTicketsList = useCallback((data) => {
        if (data.action === "update" && data.contact) {
            throttledDispatch({
                type: "UPDATE_TICKET_CONTACT",
                payload: data.contact,
                status: status,
                sortDir: sortTickets
            });
        }
    }, [status, sortTickets, throttledDispatch]);

    // UseEffect apenas para gerenciar join/leave de rooms
    useEffect(() => {
        if (socket) {
            if (status) {
                socket.emit("joinTickets", status);
            } else {
                socket.emit("joinNotification");
            }
        }

        return () => {
            if (socket) {
                if (status) {
                    socket.emit("leaveTickets", status);
                } else {
                    socket.emit("leaveNotification");
                }
            }
        };
    }, [status, socket]);

    // UseEffect separado para socket listeners
    useEffect(() => {
        if (!socket) return;
        
        const onConnectTicketsList = () => {
            if (socket) {
                if (status) {
                    socket.emit("joinTickets", status);
                } else {
                    socket.emit("joinNotification");
                }
            }
        }

        socket.on("connect", onConnectTicketsList)
        socket.on(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
        socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
        socket.on(`company-${companyId}-contact`, onCompanyContactTicketsList);

        return () => {
            if (socket) {
                socket.off("connect", onConnectTicketsList);
                socket.off(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
                socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
                socket.off(`company-${companyId}-contact`, onCompanyContactTicketsList);
            }
        };
    }, [companyId, status, socket, onCompanyTicketTicketsList, onCompanyAppMessageTicketsList, onCompanyContactTicketsList]);

    useEffect(() => {
        if (typeof updateCount === "function") {
            updateCount(ticketsList.length);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketsList]);

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

    if (status && status !== "search") {
        ticketsList = ticketsList.filter(ticket => ticket.status === status)
    }

    return (
        <Paper className={classes.ticketsListWrapper} style={style}>
            <Paper
                square
                name="closed"
                elevation={0}
                className={classes.ticketsList}
                onScroll={handleScroll}
            >
                <List style={{ paddingTop: 0 }} >
                    {ticketsList.length === 0 && !loading ? (
                        <div className={classes.noTicketsDiv}>
                            <EmptyTicketsIllustration />
                            <span className={classes.noTicketsTitle}>
                                {i18n.t("ticketsList.noTicketsTitle")}
                            </span>
                            <p className={classes.noTicketsText}>
                                {i18n.t("ticketsList.noTicketsMessage")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {ticketsList.map((ticket) => (
                                // <List key={ticket.id}>
                                //     {console.log(ticket)}
                                <TicketListItem
                                    ticket={ticket}
                                    key={ticket.id}
                                    setTabOpen={setTabOpen}
                                />
                                // </List>
                            ))}
                        </>
                    )}
                    {loading && <TicketsListSkeleton />}
                </List>
            </Paper>
        </Paper>
    );
};

export default React.memo(TicketsListCustom);
