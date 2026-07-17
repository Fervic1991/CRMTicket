import { getWbot } from "../libs/wbot";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import logger from "../utils/logger";

export default {
    key: `${process.env.DB_NAME}-handleMessage`,

    async handle({ data }) {
        try {
            const { message, wbot, companyId } = data;
            const messageId = message?.key?.id;
            const remoteJid = message?.key?.remoteJid;
            const fromMe = message?.key?.fromMe;

            if (message === undefined || wbot === undefined || companyId === undefined) {
                logger.warn(
                    `[HANDLE MESSAGE QUEUE] payload incompleto: message=${!!message} wbot=${wbot} companyId=${companyId}`
                );
            }

            logger.info(
                `[HANDLE MESSAGE QUEUE] start messageId=${messageId} remoteJid=${remoteJid} fromMe=${fromMe} wbot=${wbot} companyId=${companyId}`
            );

            const w = getWbot(wbot);

            if (!w) {
                logger.warn(`[HANDLE MESSAGE QUEUE] wbot non trovato: ${wbot}`);
            }

            try {
                await handleMessage(message, w, companyId);
                logger.info(
                    `[HANDLE MESSAGE QUEUE] done messageId=${messageId} remoteJid=${remoteJid} fromMe=${fromMe} wbot=${wbot} companyId=${companyId}`
                );
            } catch (error) {
                logger.error(
                    `[HANDLE MESSAGE QUEUE] errore in handleMessage messageId=${messageId} remoteJid=${remoteJid} fromMe=${fromMe} wbot=${wbot} companyId=${companyId}`
                );
                logger.error(error);
            }
        } catch (error) {
            logger.error("[HANDLE MESSAGE QUEUE] errore generale");
            logger.error(error);
        }
    },
};
