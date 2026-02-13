import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const improvmxApiKey = Deno.env.get("IMPROVMX_API_KEY");

  if (!improvmxApiKey) {
    return new Response(JSON.stringify({ error: "ImprovMX API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub;
  const { action, alias, forward_to } = await req.json();
  const domain = "ondabir.com";

  try {
    if (action === "create") {
      if (!alias || !forward_to) {
        return new Response(JSON.stringify({ error: "Alias and forward_to are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate alias format
      const aliasRegex = /^[a-z0-9._-]+$/;
      if (!aliasRegex.test(alias)) {
        return new Response(JSON.stringify({ error: "Invalid alias format. Use lowercase letters, numbers, dots, hyphens, underscores." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user already has an alias
      const { data: existing } = await supabase
        .from("email_aliases")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "You already have an email alias. Delete it first to create a new one." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create alias on ImprovMX
      const improvRes = await fetch(`https://api.improvmx.com/v3/domains/${domain}/aliases`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${improvmxApiKey}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias, forward: forward_to }),
      });

      const improvData = await improvRes.json();

      if (!improvRes.ok) {
        console.error("ImprovMX error:", improvData);
        const msg = improvData?.errors?.alias?.[0] || improvData?.error || "Failed to create alias on ImprovMX";
        return new Response(JSON.stringify({ error: msg }), {
          status: improvRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Save to database
      const { error: dbError } = await supabase
        .from("email_aliases")
        .insert({ user_id: userId, alias, forward_to });

      if (dbError) {
        // Rollback ImprovMX alias
        await fetch(`https://api.improvmx.com/v3/domains/${domain}/aliases/${alias}`, {
          method: "DELETE",
          headers: { Authorization: `Basic ${btoa(`api:${improvmxApiKey}`)}` },
        });
        return new Response(JSON.stringify({ error: dbError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, email: `${alias}@${domain}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { data: aliasData } = await supabase
        .from("email_aliases")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!aliasData) {
        return new Response(JSON.stringify({ error: "No alias found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete from ImprovMX
      await fetch(`https://api.improvmx.com/v3/domains/${domain}/aliases/${aliasData.alias}`, {
        method: "DELETE",
        headers: { Authorization: `Basic ${btoa(`api:${improvmxApiKey}`)}` },
      });

      // Delete from database
      await supabase.from("email_aliases").delete().eq("user_id", userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get") {
      const { data: aliasData } = await supabase
        .from("email_aliases")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      return new Response(JSON.stringify({ alias: aliasData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
