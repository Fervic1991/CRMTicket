import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Droppable } from 'react-beautiful-dnd';
import KanbanCard from './KanbanCard';
import { Typography } from '@material-ui/core';
import { useCurrency } from '../../utils/currencyUtils';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles(theme => ({
  column: props => ({
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 280,
    padding: theme.spacing(1.2),
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(10px)",
  }),
  columnTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '1rem',
    color: "rgba(15, 23, 42, 0.9)",
  },
  cardList: {
    flexGrow: 1,
    overflowY: 'auto',
    ...theme.scrollbarStyles,
    maxHeight: 'calc(100vh - 200px)',
  },
  totalValue: {
    fontSize: '1rem',
    color: "rgba(71, 85, 105, 0.9)",
    fontWeight: 600,
  },
  columnHeader: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(0.75, 1),
    borderRadius: 12,
    background: (props) =>
      `linear-gradient(135deg, ${props.color || "#94a3b8"}22, ${props.color || "#94a3b8"}08)`,
    border: "1px solid rgba(148, 163, 184, 0.35)",
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
