import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import * as Sentry from "@sentry/node";
import { config as dotenvConfig } from "dotenv";
import bodyParser from 'body-parser';

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import logger from "./utils/logger";
import languageMiddleware from "./middleware/languageMiddleware";
import { messageQueue, sendScheduledMessages } from "./queues";
import BullQueue from "./libs/queue"
import BullBoard from 'bull-board';
import basicAuth from 'basic-auth';

// Função de middleware para autenticação básica
export const isBullAuth = (req, res, next) => {
  const user = basicAuth(req);

  if (!user || user.name !== process.env.BULL_USER || user.pass !== process.env.BULL_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Carregar variáveis de ambiente
dotenvConfig();

// Inicializar Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Configuração de filas
app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
].filter(Boolean);

console.log("🔧 CORS - Origens permitidas:", allowedOrigins);

// Configuração do BullBoard
if (String(process.env.BULL_BOARD).toLocaleLowerCase() === 'true' && process.env.REDIS_URI_ACK !== '') {
  BullBoard.setQueues(BullQueue.queues.map(queue => queue && queue.bull));
  app.use('/admin/queues', isBullAuth, BullBoard.UI);
}

// Middlewares
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'", "http://localhost:8080"],
//       imgSrc: ["'self'", "data:", "http://localhost:8080"],
//       scriptSrc: ["'self'", "http://localhost:8080"],
//       styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:8080"],
//       connectSrc: ["'self'", "http://localhost:8080"]
//     }
//   },
//   crossOriginResourcePolicy: false, // Permite recursos de diferentes origens
//   crossOriginEmbedderPolicy: false, // Permite incorporação de diferentes origens
//   crossOriginOpenerPolicy: false, // Permite abertura de diferentes origens
//   // crossOriginResourcePolicy: {
//   //   policy: "cross-origin" // Permite carregamento de recursos de diferentes origens
//   // }
// }));

app.use(compression()); // Compressão HTTP
app.use(bodyParser.json({ limit: '5mb' })); // Aumentar o limite de carga para 5 MB
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Permitir requisições sem origin (Postman, Insomnia, servidor)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS bloqueou origem não permitida: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-User-Language'],
    exposedHeaders: ['X-Total-Count', 'X-User-Language'],
    maxAge: 86400 // Cache de preflight por 24 horas
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));

// Middleware de idiomas
app.use(languageMiddleware);

// Rotas
app.use(routes);

// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());

// Middleware de tratamento de erros
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
