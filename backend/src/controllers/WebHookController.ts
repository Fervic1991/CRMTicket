import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
import logger from "../utils/logger";
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { body } = req;

    logger.info(
      `[META WEBHOOK DEBUG] ${JSON.stringify({
        object: body?.object || null,
        entryCount: body?.entry?.length || 0,
        entries: (body?.entry || []).map((entry: any) => ({
          id: entry?.id || null,
          hasMessaging: Array.isArray(entry?.messaging),
          messagingCount: entry?.messaging?.length || 0,
          hasChanges: Array.isArray(entry?.changes),
          changesCount: entry?.changes?.length || 0
        }))
      })}`
    );

    if (body.object === "page" || body.object === "instagram") {
      let channel: string;

      if (body.object === "page") {
        channel = "facebook";
      } else {
        channel = "instagram";
      }

      body.entry?.forEach(async (entry: any) => {
        const getTokenPage = await Whatsapp.findOne({
          where: {
            facebookPageUserId: entry.id,
            channel
          }
        });

        if (getTokenPage) {
          logger.info(
            `[META WEBHOOK DEBUG] ${JSON.stringify({
              matchedChannel: channel,
              entryId: entry.id,
              whatsappId: getTokenPage.id,
              facebookPageUserId: getTokenPage.facebookPageUserId
            })}`
          );

          entry.messaging?.forEach((data: any) => {
            handleMessage(getTokenPage, data, channel, getTokenPage.companyId);
          });
        }
      });

      return res.status(200).json({
        message: "EVENT_RECEIVED"
      });
    }

    return res.status(404).json({
      message: body
    });
  } catch (error) {
    return res.status(500).json({
      message: error
    });
  }
};
