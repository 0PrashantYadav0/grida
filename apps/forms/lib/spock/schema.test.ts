import { accessSchema, TSchema, inferSchemaFromData } from "./schema";

describe("accessSchema", () => {
  // Define a sample schema for testing
  const testSchema: TSchema = {
    type: "object",
    properties: {
      id: {
        type: "integer",
      },
      user: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          address: {
            $ref: "#/properties/id", // Here the $ref should return null
          },
        },
      },
      referenced: {
        $ref: "#/properties/user", // Here the $ref should return null
      },
    },
  };

  it("should return null when encountering a $ref in the path", () => {
    const result = accessSchema(["referenced"], testSchema);
    expect(result).toBeNull(); // Expected behavior when encountering a $ref
  });

  it("should return null when encountering a $ref in the path (nested)", () => {
    const result = accessSchema(["user", "address"], testSchema);
    expect(result).toBeNull(); // Expected behavior when encountering a $ref
  });

  it("should return the correct schema for a valid path", () => {
    const result = accessSchema(["user", "name"], testSchema);
    expect(result).toEqual({
      type: "string",
    });
  });

  it("should return null for an invalid path", () => {
    const result = accessSchema(["user", "nonexistent"], testSchema);
    expect(result).toBeNull();
  });

  it("should return the root schema when an empty path is provided", () => {
    const result = accessSchema([], testSchema);
    expect(result).toEqual(testSchema);
  });

  it("should return null if the initial path does not match any property", () => {
    const result = accessSchema(["nonexistent"], testSchema);
    expect(result).toBeNull();
  });
});

describe("infer schema", () => {
  const testData = {
    id: 1,
    user: {
      name: "John",
      address: {
        street: "123 Main St",
        city: "Springfield",
      },
    },
  };

  it("should should infer schema from data object", () => {
    const schema = inferSchemaFromData(testData, [], {
      transformthis: true,
      keepvalue: false,
    });
    expect(schema).toEqual({
      properties: {
        id: { type: "number" },
        user: {
          properties: {
            this: {
              $ref: "#/properties/user",
            },
            address: {
              properties: {
                this: {
                  $ref: "#/properties/user/properties/address",
                },
                city: { type: "string" },
                street: { type: "string" },
              },
              type: "object",
            },
            name: { type: "string" },
          },
          type: "object",
        },
      },
      type: "object",
    });
  });
});
