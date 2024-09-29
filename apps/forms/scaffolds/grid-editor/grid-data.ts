import {
  Customer,
  FormFieldDefinition,
  FormResponse,
  FormResponseField,
  FormResponseSession,
  GridaXSupabase,
} from "@/types";
import { fmt_local_index } from "@/utils/fmt";
import type {
  GFColumn,
  DataGridFileRef,
  GFResponseRow,
  GFSystemColumn,
  DataGridCellFileRefsResolver,
  DataGridFileRefsResolverQueryTask,
} from "../grid/types";
import type {
  DataGridLocalFilter,
  GDocSchemaTableProviderGrida,
  GDocSchemaTableProviderXSupabase,
  GDocTableID,
  TablespaceSchemaTableStreamType,
  TVirtualRow,
} from "../editor/state";
import { FlatPostgREST } from "@/lib/supabase-postgrest/flat";
import { FieldSupports } from "@/k/supported_field_types";
import { PrivateEditorApi } from "@/lib/private";
import { GridFilter } from "../grid-filter";
import { EditorSymbols } from "../editor/symbols";
import { SupabaseStorageExtensions } from "@/lib/supabase/storage-ext";

export namespace GridData {
  type DataGridInput =
    | ({
        form_id: string;
        fields: FormFieldDefinition[];
        filter: DataGridLocalFilter;
      } & (
        | {
            table: typeof EditorSymbols.Table.SYM_GRIDA_FORMS_RESPONSE_TABLE_ID;
            responses: Array<TVirtualRow<FormResponseField, FormResponse>>;
          }
        | {
            table: typeof EditorSymbols.Table.SYM_GRIDA_FORMS_SESSION_TABLE_ID;
            sessions: FormResponseSession[];
          }
        | {
            table: typeof EditorSymbols.Table.SYM_GRIDA_FORMS_X_SUPABASE_MAIN_TABLE_ID;
            data: {
              pks: string[];
              rows: any[];
            };
          }
      ))
    | {
        filter: DataGridLocalFilter;
        table: typeof EditorSymbols.Table.SYM_GRIDA_CUSTOMER_TABLE_ID;
        data: {
          rows: Customer[];
        };
      }
    | {
        filter: DataGridLocalFilter;
        table: typeof EditorSymbols.Table.SYM_GRIDA_X_SUPABASE_AUTH_USERS_TABLE_ID;
        data: {
          rows: GridaXSupabase.SupabaseUser[];
        };
      }
    | (
        | {
            filter: DataGridLocalFilter;
            table: "v0_schema_table";
            provider: "grida";
            table_id: string;
            attributes: FormFieldDefinition[];
            rows: Array<
              TablespaceSchemaTableStreamType<GDocSchemaTableProviderGrida>
            >;
          }
        | {
            filter: DataGridLocalFilter;
            table: "v0_schema_table";
            provider: "x-supabase";
            table_id: string;
            attributes: FormFieldDefinition[];
            pks: string[];
            rows: Array<
              TablespaceSchemaTableStreamType<GDocSchemaTableProviderXSupabase>
            >;
          }
      );

  type ColumSbuilderParams =
    | {
        table_id:
          | typeof EditorSymbols.Table.SYM_GRIDA_FORMS_RESPONSE_TABLE_ID
          | typeof EditorSymbols.Table.SYM_GRIDA_FORMS_SESSION_TABLE_ID;
        fields: FormFieldDefinition[];
      }
    | {
        table_id: typeof EditorSymbols.Table.SYM_GRIDA_FORMS_X_SUPABASE_MAIN_TABLE_ID;
        fields: FormFieldDefinition[];
        x_table_constraints: {
          pk?: string;
          pks: string[];
        };
      }
    | {
        table_id: string;
        fields: FormFieldDefinition[];
        x_table_constraints?: {
          pk?: string;
          pks: string[];
        };
      };

