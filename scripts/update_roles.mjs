import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

const SUPABASE_URL = getEnv("SUPABASE_URL") || "https://dwqirgirtmkkbszpsbzi.supabase.co";
const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SECRET_KEY");

if (!SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🚀 Updating user roles in Supabase Database...");

  // Update existing test users in profiles table directly
  const { data: senderData } = await supabase
    .from("profiles")
    .update({ role: "employee" })
    .eq("email", "sender@kcst.co.th")
    .select();

  const { data: receiverData } = await supabase
    .from("profiles")
    .update({ role: "employee" })
    .eq("email", "receiver@kcst.co.th")
    .select();

  console.log("Updated sender:", senderData);
  console.log("Updated receiver:", receiverData);

  // Print current profiles
  const { data: allProfiles } = await supabase.from("profiles").select("email, full_name, role");
  console.log("\n📋 Current Profiles in DB:", allProfiles);
}

main();
