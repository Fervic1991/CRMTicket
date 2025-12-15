import ContactListItem from "../../models/ContactListItem";
import Contact from "../../models/Contact";
import CheckContactNumber from "../WbotServices/CheckNumber";
import logger from "../../utils/logger";

interface BulkData {
  contactListId: number;
  contactIds: number[];
  companyId: number;
}

const BulkCreateService = async (data: BulkData): Promise<ContactListItem[]> => {
  const { contactListId, contactIds, companyId } = data;

  logger.info(`[BulkCreateService] start companyId=${companyId} contactListId=${contactListId} contactIds=${JSON.stringify(contactIds)}`);

  // Fetch contacts by IDs (assicurati che appartengano alla stessa azienda)
  const contacts = await Contact.findAll({
    where: {
      id: contactIds,
      companyId
    }
  });

  logger.info(`[BulkCreateService] contacts found=${contacts.length}`);

  // Se non ci sono contatti, ritorna array vuoto (non throw)
  if (contacts.length === 0) {
    logger.warn(`[BulkCreateService] no contacts found for provided ids for companyId=${companyId}`);
    return [];
  }

  const newlyCreatedItems: ContactListItem[] = [];

  // Crea un ContactListItem per ogni contatto (aggiunge solo i nuovi elementi)
  for (const contact of contacts) {
    try {
      const [record, created] = await ContactListItem.findOrCreate({
        where: {
          number: contact.number,
          companyId,
          contactListId
        },
        defaults: {
          name: contact.name,
          number: contact.number,
          email: contact.email || null,
          companyId,
          contactListId
        }
      });

      if (created) {
        // Verifica numero WhatsApp solo per i nuovi record
        try {
          const response: any = await CheckContactNumber(record.number, record.companyId);
          if (response) {
            record.isWhatsappValid = true;
            record.number = response.jid.split("@")[0];
          } else {
            record.isWhatsappValid = false;
          }
          await record.save();
        } catch (whatsappError) {
          logger.warn(`[BulkCreateService] Could not validate WhatsApp number for ${record.number}: ${whatsappError.message || whatsappError}`);
        }

        newlyCreatedItems.push(record);
        logger.info(`[BulkCreateService] created ContactListItem id=${record.id} number=${record.number}`);
      } else {
        logger.info(`[BulkCreateService] already exists ContactListItem for number=${contact.number} contactId=${contact.id}`);
      }
    } catch (err: any) {
      logger.error(`[BulkCreateService] error creating item for contactId=${contact.id} err=${err.message || err}`);
      // continua con il prossimo contatto
    }
  }

  logger.info(`[BulkCreateService] finished created=${newlyCreatedItems.length}`);
  return newlyCreatedItems;
};

export default BulkCreateService;