  export function columns(params: ColumSbuilderParams): {
    systemcolumns: GFSystemColumn[];
    columns: GFColumn[];
  } {
    const fieldcolumns = Array.from(params.fields)
      .sort((a, b) => a.local_index - b.local_index)
      .map(
        (field) =>
          ({
            key: field.id,
            name: field.name,
            readonly: field.readonly || false,
            type: field.type,
            storage: field.storage || null,
          }) satisfies GFColumn
      );

    switch (params.table_id) {
      case EditorSymbols.Table.SYM_GRIDA_FORMS_RESPONSE_TABLE_ID:
      case EditorSymbols.Table.SYM_GRIDA_FORMS_SESSION_TABLE_ID: {
        return {
          systemcolumns: [
            {
              key: "__gf_display_id",
            },
            {
              key: "__gf_created_at",
            },
            {
              key: "__gf_customer_id",
            },
          ],
          columns: fieldcolumns,
        };
        break;
      }
      case EditorSymbols.Table.SYM_GRIDA_FORMS_X_SUPABASE_MAIN_TABLE_ID: {
        const { pk, pks } = params.x_table_constraints;
        if (pk) {
          return {
            systemcolumns: [
              {
                key: "__gf_display_id",
                name: pk,
              },
              // 2. allow multiple PKs
            ],
            columns: fieldcolumns.filter((f) => f.name !== pk),
          };
        }
        break;
      }
      default:
        if (params.x_table_constraints) {
          const { pk, pks } = params.x_table_constraints;
          if (pk) {
            return {
              systemcolumns: [
                {
                  key: "__gf_display_id",
                  name: pk,
                },
                // 2. allow multiple PKs
              ],
              columns: fieldcolumns.filter((f) => f.name !== pk),
            };
          }
        }
        break;
    }

    return {
      systemcolumns: [
        {
          key: "__gf_display_id",
        },
        {
          key: "__gf_created_at",
        },
      ],
      columns: fieldcolumns,
    };
  }

  type TProcessedGridRows =
    | {
        type: "response";
        inputlength: number;
        filtered: GFResponseRow[];
      }
    | {
        type: "session";
        inputlength: number;
        filtered: GFResponseRow[];
      }
    | {
        type: "customer";
        inputlength: number;
        filtered: Customer[];
      }
    | {
        type: "x-supabase-auth.users";
        inputlength: number;
        filtered: GridaXSupabase.SupabaseUser[];
      };

