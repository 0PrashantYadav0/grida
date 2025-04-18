import { grida_west_referral_client } from "@/lib/supabase/server";
import assert from "assert";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * [claim]
 */
export async function POST(req: NextRequest) {
  const headersList = await headers();
  const campaign_slug = headersList.get("x-grida-west-campaign-slug");
  const customer_id = headersList.get("x-grida-customer-id");
  const code = headersList.get("x-grida-west-token-code");

  assert(campaign_slug, "x-grida-west-campaign-slug is required");
  assert(code, "x-grida-west-token-code is required");

  if (!customer_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 400 });
  }

  const { data: next, error: claim_err } = await grida_west_referral_client.rpc(
    "claim",
    {
      p_campaign_ref: campaign_slug,
      p_code: code,
      p_customer_id: customer_id,
    }
  );

  if (claim_err) {
    console.error("claim", claim_err);
    return NextResponse.json({ error: claim_err }, { status: 500 });
  }

  return NextResponse.json({
    data: next,
    error: null,
  });
}
