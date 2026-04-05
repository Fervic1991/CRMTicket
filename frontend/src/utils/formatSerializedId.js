import { FormatMask } from './FormatMask';

const formatSerializedId = (serializedId) => {
  const formatMask = new FormatMask();
  const number = serializedId
    ?.replace('@c.us', '')
    ?.replace('@s.whatsapp.net', '')
    ?.replace('@g.us', '')
    ?.replace('@lid', '');

  if (!number) {
    return number;
  }

  if (serializedId?.includes('@lid')) {
    return number;
  }

  return formatMask.setPhoneFormatMask(number)?.replace('+55', '🇧🇷');
};

export default formatSerializedId;
