export type Scalar = string | number | boolean;

/**
 * depending on usage, the reference can be a name (key) or id
 * - when stored in the database, it should be an id
 * - when used in the json, it should be a key
 */
export type JSONFieldReference<T extends string = string> = {
  $ref: `#/fields/${string}`;
};

type JSONLiteral = Scalar;

type JSONConditionLefthand<T extends string = string> =
  | JSONFieldReference<T>
  | JSONLiteral;

export type JSONConditionOperator = "==" | "!=" | ">" | "<" | ">=" | "<=";

type JSONConditionRighthand<T extends string = string> =
  | JSONFieldReference<T>
  | JSONLiteral;

export type JSONConditionExpression<T extends string = string> = [
  JSONConditionLefthand<T>,
  JSONConditionOperator,
  JSONConditionRighthand<T>,
];

export type JSONBooleanValueDescriptor<T extends string = string> =
  | boolean
  | JSONConditionExpression<T>;