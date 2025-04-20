// amplify/auth/resource.ts
import { defineAuth } from "@aws-amplify/backend"

export const auth = defineAuth({
  loginWith: {
    email: true,
    // 필요에 따라 추가 옵션 구성 가능
    // phone: true,
    // externalProviders: {
    //   google: { clientId: 'your-client-id', clientSecret: 'your-client-secret' }
    // }
  },
})