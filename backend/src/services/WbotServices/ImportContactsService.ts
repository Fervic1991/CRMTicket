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
    phoneContactsList.forEach(async ({ id, name, notify }) => {
      if (id === "status@broadcast" || id.includes("g.us")) return;
      const number = id.replace(/\D/g, "");

      const existingContact = await Contact.findOne({
        where: { number, companyId }
      });

      if (existingContact) {
        // Atualiza o nome do contato existente
        existingContact.name = name || notify;
        if (!existingContact.whatsappId) {
          existingContact.whatsappId = selectedWhatsapp.id;
        }
        await existingContact.save();
      } else {
        // Criar um novo contato
        try {
          await CreateContactService({
            number,
            name: name || notify,
            companyId,
            whatsappId: selectedWhatsapp.id
          });
        } catch (error) {
          Sentry.captureException(error);
          logger.warn(
            `Could not get whatsapp contacts from phone. Err: ${error}`
          );
        }
      }
    });
  }
};

export default ImportContactsService;
