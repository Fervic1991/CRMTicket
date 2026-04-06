import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';

function PaymentDetails(props) {
  const { formValues } = props;
  const classes = useStyles();
  const { plan } = formValues;

  const newPlan = JSON.parse(plan);

  const { users, connections, queues } = newPlan;
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        Detalhes do plano
      </Typography>
      <Typography gutterBottom>Utenti: {users}</Typography>
      <Typography gutterBottom>Connessione: {connections}</Typography>
      <Typography gutterBottom>Code: {queues}</Typography>
      <Typography gutterBottom>Cobrança: Mensal</Typography>
    </Grid>
  );
}

export default PaymentDetails;
