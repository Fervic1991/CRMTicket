import pino from 'pino';
import moment from 'moment-timezone';

const APP_TIMEZONE = process.env.APP_TIMEZONE || process.env.TZ || 'Europe/Rome';

// Função para obter o timestamp com fuso horário
const timezoned = () => {
  return moment().tz(APP_TIMEZONE).format('DD-MM-YYYY HH:mm:ss');
};

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss', // Use this para tradução de tempo
      ignore: "pid,hostname"
    },
  },
  timestamp: () => `,"time":"${timezoned()}"`, // Adiciona o timestamp formatado
});

export default logger;
