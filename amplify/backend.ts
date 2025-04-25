import { defineBackend } from "@amplify/backend";
import { auth } from "./auth/resource"; // 이 줄 추가 필요
import { data } from "./data/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth, 
  data, 
  storage
});

export default backend;