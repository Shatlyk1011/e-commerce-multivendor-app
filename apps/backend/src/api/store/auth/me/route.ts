import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import type { ICustomerModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    res.status(200).json({
      authenticated: false,
      customer: null,
    });
    return;
  }

  const customerService: ICustomerModuleService = req.scope.resolve(
    Modules.CUSTOMER,
  );
  const customer = await customerService.retrieveCustomer(customerId);

  res.status(200).json({
    authenticated: true,
    customer: {
      id: customer.id,
      phone_number: customer.phone ?? "",
      email: customer.email ?? "",
      first_name: customer.first_name ?? "",
      last_name: customer.last_name ?? "",
    },
  });
}
