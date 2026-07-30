import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

const TURKMEN_LOCALE = {
  code: "tk-TM",
  name: "Turkmen (Turkmenistan)",
};

export default async function addTurkmenLocale({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const translationService = container.resolve(Modules.TRANSLATION);

  const [existingLocale] = await translationService.listLocales({
    code: TURKMEN_LOCALE.code,
  });

  if (existingLocale) {
    logger.info(`Locale ${TURKMEN_LOCALE.code} already exists.`);
    return;
  }

  await translationService.createLocales(TURKMEN_LOCALE);
  logger.info(`Created locale ${TURKMEN_LOCALE.code}.`);
}
