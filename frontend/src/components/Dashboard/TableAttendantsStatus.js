import React, { memo, useMemo } from "react";

import Paper from "@material-ui/core/Paper";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from "@material-ui/lab/Skeleton";
import Avatar from '@material-ui/core/Avatar';

import { makeStyles } from "@material-ui/core/styles";

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import moment from 'moment';

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  tablePaper: {
    background: "transparent",
    boxShadow: "none",
    borderRadius: 18,
    overflow: "hidden",
  },
  tableContainer: {
    overflowX: "auto",
    '&::-webkit-scrollbar': {
      height: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.28)',
      borderRadius: 999,
    },
  },
  table: {
    minWidth: 760,
  },
  headerCell: {
    borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(148,163,184,0.12)' : '1px solid #E2E8F0',
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: theme.spacing(1.5, 2),
    background: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.34)' : '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  row: {
    transition: 'background-color 180ms ease, transform 180ms ease',
    '&:hover': {
      background: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.42)' : '#F8FAFC',
    },
  },
  bodyCell: {
    padding: theme.spacing(1.8, 2),
    borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(148,163,184,0.08)' : '1px solid rgba(226,232,240,0.75)',
    color: theme.palette.mode === 'dark' ? '#E2E8F0' : '#1E293B',
    whiteSpace: 'nowrap',
  },
  attendantCell: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    minWidth: 190,
  },
  avatar: {
    width: 34,
    height: 34,
    fontSize: 13,
    fontWeight: 700,
    background: 'linear-gradient(135deg, rgba(37,99,235,0.92), rgba(96,165,250,0.92))',
    color: '#FFFFFF',
    boxShadow: '0 10px 18px rgba(37,99,235,0.22)',
  },
  statusWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 16,
    height: 16,
  },
  pulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'rgba(16,185,129,0.24)',
    animation: '$pulse 1.8s ease-out infinite',
  },
  on: {
    color: '#10B981',
    fontSize: 16,
    zIndex: 1,
  },
  off: {
    color: '#94A3B8',
    fontSize: 16,
    zIndex: 1,
  },
  numeric: {
    fontWeight: 600,
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(0.9)', opacity: 0.65 },
    '70%': { transform: 'scale(1.8)', opacity: 0 },
    '100%': { transform: 'scale(1.8)', opacity: 0 },
  },
}));

const formatTime = (minutes) => {
  return moment().startOf('day').add(minutes || 0, 'minutes').format('HH[h] mm[m]');
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const AttendantRow = memo(({ attendant, classes }) => {
  return (
    <TableRow className={classes.row}>
      <TableCell className={classes.bodyCell}>
        <div className={classes.attendantCell}>
          <Avatar className={classes.avatar}>{getInitials(attendant.name)}</Avatar>
          <span>{attendant.name}</span>
        </div>
      </TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.numeric}`} align="center">{attendant.rating}</TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.numeric}`} align="center">{attendant.countRating}</TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.numeric}`} align="center">{attendant.tickets}</TableCell>
      <TableCell className={classes.bodyCell} align="center">{formatTime(attendant.avgWaitTime)}</TableCell>
      <TableCell className={classes.bodyCell} align="center">{formatTime(attendant.avgSupportTime)}</TableCell>
      <TableCell className={classes.bodyCell} align="center">
        {attendant.online ? (
          <Tooltip title="Online">
            <span className={classes.statusWrap}>
              <span className={classes.pulse} />
              <CheckCircleIcon className={classes.on} />
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Offline">
            <span className={classes.statusWrap}>
              <ErrorIcon className={classes.off} />
            </span>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
});

const TableAttendantsStatus = memo(({ loading, attendants }) => {
  const classes = useStyles();

  const tableHeaders = useMemo(() => (
    <TableHead>
      <TableRow>
        <TableCell className={classes.headerCell}>{i18n.t("dashboard.users.name")}</TableCell>
        <TableCell className={classes.headerCell} align="center">{i18n.t("dashboard.assessments.score")}</TableCell>
        <TableCell className={classes.headerCell} align="center">{i18n.t("dashboard.assessments.ratedCalls")}</TableCell>
        <TableCell className={classes.headerCell} align="center">{i18n.t("dashboard.assessments.totalCalls")}</TableCell>
        <TableCell className={classes.headerCell} align="center">{i18n.t("dashboard.cards.averageWaitingTime")}</TableCell>
        <TableCell className={classes.headerCell} align="center">{i18n.t("dashboard.cards.averageServiceTime")}</TableCell>
        <TableCell className={classes.headerCell} align="center">{i18n.t("dashboard.cards.status")}</TableCell>
      </TableRow>
    </TableHead>
  ), [classes.headerCell]);

  const tableBody = useMemo(() => (
    <TableBody>
      {attendants.map((attendant, index) => (
        <AttendantRow key={attendant.id || index} attendant={attendant} classes={classes} />
      ))}
    </TableBody>
  ), [attendants, classes]);

  if (loading) {
    return <Skeleton variant="rect" height={220} style={{ borderRadius: 18 }} />;
  }

  return (
    <TableContainer component={Paper} className={`${classes.tablePaper} ${classes.tableContainer}`}>
      <Table className={classes.table}>
        {tableHeaders}
        {tableBody}
      </Table>
    </TableContainer>
  );
});

export default TableAttendantsStatus;