  export function rows(input: DataGridInput): TProcessedGridRows {
    switch (input.table) {
      case EditorSymbols.Table.SYM_GRIDA_FORMS_RESPONSE_TABLE_ID: {
        const filtered = GridFilter.filter(
          input.responses,
          input.filter,
          (row) => row.meta.raw,
          // response raw is saved with name: value
          input.fields.map((f) => f.name)
        );

        return {
          type: "response",
          inputlength: input.responses.length || 0,
          filtered: rows_from_responses(filtered, input.fields),
        };
      }
      case EditorSymbols.Table.SYM_GRIDA_FORMS_SESSION_TABLE_ID: {
        return {
          type: "session",
          inputlength: input.sessions?.length || 0,
          filtered: input.sessions
            ? rows_from_sessions(
                GridFilter.filter(
                  input.sessions,
                  input.filter,
                  "raw",
                  // session raw is saved with id: value
                  input.fields.map((f) => f.id)
                ),
                input.fields
              )
            : [],
        };
      }
      case EditorSymbols.Table.SYM_GRIDA_FORMS_X_SUPABASE_MAIN_TABLE_ID: {
        return {
          type: "response",
          inputlength: input.data.rows.length,
          filtered: rows_from_x_supabase_main_table({
            form_id: input.form_id,
            // TODO: support multiple PKs
            pkcol: input.data.pks.length > 0 ? input.data.pks[0] : null,
            fields: input.fields,
            rows: GridFilter.filter(
              input.data.rows,
              input.filter,
              undefined,
              input.fields.map((f) => f.name)
            ),
          }),
        };
      }
      case EditorSymbols.Table.SYM_GRIDA_X_SUPABASE_AUTH_USERS_TABLE_ID: {
        return {
          type: "x-supabase-auth.users",
          inputlength: input.data.rows.length,
          filtered: GridFilter.filter(
            input.data.rows,
            input.filter,
            undefined,
            Object.keys(GridaXSupabase.SupabaseUserJsonSchema.properties)
          ),
        };
      }
      case EditorSymbols.Table.SYM_GRIDA_CUSTOMER_TABLE_ID: {
        return {
          type: "customer",
          inputlength: input.data.rows.length,
          // @ts-ignore - FIXME:
          filtered: GridFilter.filter(
            input.data.rows,
            input.filter,
            undefined,
            [
              "uid",
              "email",
              "email_provisional",
              "phone",
              "created_at",
              "last_seen_at",
            ]
          ),
        };
      }
      case "v0_schema_table": {
        //
        switch (input.provider) {
          case "grida": {
            const filtered = GridFilter.filter(
              input.rows,
              input.filter,
              (row) => row.meta.raw,
              // response raw is saved with name: value
              input.attributes.map((f) => f.name)
            );

            return {
              type: "response",
              inputlength: input.rows.length || 0,
              filtered: rows_from_responses(filtered, input.attributes),
            };
          }
          case "x-supabase": {
            return {
              type: "response",
              inputlength: input.rows.length,
              filtered: rows_from_x_supabase_main_table({
                form_id: input.table_id,
                // TODO: support multiple PKs
                pkcol: input.pks.length > 0 ? input.pks[0] : null,
                fields: input.attributes,
                rows: GridFilter.filter(
                  input.rows,
                  input.filter,
                  undefined,
                  input.attributes.map((f) => f.name)
                ),
              }),
            };
          }
        }
      }
    }
  }

  function rows_from_responses(
    responses: Array<TVirtualRow<FormResponseField, FormResponse>>,
    attributes: FormFieldDefinition[]
  ): Array<GFResponseRow> {
    return (
      responses.map((response, index) => {
        const row: GFResponseRow = {
          __gf_id: response.id,
          __gf_display_id: fmt_local_index(response.meta.local_index),
          __gf_created_at: response.meta.created_at,
          __gf_customer_id: response.meta.customer_id,
          raw: response.meta.raw,
          fields: {}, // populated below
        }; // react-data-grid expects each row to have a unique 'id' property

        attributes.forEach((attribute) => {
          const cell: FormResponseField = response.data[attribute.id];

          row.fields[attribute.id] = {
            type: cell?.type || attribute.type,
            value: cell?.value,
            readonly: attribute.readonly || false,
            multiple: attribute.multiple || false,
            option_id: cell?.form_field_option_id,
            options: attribute.options?.reduce(
              (
                acc: { [key: string]: { value: string; label?: string } },
                option
              ) => {
                acc[option.id] = {
                  value: option.value,
                  label: option.label,
                };
                return acc;
              },
              {}
            ),
            files:
              cell?.storage_object_paths?.map((path) => {
                return gf_response_file({
                  form_id: response.meta.form_id,
                  field_id: attribute.id,
                  filepath: path,
                });
              }) || [],
          };
        });
        return row;
      }) ?? []
    );
  }

  function gf_response_file(params: {
    form_id: string;
    field_id: string;
    filepath: string;
  }): DataGridFileRef {
    const base = PrivateEditorApi.FormFieldFile.file_preview_url({
      params: params,
    });
    const src = PrivateEditorApi.FormFieldFile.file_preview_url({
      params: params,
      options: { width: 200 },
    });

    const download = PrivateEditorApi.FormFieldFile.file_preview_url({
      params: params,
      options: { download: true },
    });

    const name = params.filepath.split("/").pop() ?? "";

    // TODO: upsert - file upsert is not ready for responses

    return {
      src: src,
      srcset: {
        thumbnail: src,
        original: base,
      },
      name,
      download,
    };
  }

