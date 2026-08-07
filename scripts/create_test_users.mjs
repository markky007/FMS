import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read SUPABASE_SECRET_KEY from .env file securely
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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  {
    email: "admin@kcst.co.th",
    password: "Password123!",
    fullName: "สมชาย ผู้ดูแลระบบ (Admin)",
    role: "admin",
    deptCode: "K1",
  },
  {
    email: "manager@kcst.co.th",
    password: "Password123!",
    fullName: "วิชัย ผู้จัดการสาขา (Manager)",
    role: "manager",
    deptCode: "K4",
  },
  {
    email: "sender@kcst.co.th",
    password: "Password123!",
    fullName: "ศศินันท์ พนักงานจัดส่ง (Sender K4)",
    role: "staff",
    deptCode: "K4",
  },
  {
    email: "receiver@kcst.co.th",
    password: "Password123!",
    fullName: "นภา พนักงานปลายทาง (Receiver K5)",
    role: "staff",
    deptCode: "K5",
  },
];

async function main() {
  console.log("🚀 Provisioning test users into Supabase Auth...");

  // 1. Ensure departments K1-K5 exist
  const depts = [
    { code: "K1", name: "สาขา K1", type: "branch", sort_order: 1 },
    { code: "K2", name: "สาขา K2", type: "branch", sort_order: 2 },
    { code: "K3", name: "สาขา K3", type: "branch", sort_order: 3 },
    { code: "K4", name: "สาขา K4", type: "branch", sort_order: 4 },
    { code: "K5", name: "สาขา K5", type: "branch", sort_order: 5 },
  ];

  for (const d of depts) {
    await supabase.from("departments").upsert(d, { onConflict: "code" });
  }

  // Get department mapping
  const { data: deptRows } = await supabase.from("departments").select("id, code");
  const deptMap = Object.fromEntries((deptRows || []).map((r) => [r.code, r.id]));

  for (const u of TEST_USERS) {
    try {
      console.log(`Creating user: ${u.email}...`);

      // Create user via Supabase Auth Admin API
      const { data: authUser, error: authErr } =
        await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { full_name: u.fullName },
        });

      let userId = authUser?.user?.id;

      if (authErr) {
        if (authErr.message?.includes("already registered") || authErr.status === 422) {
          console.log(`  User ${u.email} already exists in auth. Updating password...`);
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users?.find((x) => x.email === u.email);
          if (existing) {
            userId = existing.id;
            await supabase.auth.admin.updateUserById(userId, {
              password: u.password,
              email_confirm: true,
            });
          }
        } else {
          console.error(`  Error creating ${u.email}:`, authErr.message);
          continue;
        }
      }

      if (userId) {
        // Upsert into public.profiles
        const deptId = deptMap[u.deptCode] || null;
        const { error: profileErr } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            email: u.email,
            full_name: u.fullName,
            role: u.role,
            department_id: deptId,
            is_active: true,
          });

        if (profileErr) {
          console.error(`  Profile error for ${u.email}:`, profileErr.message);
        } else {
          console.log(`  ✅ Successfully provisioned ${u.email} (${u.role})`);
        }
      }
    } catch (e) {
      console.error(`  Exception for ${u.email}:`, e);
    }
  }

  console.log("\n🎉 All test users provisioned successfully!");
}

main();
