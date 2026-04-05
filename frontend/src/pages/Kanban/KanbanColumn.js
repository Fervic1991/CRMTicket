import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Droppable } from 'react-beautiful-dnd';
import KanbanCard from './KanbanCard';
import { Typography } from '@material-ui/core';
import { useCurrency } from '../../utils/currencyUtils';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles(theme => ({
  column: props => ({
    backgroundColor: "#F4F7F9",
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 280,
    padding: theme.spacing(1.2),
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    border: "1px solid rgba(226, 232, 240, 0.95)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
  }),
  columnTitle: {
    marginBottom: theme.spacing(0.75),
    fontWeight: 800,
    fontSize: '1rem',
    color: "#0F172A",
  },
  cardList: {
    flexGrow: 1,
    overflowY: 'auto',
    ...theme.scrollbarStyles,
    maxHeight: 'calc(100vh - 200px)',
  },
  totalValue: {
    display: "inline-flex",
    alignSelf: "flex-start",
    fontSize: '0.75rem',
    color: "#64748B",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(226, 232, 240, 0.95)",
  },
  columnHeader: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1, 1.1),
    borderRadius: 12,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(226, 232, 240, 0.92)",
  },
}));

const KanbanColumn = ({ id, title, tickets, color, updateTicket }) => {
  const classes = useStyles({ color });
  const { formatCurrency } = useCurrency();

  const totalValue = tickets.reduce((acc, ticket) => {
    const customFields = ticket.contact.extraInfo || [];
    const valueField = customFields.find(field => field.name === 'valor');
    const opportunityValue = valueField ? parseFloat(valueField.value) : 0;
    return acc + opportunityValue;
  }, 0);

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          className={classes.column}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className={classes.columnHeader}>
            <Typography className={classes.columnTitle}>{title}</Typography>
            <Typography className={classes.totalValue}>
              {i18n.t('kanban.total')}: {formatCurrency(totalValue)}
            </Typography>
          </div>
          <div className={classes.cardList}>
            {tickets.map((ticket, index) => (
              <KanbanCard
                key={ticket.id}
                ticket={ticket}
                index={index}
                color={color}
                updateTicket={updateTicket}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
