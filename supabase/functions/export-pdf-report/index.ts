import "../deno.d.ts";
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { date_from, date_to, from_department_id, status } = await req.json();

    let query = supabaseClient
      .from("delivery_slips")
      .select(
        `
        *,
        from_department:departments!from_department_id(*),
        to_department:departments!to_department_id(*),
        creator:profiles!created_by(id, full_name, email)
      `
      )
      .order("send_date", { ascending: false });

    if (date_from) query = query.gte("send_date", date_from);
    if (date_to) query = query.lte("send_date", date_to);
    if (from_department_id)
      query = query.eq("from_department_id", from_department_id);
    if (status) query = query.eq("status", status);

    const { data: slips, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({
        message: "Report export ready",
        total: slips?.length || 0,
        slips
      }),
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
