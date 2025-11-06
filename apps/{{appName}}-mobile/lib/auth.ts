import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

// import { getBaseUrl } from "./base-url";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "{{projectName}}",
      storagePrefix: "{{projectName}}",
      storage: SecureStore,
    }),
  ],
});
