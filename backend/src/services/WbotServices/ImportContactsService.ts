import * as Sentry from "@sentry/node";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import logger from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";
import { isString, isArray } from "lodash";
import path from "path";
import fs from 'fs';
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";

const normalizeNumber = (value: string): string => value.replace(/\D/g, "");

const getNumberVariants = (rawNumber: string): string[] => {
  const normalized = normalizeNumber(rawNumber);

  if (!normalized) {
    return [];
  }

  const variants = new Set<string>([normalized]);

  if (normalized.startsWith("39") && normalized.length > 10) {
    variants.add(normalized.slice(2));
  } else {
    variants.add(`39${normalized}`);
  }

  if (normalized.length > 10) {
    variants.add(normalized.slice(-10));
  }

  if (normalized.length > 8) {
    variants.add(normalized.slice(-8));
  }

  return Array.from(variants).filter(Boolean);
};

const ImportContactsService = async (
  companyId: number,
  whatsappId?: number
): Promise<void> => {
  const selectedWhatsapp = whatsappId
    ? await Whatsapp.findOne({ where: { id: whatsappId, companyId } })
    : await GetDefaultWhatsApp(companyId);

  if (!selectedWhatsapp) {
    throw new Error(`No whatsapp connection found for company ${companyId}`);
  }

  logger.info(
    `[ImportContactsService] start company=${companyId} selectedWhatsapp=${selectedWhatsapp.id} selectedName=${selectedWhatsapp.name || ""} selectedNumber=${selectedWhatsapp.number || ""}`
  );

  const wbot = getWbot(selectedWhatsapp.id);

  let phoneContacts;

  try {
    const contactsString = await ShowBaileysService(wbot.id);
    phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts));

    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const beforeFilePath = path.join(publicFolder,`company${companyId}`, 'contatos_antes.txt');
    fs.writeFile(beforeFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
      if (err) {
        logger.error(`Failed to write contacts to file: ${err}`);
        throw err;
      }
      // console.log('O arquivo contatos_antes.txt foi criado!');
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const afterFilePath = path.join(publicFolder,`company${companyId}`, 'contatos_depois.txt');
  fs.writeFile(afterFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
    if (err) {
      logger.error(`Failed to write contacts to file: ${err}`);
      throw err;
    }
    // console.log('O arquivo contatos_depois.txt foi criado!');
  });

  const phoneContactsList = isString(phoneContacts)
    ? JSON.parse(phoneContacts)
    : phoneContacts;

  if (isArray(phoneContactsList)) {
    let updatedContacts = 0;
    let createdContacts = 0;
    let skippedContacts = 0;

    for (const { id, name, notify } of phoneContactsList) {
      if (id === "status@broadcast" || id.includes("g.us")) {
        skippedContacts += 1;
        logger.info(
          `[ImportContactsService] skip broadcast/group rawId=${id}`
        );
        continue;
      }
      const number = normalizeNumber(id);
      const numberVariants = getNumberVariants(number);

      if (!numberVariants.length) {
        skippedContacts += 1;
        logger.warn(
          `[ImportContactsService] skip invalid-number rawId=${id} normalized=${number}`
        );
        continue;
      }

      logger.info(
        `[ImportContactsService] processing rawId=${id} normalized=${number} variants=${numberVariants.join(",")} name=${name || notify || ""}`
      );

      const existingContact = await Contact.findOne({
        where: {
          companyId,
          number: {
            [Op.in]: numberVariants
          }
        },
        order: [["updatedAt", "DESC"]]
      });

      if (existingContact) {
        const previousWhatsappId = existingContact.whatsappId;
        logger.info(
          `[ImportContactsService] found contactId=${existingContact.id} dbNumber=${existingContact.number} previousWhatsappId=${previousWhatsappId || "null"}`
        );

        existingContact.name = name || notify;
        if (!existingContact.whatsappId) {
          existingContact.whatsappId = selectedWhatsapp.id;
          logger.info(
            `[ImportContactsService] assigning whatsappId contactId=${existingContact.id} newWhatsappId=${selectedWhatsapp.id}`
          );
        } else {
          logger.info(
            `[ImportContactsService] keeping existing whatsappId contactId=${existingContact.id} currentWhatsappId=${existingContact.whatsappId}`
          );
        }
        await existingContact.save();
        logger.info(
          `[ImportContactsService] saved contactId=${existingContact.id} finalWhatsappId=${existingContact.whatsappId || "null"}`
        );
        updatedContacts += 1;
      } else {
        logger.info(
          `[ImportContactsService] no existing contact found normalized=${number} variants=${numberVariants.join(",")} -> creating`
        );
        try {
          await CreateContactService({
            number,
            name: name || notify,
            companyId,
            whatsappId: selectedWhatsapp.id
          });
          logger.info(
            `[ImportContactsService] created contact normalized=${number} whatsappId=${selectedWhatsapp.id}`
          );
          createdContacts += 1;
        } catch (error) {
          Sentry.captureException(error);
          logger.warn(
            `Could not get whatsapp contacts from phone. Err: ${error}`
          );
          logger.warn(
            `[ImportContactsService] create failed normalized=${number} variants=${numberVariants.join(",")}`
          );
          skippedContacts += 1;
        }
      }
    }

    logger.info(
      `[ImportContactsService] company=${companyId} whatsapp=${selectedWhatsapp.id} updated=${updatedContacts} created=${createdContacts} skipped=${skippedContacts}`
    );
  }
};

export default ImportContactsService;
