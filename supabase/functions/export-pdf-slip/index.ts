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

    const { slip_id } = await req.json();
    if (!slip_id) {
      return new Response(
        JSON.stringify({ error: "Missing slip_id parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { data: slip, error } = await supabaseClient
      .from("delivery_slips")
      .select(
        `
        *,
        from_department:departments!from_department_id(*),
        to_department:departments!to_department_id(*),
        creator:profiles!created_by(id, full_name, email),
        items:delivery_items(
          *,
          signature:signatures!signature_id(*)
        )
      `
      )
      .eq("id", slip_id)
      .single();

    if (error || !slip) {
      return new Response(JSON.stringify({ error: "Slip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({ message: "PDF Export Data ready", slip }),
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
