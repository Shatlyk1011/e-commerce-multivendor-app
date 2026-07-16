import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { PhonePassAuthService } from "./service"

export default ModuleProvider(Modules.AUTH, {
  services: [PhonePassAuthService],
})