  function rows_from_sessions(
    sessions: FormResponseSession[],
    fields: FormFieldDefinition[]
  ) {
    return (
      sessions?.map((session, index) => {
        const row: GFResponseRow = {
          __gf_id: session.id,
          __gf_display_id: session.id,
          __gf_created_at: session.created_at,
          __gf_customer_id: session.customer_id,
          raw: session.raw,
          fields: {}, // populated below
        }; // react-data-grid expects each row to have a unique 'id' property
        Object.entries(session.raw || {}).forEach(([key, value]) => {
          const field = fields.find((f) => f.id === key);
          row.fields[key] = {
            value: value,
            type: field?.type,
            readonly: field?.readonly || false,
          };
        });
        return row;
      }) ?? []
    );
  }

  function rows_from_x_supabase_main_table({
    pkcol,
    form_id,
    fields,
    rows,
  }: {
    pkcol: string | null;
    form_id: string;
    fields: FormFieldDefinition[];
    rows: GridaXSupabase.XDataRow[];
  }) {
    const valuefn = (row: Record<string, any>, field: FormFieldDefinition) => {
      // jsonpath field
      if (FlatPostgREST.testPath(field.name)) {
        return FlatPostgREST.get(field.name, row);
      }

      return row[field.name];
    };

    return rows.reduce((acc: GFResponseRow[], row, index) => {
      const gfRow: GFResponseRow = {
        __gf_id: pkcol ? row[pkcol] : "",
        __gf_display_id: pkcol ? row[pkcol] : "",
        raw: row,
        fields: {}, // populated below
      };
      fields.forEach((field) => {
        gfRow.fields[field.id] = {
          type: field.type,
          value: valuefn(row, field),
          readonly: field.readonly || false,
          options: field.options?.reduce(
            (
              acc: { [key: string]: { value: string; label?: string } },
              option
            ) => {
              acc[option.id] = {
                value: option.value,
                label: option.label,
              };
              return acc;
            },
            {}
          ),
          files: xsb_storage_files({ field, pkcol }),
        };
      });
      acc.push(gfRow);
      return acc;
    }, []);
  }
}

export function xsb_file_refs_mapper(
  table_id: string,
  field_id: string,
  signatures: {
    publicUrl: string | null;
    signedUrl: string;
    path: string;
  }[]
) {
  return signatures
    ?.map((obj) => {
      const { path, signedUrl, publicUrl } = obj;

      const thumbnail = publicUrl
        ? SupabaseStorageExtensions.transformPublicUrl(publicUrl, {
            width: 200,
            resize: "contain",
            quality: 50,
          })
        : PrivateEditorApi.FormFieldFile.file_preview_url({
            params: {
              form_id: table_id,
              field_id: field_id,
              filepath: path,
            },
            options: {
              width: 200,
            },
          });

      const upsert = PrivateEditorApi.FormFieldFile.file_request_upsert_url({
        form_id: table_id,
        field_id: field_id,
        filepath: path,
      });

      return {
        // always use public url if available (this is cost effective for clients (users' supabase billing))
        src: publicUrl || thumbnail,
        srcset: {
          thumbnail: thumbnail,
          original: publicUrl || signedUrl,
        },
        // use path as name for x-supabase
        name: path,
        download: signedUrl,
        upsert: upsert,
      } satisfies DataGridFileRef;
    })
    .filter((f) => f) as DataGridFileRef[] | [];
}

function xsb_storage_files({
  pkcol,
  field,
}: {
  field: FormFieldDefinition;
  pkcol: string | null;
}): DataGridCellFileRefsResolver {
  if (!FieldSupports.file_alias(field.type)) return null;

  if (!pkcol) return null;

  return {
    type: "data-grid-file-storage-file-refs-query-task",
    identifier: {
      attribute: field.name,
      key: pkcol,
    },
  } satisfies DataGridFileRefsResolverQueryTask;
}
