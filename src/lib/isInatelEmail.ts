// Valida e-mails institucionais do Inatel.
// Aceita @inatel.br e qualquer subdomínio (@sigla.inatel.br), onde "sigla"
// pode ser qualquer curso/área que o Inatel venha a criar.
const INATEL_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*inatel\.br$/i;

export const isInatelEmail = (email: string | null | undefined): boolean =>
  typeof email === "string" && INATEL_EMAIL_REGEX.test(email.trim());

export default isInatelEmail;
