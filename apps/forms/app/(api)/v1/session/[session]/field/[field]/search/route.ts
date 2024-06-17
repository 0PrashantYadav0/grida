import { client } from "@/lib/supabase/server";
import {
  GridaXSupabaseClient,
  createXSupabaseClient,
} from "@/services/x-supabase";
import { FormFieldReferenceSchema, GridaSupabase } from "@/types";
import assert from "assert";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

type SearchRes = {
  schema_name: string;
  table_name: string;
  table_schema: GridaSupabase.SupabaseTable["sb_table_schema"];
  column: string;
  rows: Record<string, any>[];
};

export async function GET(
  req: NextRequest,
  context: {
    params: {
      session: string;
      field: string;
    };
  }
) {
  const { session: session_id, field: field_id } = context.params;

  const _q_page = req.nextUrl.searchParams.get("page");
  const page = _q_page ? parseInt(_q_page) : 1;

  // FIXME: Strict Authorization

  const { data, error } = await client
    .from("response_session")
    .select(
      `id, form:form( fields:form_field( id, reference ), supabase_connection:connection_supabase(*) )`
    )
    .eq("id", session_id)
    .single();

  if (!data) {
    return notFound();
  }

  const { supabase_connection, fields } = data.form!;

  const field = fields.find((field) => field.id === field_id);

  if (!field) {
    return notFound();
  }

  if (field.reference) {
    const { type, schema, table, column } =
      field.reference as any as FormFieldReferenceSchema;

    switch (type) {
      case "x-supabase": {
        assert(supabase_connection, "No connection found");

        const xsupabase = new GridaXSupabaseClient();
        const conn = await xsupabase.getConnection(supabase_connection);
        assert(conn, "connection fetch failed");
        const {
          supabase_project: { sb_public_schema },
        } = conn;

        const client = await createXSupabaseClient(
          supabase_connection?.supabase_project_id,
          {
            service_role: true,
          }
        );

        switch (schema) {
          case "auth": {
            assert(
              table === "users",
              `Unsupported table "${table}" on schena "${schema}"`
            );
            const { data, error } = await client.auth.admin.listUsers({
              page: page,
            });

            if (error || !data) {
              console.error("search/err::user", error);
              return NextResponse.error();
            }

            return NextResponse.json({
              data: {
                schema_name: schema as string,
                table_name: table,
                table_schema: GridaSupabase.SupabaseUserJsonSchema as any,
                column: column,
                rows: data.users,
              } satisfies SearchRes,
            });
          }
          case "public": {
            const { data, error } = await client.from(table).select();

            if (error || !data) {
              console.error("search/err::table", error);
              return NextResponse.error();
            }

            return NextResponse.json({
              data: {
                schema_name: schema,
                table_name: table,
                column: column,
                table_schema: sb_public_schema![table],
                rows: data,
              } satisfies SearchRes,
            });

            break;
          }
          default: {
            throw new Error(`Unsupported schema: ${schema}`);
          }
        }
      }
      default: {
        return NextResponse.error();
      }
    }
  } else {
    return NextResponse.json(
      {
        error: {
          message: "This field does not support search",
        },
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({});
}