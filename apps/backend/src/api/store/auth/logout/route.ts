import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

function destroySession(req: MedusaRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { sessionOptions, cookieOptions } = req.scope.resolve(
    ContainerRegistrationKeys.CONFIG_MODULE,
  ).projectConfig;
  const cookieName = sessionOptions?.name ?? "connect.sid";

  try {
    await destroySession(req);
  } finally {
    res.clearCookie(cookieName, cookieOptions);
  }

  res.status(200).json({ success: true });
}
