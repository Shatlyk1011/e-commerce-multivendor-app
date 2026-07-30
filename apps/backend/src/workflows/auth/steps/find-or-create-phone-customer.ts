import type {
  CustomerDTO,
  FilterableCustomerProps,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError, Modules } from "@medusajs/framework/utils";

type FindOrCreatePhoneCustomerCompensation = {
  createdCustomerId?: string;
};

type PhoneCustomerFilter = FilterableCustomerProps & {
  phone: string;
};

export const findOrCreatePhoneCustomerStep = createStep<
  string,
  CustomerDTO,
  FindOrCreatePhoneCustomerCompensation
>(
  "find-or-create-phone-customer",
  async (
    phone: string,
    { container },
  ): Promise<
    StepResponse<CustomerDTO, FindOrCreatePhoneCustomerCompensation>
  > => {
    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER,
    );
    const filters: PhoneCustomerFilter = { phone };
    const customers = await customerService.listCustomers(filters, { take: 2 });

    if (customers.length > 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Multiple customers use this phone number",
      );
    }

    if (customers[0]) {
      return new StepResponse(customers[0], {});
    }

    const customer = await customerService.createCustomers({
      phone,
      email: null,
      first_name: "",
      last_name: "",
      has_account: true,
    });

    return new StepResponse(customer, { createdCustomerId: customer.id });
  },
  async (compensation, { container }) => {
    if (!compensation?.createdCustomerId) {
      return;
    }

    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER,
    );
    await customerService.deleteCustomers(compensation.createdCustomerId);
  },
);
