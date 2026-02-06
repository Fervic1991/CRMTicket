import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Avatar,
  Button,
  Tooltip,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@material-ui/core';
import { WhatsApp, Instagram, Facebook } from "@material-ui/icons";
import CloseIcon from '@material-ui/icons/Close';
import { format, parseISO, isSameDay } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import api from '../../services/api';
import { useCurrency } from '../../utils/currencyUtils';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles(theme => ({
  card: (props) => ({
    padding: theme.spacing(1),
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.3)",
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.10)',
    marginBottom: theme.spacing(1.2),
    cursor: 'grab',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: theme.spacing(1.5),
    overflow: "hidden",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 16px 28px rgba(15, 23, 42, 0.16)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      width: 4,
      background: props?.color || "rgba(148, 163, 184, 0.8)",
    },
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  headerMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
  },
  leftHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    marginRight: theme.spacing(1),
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    border: "2px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 6px 12px rgba(15, 23, 42, 0.12)",
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: "rgba(15, 23, 42, 0.9)",
    maxWidth: 140,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ticketNumber: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: "rgba(100, 116, 139, 0.9)",
  },
  divider: {
    background: "rgba(148, 163, 184, 0.35)",
  },
  lastMessageTime: {
    fontSize: '0.75rem',
    color: "rgba(100, 116, 139, 0.9)",
  },
  lastMessageTimeUnread: {
    fontSize: '0.75rem',
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  timeChip: {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    background: "rgba(248, 250, 252, 0.9)",
  },
  timeChipUnread: {
    color: "rgba(22, 163, 74, 0.95)",
    borderColor: "rgba(22, 163, 74, 0.3)",
    background: "rgba(34, 197, 94, 0.12)",
  },
  cardDescription: {
    fontSize: '0.85rem',
    color: "rgba(71, 85, 105, 0.9)",
    flexGrow: 1,
    marginRight: theme.spacing(1),
    lineHeight: 1.35,
  },
  valueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  descriptionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'auto',
  },
  cardButton: {
    fontSize: '0.7rem',
    padding: '4px 8px',
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 10,
    textTransform: "none",
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  connectionTag: {
    background: "rgba(15, 23, 42, 0.85)",
    color: '#FFF',
    padding: '3px 8px',
    fontWeight: 700,
    borderRadius: 999,
    fontSize: '0.65rem',
    marginLeft: 'auto',
  },
  channelIcon: {
    fontSize: 16,
    marginLeft: theme.spacing(0.5),
    color: "rgba(71, 85, 105, 0.9)",
  },
  opportunityValue: {
    fontSize: '0.85rem',
    color: theme.palette.primary.main,
    fontWeight: 700,
    cursor: 'pointer',
  },
  removeValueButton: {
    padding: 0,
    marginLeft: theme.spacing(1),
    color: theme.palette.error.main,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
    },
  },
  dialogPaper: {
    borderRadius: 14,
  },
  dialogButton: {
    borderRadius: 12,
    textTransform: "none",
  },
}));

