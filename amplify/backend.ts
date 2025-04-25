// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({
  auth, 
  data, 
});

// amplify_outputs.json에 사용자 정의 값 추가
backend.addOutput({
  custom: {
    api_endpoint: "https://api.example.com",
    feature_flags: {
      enableNewFeature: true
    }
  },
});