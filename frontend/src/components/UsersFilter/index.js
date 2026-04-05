import { Avatar, Box, Chip, TextField, Typography, makeStyles } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
  },
  label: {
    marginBottom: theme.spacing(0.75),
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  autocomplete: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      background: "#FFFFFF",
      '& fieldset': {
        borderColor: "#E2E8F0",
      },
      '&:hover fieldset': {
        borderColor: "#CBD5E1",
      },
      '&.Mui-focused fieldset': {
        borderColor: "#2563EB",
      },
    },
  },
  chip: {
    borderRadius: 999,
    background: "#EFF6FF",
    color: "#1E3A8A",
    border: "1px solid rgba(37,99,235,0.12)",
    '& .MuiChip-avatar': {
      color: "#fff",
      background: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
      fontSize: 11,
      fontWeight: 700,
    },
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  optionAvatar: {
    width: 28,
    height: 28,
    fontSize: 11,
    fontWeight: 700,
    background: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
  },
}));

const getInitials = name => {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
};

export function UsersFilter({ onFiltered, initialUsers, label }) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadUsers();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelecteds([]);
    if (Array.isArray(initialUsers) && Array.isArray(users) && users.length > 0) {
      onChange(initialUsers);
    }
  }, [initialUsers, users]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get(`/users/list`);
      const userList = data.map(u => ({ id: u.id, name: u.name }));
      setUsers(userList);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async value => {
    setSelecteds(value);
    onFiltered(value);
  };

  return (
    <Box className={classes.root}>
      <Typography className={classes.label}>
        {label || i18n.t("chatIndex.modal.filterUsers")}
      </Typography>
      <Autocomplete
        multiple
        size="small"
        options={users}
        value={selecteds}
        className={classes.autocomplete}
        onChange={(e, v) => onChange(v)}
        getOptionLabel={option => option.name}
        getOptionSelected={(option, value) => (
          option?.id === value?.id || option?.name?.toLowerCase() === value?.name?.toLowerCase()
        )}
        renderOption={option => (
          <div className={classes.optionRow}>
            <Avatar className={classes.optionAvatar}>{getInitials(option.name)}</Avatar>
            <span>{option.name}</span>
          </div>
        )}
        renderTags={(value, getUserProps) =>
          value.map((option, index) => (
            <Chip
              avatar={<Avatar>{getInitials(option.name)}</Avatar>}
              className={classes.chip}
              label={option.name}
              {...getUserProps({ index })}
              size="small"
            />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={i18n.t("chatIndex.modal.filterUsers")}
          />
        )}
      />
    </Box>
  );
}