const KanbanCard = ({ ticket, index, updateTicket, color }) => {
  const classes = useStyles({ color });
  const history = useHistory();
  const { formatCurrency } = useCurrency();

  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleCardClick = () => {
    history.push(`/tickets/${ticket.uuid}`);
  };

  const lastMessageTimeClass =
    Number(ticket.unreadMessages) > 0
      ? classes.lastMessageTimeUnread
      : classes.lastMessageTime;

  const customFields = ticket.contact.extraInfo || [];
  const valueFieldIndex = customFields.findIndex(field => field.name === 'valor');
  const valueField = valueFieldIndex !== -1 ? customFields[valueFieldIndex] : null;
  const opportunityValue = valueField ? parseFloat(valueField.value) : null;

  const handleOpenModal = () => {
    setNewValue(valueField ? valueField.value.toString() : '');
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const updateContactValue = async (contactId, value) => {
    try {
      await api.put(`/contacts/${contactId}`, {
        extraInfo: [{ name: 'valor', value: value.toString() }],
      });
    } catch (error) {
      console.error('Erro ao atualizar o valor:', error);
    }
  };

  const removeContactValue = async () => {
    try {
      await api.put(`/contacts/${ticket.contact.id}`, {
        extraInfo: [],
      });

      if (valueFieldIndex !== -1) {
        customFields.splice(valueFieldIndex, 1);
      }

      updateTicket({ ...ticket });

    } catch (error) {
      console.error('Erro ao remover o valor:', error);
    }
  };

  const handleSaveValue = async () => {
    await updateContactValue(ticket.contact.id, newValue);

    if (valueField) {
      valueField.value = newValue;
    } else {
      if (!ticket.contact.extraInfo) {
        ticket.contact.extraInfo = [];
      }
      ticket.contact.extraInfo.push({ name: 'valor', value: newValue });
    }

    updateTicket({ ...ticket });

    setOpen(false);
  };

  const timeChipClass =
    Number(ticket.unreadMessages) > 0
      ? `${classes.timeChip} ${classes.timeChipUnread}`
      : classes.timeChip;

  return (
    <Draggable draggableId={ticket.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className={classes.card}
          style={{
            boxShadow: snapshot.isDragging
              ? "0 20px 34px rgba(15, 23, 42, 0.22)"
              : undefined,
            transform: snapshot.isDragging ? "rotate(1deg)" : undefined,
          }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={classes.header}>
            <div className={classes.leftHeader}>
              <Avatar src={ticket.contact.urlPicture} className={classes.avatar} />
              <Tooltip title={ticket.contact.name}>
                <Typography className={classes.cardTitle}>
                  {ticket.contact.name || ' '}
                </Typography>
              </Tooltip>
            </div>
            <div className={classes.headerMeta}>
              {ticket.channel === "whatsapp" && <WhatsApp className={classes.channelIcon} />}
              {ticket.channel === "instagram" && <Instagram className={classes.channelIcon} />}
              {ticket.channel === "facebook" && <Facebook className={classes.channelIcon} />}
              <Typography className={classes.ticketNumber}>
                {i18n.t('kanban.ticketPrefix')} {ticket.id}
              </Typography>
            </div>
          </div>
          <Divider className={classes.divider} />
          <div className={classes.valueRow}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                className={classes.opportunityValue}
                onClick={handleOpenModal}
              >
                {opportunityValue !== null
                  ? `${i18n.t('kanban.value')}: ${formatCurrency(opportunityValue)}`
                  : i18n.t('kanban.assignValue')}
              </Typography>
              {opportunityValue !== null && (
                <Tooltip title={i18n.t('kanban.remove')}>
                  <IconButton
                    className={classes.removeValueButton}
                    onClick={removeContactValue}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
          <div className={classes.descriptionRow}>
            <Tooltip title={ticket.lastMessage || ' '}>
              <Typography className={classes.cardDescription}>
                {ticket.lastMessage?.substring(0, 20) || ' '}
              </Typography>
            </Tooltip>
            <Typography className={`${lastMessageTimeClass} ${timeChipClass}`}>
              {isSameDay(parseISO(ticket.updatedAt), new Date())
                ? format(parseISO(ticket.updatedAt), 'HH:mm')
                : format(parseISO(ticket.updatedAt), 'dd/MM/yyyy')}
            </Typography>
          </div>
          <div className={classes.footer}>
            <Button
              size="small"
              className={classes.cardButton}
              onClick={handleCardClick}
            >
              {i18n.t('kanban.viewTicket')}
            </Button>
            {ticket.user && (
              <Typography className={classes.connectionTag}>
                {ticket.user.name.toUpperCase()}
              </Typography>
            )}
          </div>
          <Dialog
            open={open}
            onClose={handleCloseModal}
            classes={{ paper: classes.dialogPaper }}
          >
            <DialogTitle>{valueField ? i18n.t('kanban.editValue') : i18n.t('kanban.assignValue')} {i18n.t('kanban.opportunityValue')}</DialogTitle>
            <DialogContent>
              <TextField
                label={i18n.t('kanban.value')}
                type="number"
                fullWidth
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                variant="outlined"
                size="small"
                className={classes.textField}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseModal}
                color="secondary"
                variant="outlined"
                className={classes.dialogButton}
              >
                {i18n.t('kanban.cancel')}
              </Button>
              <Button
                onClick={handleSaveValue}
                color="primary"
                variant="outlined"
                className={classes.dialogButton}
              >
                {i18n.t('kanban.saveValue')}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
