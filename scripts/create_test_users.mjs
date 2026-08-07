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

const SUPABASE_URL =
  getEnv("SUPABASE_URL") || "https://dwqirgirtmkkbszpsbzi.supabase.co";
const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SECRET_KEY");

if (!SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log("🚀 Ensuring Storage Buckets exist in Supabase...");

  const buckets = ["attachments", "signatures"];

  for (const b of buckets) {
    try {
      const { data, error } = await supabase.storage.getBucket(b);
      if (error || !data) {
        console.log(`Creating public storage bucket '${b}'...`);
        const { error: createErr } = await supabase.storage.createBucket(b, {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        if (createErr) {
          console.error(`  Failed to create bucket '${b}':`, createErr.message);
        } else {
          console.log(`  ✅ Successfully created bucket '${b}'`);
        }
      } else {
        console.log(`  ✅ Bucket '${b}' already exists.`);
      }
    } catch (err) {
      console.error(`  Error checking bucket '${b}':`, err);
    }
  }

  console.log("\n🎉 Storage Buckets setup completed!");
}

void main();
