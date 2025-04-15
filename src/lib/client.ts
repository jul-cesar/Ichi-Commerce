import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
 import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient =  createAuthClient({
    //you can pass client configuration here
      plugins: [inferAdditionalFields<typeof auth>()],

})