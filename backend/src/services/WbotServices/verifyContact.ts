import { Mutex } from "async-mutex";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService, {
  updateContact
} from "../ContactServices/CreateOrUpdateContactService";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { proto, WASocket } from "@whiskeysockets/baileys";
import WhatsappLidMap from "../../models/WhatsapplidMap";

const lidUpdateMutex = new Mutex();

export type Session = WASocket & {
  id?: number;
  myJid?: string;
  myLid?: string;
  cacheMessage?: (msg: proto.IWebMessageInfo) => void;
  isRefreshing?: boolean;
};

interface IMe {
  name: string;
  id: string;
  realRemoteJid?: string;
  lid?: string;
}

const extractDigits = (value?: string | null): string => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

export async function checkAndDedup(
  contact: Contact,
  lid: string
): Promise<void> {
  const lidContact = await Contact.findOne({
    where: {
      companyId: contact.companyId,
      number: {
        [Op.or]: [lid, lid.substring(0, lid.indexOf("@"))]
      }
    }
  });

  if (!lidContact) {
    return;
  }

  await Message.update(
    { contactId: contact.id },
    {
      where: {
        contactId: lidContact.id,
        companyId: contact.companyId
      }
    }
  );

  const notClosedTickets = await Ticket.findAll({
    where: {
      contactId: lidContact.id,
      status: {
        [Op.not]: "closed"
      }
    }
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const ticket of notClosedTickets) {
    // eslint-disable-next-line no-await-in-loop
    await UpdateTicketService({
      ticketData: { status: "closed" },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });
  }

  await Ticket.update(
    { contactId: contact.id },
    {
      where: {
        contactId: lidContact.id,
        companyId: contact.companyId
      }
    }
  );

  await lidContact.destroy();
}

export async function verifyContact(
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> {
  let profilePicUrl: string;
  
  // try {
  //   profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  // } catch (e) {
  //   profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  // }

  const remoteJid =
    msgContact.realRemoteJid && msgContact.realRemoteJid.includes("@")
      ? msgContact.realRemoteJid
      : msgContact.id;
  const normalizedLid =
    msgContact.lid && msgContact.lid.includes("@lid")
      ? msgContact.lid
      : msgContact.id.includes("@lid")
        ? msgContact.id
        : "";
  const isLid = normalizedLid.includes("@lid");
  const isGroup = remoteJid.includes("@g.us");
  const number = extractDigits(remoteJid) || extractDigits(normalizedLid);
  // A LID is an internal WhatsApp identifier, not a phone number. When an
  // incoming event has only a LID, preserve the real phone/JID already known.
  const hasOnlyLidIdentity = isLid && remoteJid.endsWith("@lid");

  const contactData = {
    name: msgContact?.name || remoteJid.replace(/\D/g, ""),
    number,
    lid: normalizedLid,
    remoteJid,
    profilePicUrl,
    isGroup,
    companyId
  };

  if (isGroup) {
    return CreateOrUpdateContactService(contactData);
  }

  return lidUpdateMutex.runExclusive(async () => {
    let foundContact: Contact | null = null;

    if (normalizedLid) {
      foundContact = await Contact.findOne({
        where: {
          companyId,
          lid: normalizedLid
        },
        include: ["tags", "extraInfo", "whatsappLidMap"]
      });
    }

    if (!foundContact && remoteJid && !remoteJid.endsWith("@lid")) {
      foundContact = await Contact.findOne({
        where: {
          companyId,
          remoteJid
        },
        include: ["tags", "extraInfo", "whatsappLidMap"]
      });
    }

    if (!foundContact && number) {
      foundContact = await Contact.findOne({
        where: {
          companyId,
          number
        },
        include: ["tags", "extraInfo", "whatsappLidMap"]
      });
    }

    if (isLid) {
      if (foundContact) {
        return updateContact(foundContact, {
          lid: normalizedLid,
          profilePicUrl: contactData.profilePicUrl,
          ...(hasOnlyLidIdentity
            ? {}
            : {
              number: contactData.number,
              remoteJid: contactData.remoteJid
            })
        });
      }

      const lidDigits = extractDigits(normalizedLid);
      const foundMappedContact = await WhatsappLidMap.findOne({
        where: {
          companyId,
          lid: {
            [Op.or]: [normalizedLid, lidDigits]
          }
        },
        include: [
          {
            model: Contact,
            as: "contact",
            include: ["tags", "extraInfo"]
          }
        ]
      });

      if (foundMappedContact) {
        return updateContact(foundMappedContact.contact, {
          lid: normalizedLid,
          profilePicUrl: contactData.profilePicUrl,
          ...(hasOnlyLidIdentity
            ? {}
            : {
              number: contactData.number,
              remoteJid: contactData.remoteJid
            })
        });
      }

      const partialLidContact = await Contact.findOne({
        where: {
          companyId,
          [Op.or]: [
            { lid: normalizedLid },
            {
              number: {
                [Op.or]: [normalizedLid, lidDigits]
              }
            }
          ]
        },
        include: ["tags", "extraInfo"]
      });

      if (partialLidContact) {
        return updateContact(partialLidContact, {
          lid: normalizedLid,
          profilePicUrl: contactData.profilePicUrl,
          ...(hasOnlyLidIdentity
            ? {}
            : {
              number: contactData.number,
              remoteJid: contactData.remoteJid
            })
        });
      }
    } else if (foundContact) {
      if (!foundContact.whatsappLidMap) {
        const ow = await wbot.onWhatsApp(contactData.remoteJid);
        if (ow?.[0]?.exists) {
          const lid = (ow?.[0] as any)?.lid as string;
          if (lid) {
            await checkAndDedup(foundContact, lid);
            await WhatsappLidMap.findOrCreate({
              where: {
                companyId,
                lid
              },
              defaults: {
                companyId,
                lid,
                contactId: foundContact.id
              }
            });
          }
        }
      }
      return updateContact(foundContact, {
        number: contactData.number,
        remoteJid: contactData.remoteJid,
        lid: normalizedLid || foundContact.lid,
        profilePicUrl: contactData.profilePicUrl
      });
    } else if (!isGroup && !foundContact) {
      const ow = await wbot.onWhatsApp(contactData.remoteJid);
      const lid = (ow?.[0] as any)?.lid as string;

      if (ow?.[0]?.exists && lid) {
        const lidDigits = extractDigits(lid);
        const lidContact = await Contact.findOne({
          where: {
            companyId,
            [Op.or]: [
              { lid },
              {
                number: {
                  [Op.or]: [lid, lidDigits]
                }
              }
            ]
          },
          include: ["tags", "extraInfo"]
        });

        if (lidContact) {
          await WhatsappLidMap.findOrCreate({
            where: {
              companyId,
              lid
            },
            defaults: {
              companyId,
              lid,
              contactId: lidContact.id
            }
          });
          return updateContact(lidContact, {
            number: contactData.number,
            remoteJid: contactData.remoteJid,
            lid,
            profilePicUrl: contactData.profilePicUrl
          });
        }
      }
    }

    return CreateOrUpdateContactService(contactData);
  });
}
