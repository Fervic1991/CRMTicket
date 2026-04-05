import React, { useEffect, useState, useContext, useCallback, useMemo, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Grid, TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { i18n } from '../../translate/i18n';
import { AuthContext } from '../../context/Auth/AuthContext';

const useStyles = makeStyles((theme) => ({
  chartTitle: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800,
    fontSize: '1.05rem',
    color: theme.palette.mode === 'dark' ? '#E2E8F0' : '#1E293B',
    marginBottom: theme.spacing(1.5),
  },
  filtersRow: {
    marginBottom: theme.spacing(2),
    alignItems: 'center',
  },
  field: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      background: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.72)' : '#F8FAFC',
    },
  },
  button: {
    minHeight: 40,
    borderRadius: 10,
    textTransform: 'none',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
    boxShadow: '0 12px 24px rgba(37,99,235,0.24)',
  },
}));

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const buildGradient = (context) => {
  const chart = context.chart;
  const { ctx, chartArea } = chart;
  if (!chartArea) return '#3B82F6';
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, '#38BDF8');
  gradient.addColorStop(1, '#2563EB');
  return gradient;
};

export const ChartsDate = memo(() => {
  const theme = useTheme();
  const classes = useStyles();
  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const { user } = useContext(AuthContext);

  const companyId = user?.companyId;

  const handleGetTicketsInformation = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data } = await api.get('/dashboard/ticketsDay', {
        params: {
          initialDate: format(initialDate, 'yyyy-MM-dd'),
          finalDate: format(finalDate, 'yyyy-MM-dd'),
          companyId,
        },
      });
      setTicketsData(data);
    } catch (error) {
      toast.error('Erro ao buscar informações dos tickets');
    }
  }, [initialDate, finalDate, companyId]);

  useEffect(() => {
    if (companyId && !hasInitialLoad) {
      handleGetTicketsInformation();
      setHasInitialLoad(true);
    }
  }, [companyId, hasInitialLoad, handleGetTicketsInformation]);

  const dataCharts = useMemo(() => {
    const hasData = ticketsData?.data?.length > 0;
    if (!hasData) {
      return { labels: [], datasets: [{ data: [], backgroundColor: '#2563EB' }] };
    }

    return {
      labels: ticketsData.data.map((item) =>
        Object.prototype.hasOwnProperty.call(item, 'horario')
          ? `Das ${item.horario}:00 as ${item.horario}:59`
          : item.data
      ),
      datasets: [
        {
          data: ticketsData.data.map((item) => item.total),
          backgroundColor: (context) => buildGradient(context),
          borderRadius: 6,
          borderSkipped: 'bottom',
          maxBarThickness: 40,
        },
      ],
    };
  }, [ticketsData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.95)' : '#0F172A',
          titleColor: '#F8FAFC',
          bodyColor: '#F8FAFC',
          padding: 12,
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            color: theme.palette.mode === 'dark' ? '#CBD5E1' : '#64748B',
            font: { family: 'Inter, sans-serif', size: 11 },
          },
        },
        y: {
          grid: { color: '#F1F5F9', drawBorder: false },
          ticks: {
            color: theme.palette.mode === 'dark' ? '#94A3B8' : '#64748B',
            font: { family: 'Inter, sans-serif', size: 11 },
            precision: 0,
          },
        },
      },
    }),
    [theme.palette.mode]
  );

  return (
    <>
      <Typography className={classes.chartTitle}>
        {i18n.t('dashboard.users.totalAttendances')} ({ticketsData?.count})
      </Typography>

      <Grid container spacing={2} className={classes.filtersRow}>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
            <DatePicker
              value={initialDate}
              onChange={setInitialDate}
              label={i18n.t('dashboard.date.initialDate')}
              renderInput={(params) => <TextField {...params} className={classes.field} />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
            <DatePicker
              value={finalDate}
              onChange={setFinalDate}
              label={i18n.t('dashboard.date.finalDate')}
              renderInput={(params) => <TextField {...params} className={classes.field} />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <Button className={classes.button} onClick={handleGetTicketsInformation} variant="contained">
            Filtrar
          </Button>
        </Grid>
      </Grid>
      <div style={{ height: 310 }}>
        <Bar options={chartOptions} data={dataCharts} />
      </div>
    </>
  );
});
