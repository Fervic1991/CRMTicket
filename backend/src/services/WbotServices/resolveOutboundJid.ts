import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { normalizeJid } from "../../utils";

const extractDigits = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
};

const jidFromNumber = (number?: string | null, isGroup = false): string | null => {
  const digits = extractDigits(number);
  if (!digits) return null;
  return normalizeJid(`${digits}@${isGroup ? "g.us" : "s.whatsapp.net"}`);
};

const parseMessageJid = (message: Message): string | null => {
  try {
    if (message.dataJson) {
      const parsed = JSON.parse(message.dataJson);
      const senderPn = parsed?.key?.senderPn || parsed?.key?.participantPn;
      if (senderPn && typeof senderPn === "string" && senderPn.includes("@")) {
        return normalizeJid(senderPn);
      }

      const remoteJid = parsed?.key?.remoteJid;
      if (
        remoteJid &&
        typeof remoteJid === "string" &&
        remoteJid.includes("@") &&
        !remoteJid.endsWith("@lid")
      ) {
        return normalizeJid(remoteJid);
      }
    }
  } catch {
    // ignore malformed dataJson and fallback to persisted columns
  }

  if (
    message.remoteJid &&
    typeof message.remoteJid === "string" &&
    message.remoteJid.includes("@") &&
    !message.remoteJid.endsWith("@lid")
  ) {
    return normalizeJid(message.remoteJid);
  }

  if (
    message.participant &&
    typeof message.participant === "string" &&
    message.participant.includes("@") &&
    !message.participant.endsWith("@lid")
  ) {
    return normalizeJid(message.participant);
  }

  return null;
};

export const resolveOutboundJid = async (
  ticket: Ticket,
  contact: Contact
): Promise<string> => {
  if (ticket.isGroup) {
    return normalizeJid(
      contact.remoteJid && contact.remoteJid.includes("@")
        ? contact.remoteJid
        : `${contact.number}@g.us`
    );
  }

  const lastInboundMessage = await Message.findOne({
    where: {
      ticketId: ticket.id,
      fromMe: false
    },
    order: [["createdAt", "DESC"]]
  });

  const inboundJid = lastInboundMessage ? parseMessageJid(lastInboundMessage) : null;
  if (inboundJid) {
    const inboundNumber = extractDigits(inboundJid);
    if (inboundNumber && (contact.number !== inboundNumber || contact.remoteJid !== inboundJid)) {
      await contact.update({
        number: inboundNumber,
        remoteJid: inboundJid
      });
    }
    return inboundJid;
  }

  const lastInboundForContact = await Message.findOne({
    where: {
      contactId: contact.id,
      companyId: ticket.companyId,
      fromMe: false
    },
    order: [["createdAt", "DESC"]]
  });

  const contactInboundJid = lastInboundForContact
    ? parseMessageJid(lastInboundForContact)
    : null;

  if (contactInboundJid) {
    const inboundNumber = extractDigits(contactInboundJid);
    if (
      inboundNumber &&
      (contact.number !== inboundNumber || contact.remoteJid !== contactInboundJid)
    ) {
      await contact.update({
        number: inboundNumber,
        remoteJid: contactInboundJid
      });
    }
    return contactInboundJid;
  }

  if (
    contact.remoteJid &&
    contact.remoteJid.includes("@") &&
    !contact.remoteJid.endsWith("@lid")
  ) {
    return normalizeJid(contact.remoteJid);
  }

  const jidFromContactNumber = jidFromNumber(contact.number);
  if (jidFromContactNumber) {
    return jidFromContactNumber;
  }

  throw new Error(`Unable to resolve outbound jid for ticket ${ticket.id}`);
};
