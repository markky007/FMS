import "../deno.d.ts";
// Follow Deno & Supabase Edge Function conventions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const {
      userId,
      email,
      password,
      full_name,
      role,
      department_id,
      is_active
    } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required field (userId)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 1. Update Auth User attributes if specified
    const authAttributes: {
      email?: string;
      password?: string;
      user_metadata?: { full_name: string };
      app_metadata?: { role: string };
    } = {};

    if (email) authAttributes.email = email.trim();
    if (password) authAttributes.password = password;
    if (full_name)
      authAttributes.user_metadata = { full_name: full_name.trim() };
    if (role) authAttributes.app_metadata = { role };

    if (Object.keys(authAttributes).length > 0) {
      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, authAttributes);

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 2. Update profiles table
    const profilePayload: Record<string, unknown> = {};
    if (email) profilePayload.email = email.trim();
    if (full_name) profilePayload.full_name = full_name.trim();
    if (role) profilePayload.role = role;
    if (department_id !== undefined)
      profilePayload.department_id = department_id || null;
    if (is_active !== undefined) profilePayload.is_active = is_active;
    profilePayload.updated_at = new Date().toISOString();

    if (Object.keys(profilePayload).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);

      if (profileError) {
        return new Response(JSON.stringify({ error: profileError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(
      JSON.stringify({ message: "User updated successfully", user_id: userId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
