"use strict";
var g = Object.defineProperty;
var b = (r, e, t) =>
  e in r
    ? g(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (r[e] = t);
var c = (r, e, t) => (b(r, typeof e != "symbol" ? e + "" : e, t), t);
const registeredCallbacks = {};
function apiCallback(r) {
  return (
    registeredCallbacks[r.type] === void 0 &&
      (registeredCallbacks[r.type] = []),
    registeredCallbacks[r.type].push(r.callback),
    r
  );
}
var util$5;
(function (r) {
  r.assertEqual = (n) => n;
  function e(n) {}
  r.assertIs = e;
  function t(n) {
    throw new Error();
  }
  (r.assertNever = t),
    (r.arrayToEnum = (n) => {
      const i = {};
      for (const s of n) i[s] = s;
      return i;
    }),
    (r.getValidEnumValues = (n) => {
      const i = r.objectKeys(n).filter((a) => typeof n[n[a]] != "number"),
        s = {};
      for (const a of i) s[a] = n[a];
      return r.objectValues(s);
    }),
    (r.objectValues = (n) =>
      r.objectKeys(n).map(function (i) {
        return n[i];
      })),
    (r.objectKeys =
      typeof Object.keys == "function"
        ? (n) => Object.keys(n)
        : (n) => {
            const i = [];
            for (const s in n)
              Object.prototype.hasOwnProperty.call(n, s) && i.push(s);
            return i;
          }),
    (r.find = (n, i) => {
      for (const s of n) if (i(s)) return s;
    }),
    (r.isInteger =
      typeof Number.isInteger == "function"
        ? (n) => Number.isInteger(n)
        : (n) => typeof n == "number" && isFinite(n) && Math.floor(n) === n);
  function o(n, i = " | ") {
    return n.map((s) => (typeof s == "string" ? `'${s}'` : s)).join(i);
  }
  (r.joinValues = o),
    (r.jsonStringifyReplacer = (n, i) =>
      typeof i == "bigint" ? i.toString() : i);
})(util$5 || (util$5 = {}));
const ZodParsedType = util$5.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
  ]),
  getParsedType = (r) => {
    switch (typeof r) {
      case "undefined":
        return ZodParsedType.undefined;
      case "string":
        return ZodParsedType.string;
      case "number":
        return isNaN(r) ? ZodParsedType.nan : ZodParsedType.number;
      case "boolean":
        return ZodParsedType.boolean;
      case "function":
        return ZodParsedType.function;
      case "bigint":
        return ZodParsedType.bigint;
      case "symbol":
        return ZodParsedType.symbol;
      case "object":
        return Array.isArray(r)
          ? ZodParsedType.array
          : r === null
          ? ZodParsedType.null
          : r.then &&
            typeof r.then == "function" &&
            r.catch &&
            typeof r.catch == "function"
          ? ZodParsedType.promise
          : typeof Map < "u" && r instanceof Map
          ? ZodParsedType.map
          : typeof Set < "u" && r instanceof Set
          ? ZodParsedType.set
          : typeof Date < "u" && r instanceof Date
          ? ZodParsedType.date
          : ZodParsedType.object;
      default:
        return ZodParsedType.unknown;
    }
  },
  ZodIssueCode = util$5.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
  ]),
  quotelessJson = (r) =>
    JSON.stringify(r, null, 2).replace(/"([^"]+)":/g, "$1:");
class ZodError extends Error {
  constructor(e) {
    super(),
      (this.issues = []),
      (this.addIssue = (o) => {
        this.issues = [...this.issues, o];
      }),
      (this.addIssues = (o = []) => {
        this.issues = [...this.issues, ...o];
      });
    const t = new.target.prototype;
    Object.setPrototypeOf
      ? Object.setPrototypeOf(this, t)
      : (this.__proto__ = t),
      (this.name = "ZodError"),
      (this.issues = e);
  }
  get errors() {
    return this.issues;
  }
  format(e) {
    const t =
        e ||
        function (i) {
          return i.message;
        },
      o = { _errors: [] },
      n = (i) => {
        for (const s of i.issues)
          if (s.code === "invalid_union") s.unionErrors.map(n);
          else if (s.code === "invalid_return_type") n(s.returnTypeError);
          else if (s.code === "invalid_arguments") n(s.argumentsError);
          else if (s.path.length === 0) o._errors.push(t(s));
          else {
            let a = o,
              d = 0;
            for (; d < s.path.length; ) {
              const l = s.path[d];
              d === s.path.length - 1
                ? ((a[l] = a[l] || { _errors: [] }), a[l]._errors.push(t(s)))
                : (a[l] = a[l] || { _errors: [] }),
                (a = a[l]),
                d++;
            }
          }
      };
    return n(this), o;
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util$5.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {},
      o = [];
    for (const n of this.issues)
      n.path.length > 0
        ? ((t[n.path[0]] = t[n.path[0]] || []), t[n.path[0]].push(e(n)))
        : o.push(e(n));
    return { formErrors: o, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (r) => new ZodError(r);
const errorMap = (r, e) => {
  let t;
  switch (r.code) {
    case ZodIssueCode.invalid_type:
      r.received === ZodParsedType.undefined
        ? (t = "Required")
        : (t = `Expected ${r.expected}, received ${r.received}`);
      break;
    case ZodIssueCode.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(
        r.expected,
        util$5.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${util$5.joinValues(r.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      t = "Invalid input";
      break;
    case ZodIssueCode.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${util$5.joinValues(
        r.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      t = `Invalid enum value. Expected ${util$5.joinValues(
        r.options
      )}, received '${r.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case ZodIssueCode.invalid_return_type:
      t = "Invalid function return type";
      break;
    case ZodIssueCode.invalid_date:
      t = "Invalid date";
      break;
    case ZodIssueCode.invalid_string:
      typeof r.validation == "object"
        ? "startsWith" in r.validation
          ? (t = `Invalid input: must start with "${r.validation.startsWith}"`)
          : "endsWith" in r.validation
          ? (t = `Invalid input: must end with "${r.validation.endsWith}"`)
          : util$5.assertNever(r.validation)
        : r.validation !== "regex"
        ? (t = `Invalid ${r.validation}`)
        : (t = "Invalid");
      break;
    case ZodIssueCode.too_small:
      r.type === "array"
        ? (t = `Array must contain ${
            r.exact ? "exactly" : r.inclusive ? "at least" : "more than"
          } ${r.minimum} element(s)`)
        : r.type === "string"
        ? (t = `String must contain ${
            r.exact ? "exactly" : r.inclusive ? "at least" : "over"
          } ${r.minimum} character(s)`)
        : r.type === "number"
        ? (t = `Number must be ${
            r.exact
              ? "exactly equal to "
              : r.inclusive
              ? "greater than or equal to "
              : "greater than "
          }${r.minimum}`)
        : r.type === "date"
        ? (t = `Date must be ${
            r.exact
              ? "exactly equal to "
              : r.inclusive
              ? "greater than or equal to "
              : "greater than "
          }${new Date(r.minimum)}`)
        : (t = "Invalid input");
      break;
    case ZodIssueCode.too_big:
      r.type === "array"
        ? (t = `Array must contain ${
            r.exact ? "exactly" : r.inclusive ? "at most" : "less than"
          } ${r.maximum} element(s)`)
        : r.type === "string"
        ? (t = `String must contain ${
            r.exact ? "exactly" : r.inclusive ? "at most" : "under"
          } ${r.maximum} character(s)`)
        : r.type === "number"
        ? (t = `Number must be ${
            r.exact
              ? "exactly"
              : r.inclusive
              ? "less than or equal to"
              : "less than"
          } ${r.maximum}`)
        : r.type === "date"
        ? (t = `Date must be ${
            r.exact
              ? "exactly"
              : r.inclusive
              ? "smaller than or equal to"
              : "smaller than"
          } ${new Date(r.maximum)}`)
        : (t = "Invalid input");
      break;
    case ZodIssueCode.custom:
      t = "Invalid input";
      break;
    case ZodIssueCode.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case ZodIssueCode.not_multiple_of:
      t = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      t = "Number must be finite";
      break;
    default:
      (t = e.defaultError), util$5.assertNever(r);
  }
  return { message: t };
};
let overrideErrorMap = errorMap;
function setErrorMap(r) {
  overrideErrorMap = r;
}
function getErrorMap() {
  return overrideErrorMap;
}
const makeIssue = (r) => {
    const { data: e, path: t, errorMaps: o, issueData: n } = r,
      i = [...t, ...(n.path || [])],
      s = { ...n, path: i };
    let a = "";
    const d = o
      .filter((l) => !!l)
      .slice()
      .reverse();
    for (const l of d) a = l(s, { data: e, defaultError: a }).message;
    return { ...n, path: i, message: n.message || a };
  },
  EMPTY_PATH = [];
function addIssueToContext(r, e) {
  const t = makeIssue({
    issueData: e,
    data: r.data,
    path: r.path,
    errorMaps: [
      r.common.contextualErrorMap,
      r.schemaErrorMap,
      getErrorMap(),
      errorMap,
    ].filter((o) => !!o),
  });
  r.common.issues.push(t);
}
class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    const o = [];
    for (const n of t) {
      if (n.status === "aborted") return INVALID;
      n.status === "dirty" && e.dirty(), o.push(n.value);
    }
    return { status: e.value, value: o };
  }
  static async mergeObjectAsync(e, t) {
    const o = [];
    for (const n of t) o.push({ key: await n.key, value: await n.value });
    return ParseStatus.mergeObjectSync(e, o);
  }
  static mergeObjectSync(e, t) {
    const o = {};
    for (const n of t) {
      const { key: i, value: s } = n;
      if (i.status === "aborted" || s.status === "aborted") return INVALID;
      i.status === "dirty" && e.dirty(),
        s.status === "dirty" && e.dirty(),
        (typeof s.value < "u" || n.alwaysSet) && (o[i.value] = s.value);
    }
    return { status: e.value, value: o };
  }
}
const INVALID = Object.freeze({ status: "aborted" }),
  DIRTY = (r) => ({ status: "dirty", value: r }),
  OK = (r) => ({ status: "valid", value: r }),
  isAborted = (r) => r.status === "aborted",
  isDirty = (r) => r.status === "dirty",
  isValid = (r) => r.status === "valid",
  isAsync = (r) => typeof Promise !== void 0 && r instanceof Promise;
var errorUtil;
(function (r) {
  (r.errToObj = (e) => (typeof e == "string" ? { message: e } : e || {})),
    (r.toString = (e) =>
      typeof e == "string" ? e : e == null ? void 0 : e.message);
})(errorUtil || (errorUtil = {}));
class ParseInputLazyPath {
  constructor(e, t, o, n) {
    (this.parent = e), (this.data = t), (this._path = o), (this._key = n);
  }
  get path() {
    return this._path.concat(this._key);
  }
}
const handleResult = (r, e) => {
  if (isValid(e)) return { success: !0, data: e.value };
  if (!r.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return { success: !1, error: new ZodError(r.common.issues) };
};
function processCreateParams(r) {
  if (!r) return {};
  const {
    errorMap: e,
    invalid_type_error: t,
    required_error: o,
    description: n,
  } = r;
  if (e && (t || o))
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  return e
    ? { errorMap: e, description: n }
    : {
        errorMap: (s, a) =>
          s.code !== "invalid_type"
            ? { message: a.defaultError }
            : typeof a.data > "u"
            ? { message: o != null ? o : a.defaultError }
            : { message: t != null ? t : a.defaultError },
        description: n,
      };
}
class ZodType {
  constructor(e) {
    (this.spa = this.safeParseAsync),
      (this._def = e),
      (this.parse = this.parse.bind(this)),
      (this.safeParse = this.safeParse.bind(this)),
      (this.parseAsync = this.parseAsync.bind(this)),
      (this.safeParseAsync = this.safeParseAsync.bind(this)),
      (this.spa = this.spa.bind(this)),
      (this.refine = this.refine.bind(this)),
      (this.refinement = this.refinement.bind(this)),
      (this.superRefine = this.superRefine.bind(this)),
      (this.optional = this.optional.bind(this)),
      (this.nullable = this.nullable.bind(this)),
      (this.nullish = this.nullish.bind(this)),
      (this.array = this.array.bind(this)),
      (this.promise = this.promise.bind(this)),
      (this.or = this.or.bind(this)),
      (this.and = this.and.bind(this)),
      (this.transform = this.transform.bind(this)),
      (this.brand = this.brand.bind(this)),
      (this.default = this.default.bind(this)),
      (this.catch = this.catch.bind(this)),
      (this.describe = this.describe.bind(this)),
      (this.pipe = this.pipe.bind(this)),
      (this.isNullable = this.isNullable.bind(this)),
      (this.isOptional = this.isOptional.bind(this));
  }
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return getParsedType(e.data);
  }
  _getOrReturnCtx(e, t) {
    return (
      t || {
        common: e.parent.common,
        data: e.data,
        parsedType: getParsedType(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent,
      }
    );
  }
  _processInputParams(e) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: getParsedType(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent,
      },
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (isAsync(t)) throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const o = this.safeParse(e, t);
    if (o.success) return o.data;
    throw o.error;
  }
  safeParse(e, t) {
    var o;
    const n = {
        common: {
          issues: [],
          async:
            (o = t == null ? void 0 : t.async) !== null && o !== void 0
              ? o
              : !1,
          contextualErrorMap: t == null ? void 0 : t.errorMap,
        },
        path: (t == null ? void 0 : t.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: e,
        parsedType: getParsedType(e),
      },
      i = this._parseSync({ data: e, path: n.path, parent: n });
    return handleResult(n, i);
  }
  async parseAsync(e, t) {
    const o = await this.safeParseAsync(e, t);
    if (o.success) return o.data;
    throw o.error;
  }
  async safeParseAsync(e, t) {
    const o = {
        common: {
          issues: [],
          contextualErrorMap: t == null ? void 0 : t.errorMap,
          async: !0,
        },
        path: (t == null ? void 0 : t.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: e,
        parsedType: getParsedType(e),
      },
      n = this._parse({ data: e, path: o.path, parent: o }),
      i = await (isAsync(n) ? n : Promise.resolve(n));
    return handleResult(o, i);
  }
  refine(e, t) {
    const o = (n) =>
      typeof t == "string" || typeof t > "u"
        ? { message: t }
        : typeof t == "function"
        ? t(n)
        : t;
    return this._refinement((n, i) => {
      const s = e(n),
        a = () => i.addIssue({ code: ZodIssueCode.custom, ...o(n) });
      return typeof Promise < "u" && s instanceof Promise
        ? s.then((d) => (d ? !0 : (a(), !1)))
        : s
        ? !0
        : (a(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((o, n) =>
      e(o) ? !0 : (n.addIssue(typeof t == "function" ? t(o, n) : t), !1)
    );
  }
  _refinement(e) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement: e },
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  optional() {
    return ZodOptional.create(this);
  }
  nullable() {
    return ZodNullable.create(this);
  }
  nullish() {
    return this.optional().nullable();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this);
  }
  or(e) {
    return ZodUnion.create([this, e]);
  }
  and(e) {
    return ZodIntersection.create(this, e);
  }
  transform(e) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform: e },
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ZodDefault({
      innerType: this,
      defaultValue: t,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(void 0),
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ZodCatch({
      innerType: this,
      defaultValue: t,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
    });
  }
  describe(e) {
    const t = this.constructor;
    return new t({ ...this._def, description: e });
  }
  pipe(e) {
    return ZodPipeline.create(this, e);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const cuidRegex = /^c[^\s-]{8,}$/i,
  uuidRegex =
    /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i,
  emailRegex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
  datetimeRegex = (r) =>
    r.precision
      ? r.offset
        ? new RegExp(
            `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${r.precision}}(([+-]\\d{2}:\\d{2})|Z)$`
          )
        : new RegExp(
            `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${r.precision}}Z$`
          )
      : r.precision === 0
      ? r.offset
        ? new RegExp(
            "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}:\\d{2})|Z)$"
          )
        : new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$")
      : r.offset
      ? new RegExp(
          "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}:\\d{2})|Z)$"
        )
      : new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$");
class ZodString extends ZodType {
  constructor() {
    super(...arguments),
      (this._regex = (e, t, o) =>
        this.refinement((n) => e.test(n), {
          validation: t,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(o),
        })),
      (this.nonempty = (e) => this.min(1, errorUtil.errToObj(e))),
      (this.trim = () =>
        new ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }],
        }));
  }
  _parse(e) {
    if (
      (this._def.coerce && (e.data = String(e.data)),
      this._getType(e) !== ZodParsedType.string)
    ) {
      const i = this._getOrReturnCtx(e);
      return (
        addIssueToContext(i, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: i.parsedType,
        }),
        INVALID
      );
    }
    const o = new ParseStatus();
    let n;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value &&
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            code: ZodIssueCode.too_small,
            minimum: i.value,
            type: "string",
            inclusive: !0,
            exact: !1,
            message: i.message,
          }),
          o.dirty());
      else if (i.kind === "max")
        e.data.length > i.value &&
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            code: ZodIssueCode.too_big,
            maximum: i.value,
            type: "string",
            inclusive: !0,
            exact: !1,
            message: i.message,
          }),
          o.dirty());
      else if (i.kind === "length") {
        const s = e.data.length > i.value,
          a = e.data.length < i.value;
        (s || a) &&
          ((n = this._getOrReturnCtx(e, n)),
          s
            ? addIssueToContext(n, {
                code: ZodIssueCode.too_big,
                maximum: i.value,
                type: "string",
                inclusive: !0,
                exact: !0,
                message: i.message,
              })
            : a &&
              addIssueToContext(n, {
                code: ZodIssueCode.too_small,
                minimum: i.value,
                type: "string",
                inclusive: !0,
                exact: !0,
                message: i.message,
              }),
          o.dirty());
      } else if (i.kind === "email")
        emailRegex.test(e.data) ||
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: i.message,
          }),
          o.dirty());
      else if (i.kind === "uuid")
        uuidRegex.test(e.data) ||
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: i.message,
          }),
          o.dirty());
      else if (i.kind === "cuid")
        cuidRegex.test(e.data) ||
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: i.message,
          }),
          o.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          (n = this._getOrReturnCtx(e, n)),
            addIssueToContext(n, {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: i.message,
            }),
            o.dirty();
        }
      else
        i.kind === "regex"
          ? ((i.regex.lastIndex = 0),
            i.regex.test(e.data) ||
              ((n = this._getOrReturnCtx(e, n)),
              addIssueToContext(n, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: i.message,
              }),
              o.dirty()))
          : i.kind === "trim"
          ? (e.data = e.data.trim())
          : i.kind === "startsWith"
          ? e.data.startsWith(i.value) ||
            ((n = this._getOrReturnCtx(e, n)),
            addIssueToContext(n, {
              code: ZodIssueCode.invalid_string,
              validation: { startsWith: i.value },
              message: i.message,
            }),
            o.dirty())
          : i.kind === "endsWith"
          ? e.data.endsWith(i.value) ||
            ((n = this._getOrReturnCtx(e, n)),
            addIssueToContext(n, {
              code: ZodIssueCode.invalid_string,
              validation: { endsWith: i.value },
              message: i.message,
            }),
            o.dirty())
          : i.kind === "datetime"
          ? datetimeRegex(i).test(e.data) ||
            ((n = this._getOrReturnCtx(e, n)),
            addIssueToContext(n, {
              code: ZodIssueCode.invalid_string,
              validation: "datetime",
              message: i.message,
            }),
            o.dirty())
          : util$5.assertNever(i);
    return { status: o.value, value: e.data };
  }
  _addCheck(e) {
    return new ZodString({ ...this._def, checks: [...this._def.checks, e] });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(e) });
  }
  datetime(e) {
    var t;
    return typeof e == "string"
      ? this._addCheck({
          kind: "datetime",
          precision: null,
          offset: !1,
          message: e,
        })
      : this._addCheck({
          kind: "datetime",
          precision:
            typeof (e == null ? void 0 : e.precision) > "u"
              ? null
              : e == null
              ? void 0
              : e.precision,
          offset:
            (t = e == null ? void 0 : e.offset) !== null && t !== void 0
              ? t
              : !1,
          ...errorUtil.errToObj(e == null ? void 0 : e.message),
        });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...errorUtil.errToObj(t),
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...errorUtil.errToObj(t),
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...errorUtil.errToObj(t),
    });
  }
  min(e, t) {
    return this._addCheck({ kind: "min", value: e, ...errorUtil.errToObj(t) });
  }
  max(e, t) {
    return this._addCheck({ kind: "max", value: e, ...errorUtil.errToObj(t) });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...errorUtil.errToObj(t),
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get minLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
ZodString.create = (r) => {
  var e;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce:
      (e = r == null ? void 0 : r.coerce) !== null && e !== void 0 ? e : !1,
    ...processCreateParams(r),
  });
};
function floatSafeRemainder(r, e) {
  const t = (r.toString().split(".")[1] || "").length,
    o = (e.toString().split(".")[1] || "").length,
    n = t > o ? t : o,
    i = parseInt(r.toFixed(n).replace(".", "")),
    s = parseInt(e.toFixed(n).replace(".", ""));
  return (i % s) / Math.pow(10, n);
}
class ZodNumber extends ZodType {
  constructor() {
    super(...arguments),
      (this.min = this.gte),
      (this.max = this.lte),
      (this.step = this.multipleOf);
  }
  _parse(e) {
    if (
      (this._def.coerce && (e.data = Number(e.data)),
      this._getType(e) !== ZodParsedType.number)
    ) {
      const i = this._getOrReturnCtx(e);
      return (
        addIssueToContext(i, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: i.parsedType,
        }),
        INVALID
      );
    }
    let o;
    const n = new ParseStatus();
    for (const i of this._def.checks)
      i.kind === "int"
        ? util$5.isInteger(e.data) ||
          ((o = this._getOrReturnCtx(e, o)),
          addIssueToContext(o, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: i.message,
          }),
          n.dirty())
        : i.kind === "min"
        ? (i.inclusive ? e.data < i.value : e.data <= i.value) &&
          ((o = this._getOrReturnCtx(e, o)),
          addIssueToContext(o, {
            code: ZodIssueCode.too_small,
            minimum: i.value,
            type: "number",
            inclusive: i.inclusive,
            exact: !1,
            message: i.message,
          }),
          n.dirty())
        : i.kind === "max"
        ? (i.inclusive ? e.data > i.value : e.data >= i.value) &&
          ((o = this._getOrReturnCtx(e, o)),
          addIssueToContext(o, {
            code: ZodIssueCode.too_big,
            maximum: i.value,
            type: "number",
            inclusive: i.inclusive,
            exact: !1,
            message: i.message,
          }),
          n.dirty())
        : i.kind === "multipleOf"
        ? floatSafeRemainder(e.data, i.value) !== 0 &&
          ((o = this._getOrReturnCtx(e, o)),
          addIssueToContext(o, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: i.value,
            message: i.message,
          }),
          n.dirty())
        : i.kind === "finite"
        ? Number.isFinite(e.data) ||
          ((o = this._getOrReturnCtx(e, o)),
          addIssueToContext(o, {
            code: ZodIssueCode.not_finite,
            message: i.message,
          }),
          n.dirty())
        : util$5.assertNever(i);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, errorUtil.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, errorUtil.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, errorUtil.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, errorUtil.toString(t));
  }
  setLimit(e, t, o, n) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        { kind: e, value: t, inclusive: o, message: errorUtil.toString(n) },
      ],
    });
  }
  _addCheck(e) {
    return new ZodNumber({ ...this._def, checks: [...this._def.checks, e] });
  }
  int(e) {
    return this._addCheck({ kind: "int", message: errorUtil.toString(e) });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: errorUtil.toString(e),
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: errorUtil.toString(e),
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: errorUtil.toString(e),
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: errorUtil.toString(e),
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: errorUtil.toString(t),
    });
  }
  finite(e) {
    return this._addCheck({ kind: "finite", message: errorUtil.toString(e) });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int");
  }
}
ZodNumber.create = (r) =>
  new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (r == null ? void 0 : r.coerce) || !1,
    ...processCreateParams(r),
  });
class ZodBigInt extends ZodType {
  _parse(e) {
    if (
      (this._def.coerce && (e.data = BigInt(e.data)),
      this._getType(e) !== ZodParsedType.bigint)
    ) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
}
ZodBigInt.create = (r) => {
  var e;
  return new ZodBigInt({
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce:
      (e = r == null ? void 0 : r.coerce) !== null && e !== void 0 ? e : !1,
    ...processCreateParams(r),
  });
};
class ZodBoolean extends ZodType {
  _parse(e) {
    if (
      (this._def.coerce && (e.data = Boolean(e.data)),
      this._getType(e) !== ZodParsedType.boolean)
    ) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
}
ZodBoolean.create = (r) =>
  new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (r == null ? void 0 : r.coerce) || !1,
    ...processCreateParams(r),
  });
class ZodDate extends ZodType {
  _parse(e) {
    if (
      (this._def.coerce && (e.data = new Date(e.data)),
      this._getType(e) !== ZodParsedType.date)
    ) {
      const i = this._getOrReturnCtx(e);
      return (
        addIssueToContext(i, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: i.parsedType,
        }),
        INVALID
      );
    }
    if (isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return addIssueToContext(i, { code: ZodIssueCode.invalid_date }), INVALID;
    }
    const o = new ParseStatus();
    let n;
    for (const i of this._def.checks)
      i.kind === "min"
        ? e.data.getTime() < i.value &&
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            code: ZodIssueCode.too_small,
            message: i.message,
            inclusive: !0,
            exact: !1,
            minimum: i.value,
            type: "date",
          }),
          o.dirty())
        : i.kind === "max"
        ? e.data.getTime() > i.value &&
          ((n = this._getOrReturnCtx(e, n)),
          addIssueToContext(n, {
            code: ZodIssueCode.too_big,
            message: i.message,
            inclusive: !0,
            exact: !1,
            maximum: i.value,
            type: "date",
          }),
          o.dirty())
        : util$5.assertNever(i);
    return { status: o.value, value: new Date(e.data.getTime()) };
  }
  _addCheck(e) {
    return new ZodDate({ ...this._def, checks: [...this._def.checks, e] });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: errorUtil.toString(t),
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: errorUtil.toString(t),
    });
  }
  get minDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
}
ZodDate.create = (r) =>
  new ZodDate({
    checks: [],
    coerce: (r == null ? void 0 : r.coerce) || !1,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(r),
  });
class ZodSymbol extends ZodType {
  _parse(e) {
    if (this._getType(e) !== ZodParsedType.symbol) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.symbol,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
}
ZodSymbol.create = (r) =>
  new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(r),
  });
class ZodUndefined extends ZodType {
  _parse(e) {
    if (this._getType(e) !== ZodParsedType.undefined) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
}
ZodUndefined.create = (r) =>
  new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(r),
  });
class ZodNull extends ZodType {
  _parse(e) {
    if (this._getType(e) !== ZodParsedType.null) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
}
ZodNull.create = (r) =>
  new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(r),
  });
class ZodAny extends ZodType {
  constructor() {
    super(...arguments), (this._any = !0);
  }
  _parse(e) {
    return OK(e.data);
  }
}
ZodAny.create = (r) =>
  new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(r),
  });
class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments), (this._unknown = !0);
  }
  _parse(e) {
    return OK(e.data);
  }
}
ZodUnknown.create = (r) =>
  new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(r),
  });
class ZodNever extends ZodType {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return (
      addIssueToContext(t, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: t.parsedType,
      }),
      INVALID
    );
  }
}
ZodNever.create = (r) =>
  new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(r),
  });
class ZodVoid extends ZodType {
  _parse(e) {
    if (this._getType(e) !== ZodParsedType.undefined) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
}
ZodVoid.create = (r) =>
  new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(r),
  });
class ZodArray extends ZodType {
  _parse(e) {
    const { ctx: t, status: o } = this._processInputParams(e),
      n = this._def;
    if (t.parsedType !== ZodParsedType.array)
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: t.parsedType,
        }),
        INVALID
      );
    if (n.exactLength !== null) {
      const s = t.data.length > n.exactLength.value,
        a = t.data.length < n.exactLength.value;
      (s || a) &&
        (addIssueToContext(t, {
          code: s ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: a ? n.exactLength.value : void 0,
          maximum: s ? n.exactLength.value : void 0,
          type: "array",
          inclusive: !0,
          exact: !0,
          message: n.exactLength.message,
        }),
        o.dirty());
    }
    if (
      (n.minLength !== null &&
        t.data.length < n.minLength.value &&
        (addIssueToContext(t, {
          code: ZodIssueCode.too_small,
          minimum: n.minLength.value,
          type: "array",
          inclusive: !0,
          exact: !1,
          message: n.minLength.message,
        }),
        o.dirty()),
      n.maxLength !== null &&
        t.data.length > n.maxLength.value &&
        (addIssueToContext(t, {
          code: ZodIssueCode.too_big,
          maximum: n.maxLength.value,
          type: "array",
          inclusive: !0,
          exact: !1,
          message: n.maxLength.message,
        }),
        o.dirty()),
      t.common.async)
    )
      return Promise.all(
        t.data.map((s, a) =>
          n.type._parseAsync(new ParseInputLazyPath(t, s, t.path, a))
        )
      ).then((s) => ParseStatus.mergeArray(o, s));
    const i = t.data.map((s, a) =>
      n.type._parseSync(new ParseInputLazyPath(t, s, t.path, a))
    );
    return ParseStatus.mergeArray(o, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new ZodArray({
      ...this._def,
      minLength: { value: e, message: errorUtil.toString(t) },
    });
  }
  max(e, t) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: e, message: errorUtil.toString(t) },
    });
  }
  length(e, t) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: e, message: errorUtil.toString(t) },
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ZodArray.create = (r, e) =>
  new ZodArray({
    type: r,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(e),
  });
var objectUtil;
(function (r) {
  r.mergeShapes = (e, t) => ({ ...e, ...t });
})(objectUtil || (objectUtil = {}));
const AugmentFactory = (r) => (e) =>
  new ZodObject({ ...r, shape: () => ({ ...r.shape(), ...e }) });
function deepPartialify(r) {
  if (r instanceof ZodObject) {
    const e = {};
    for (const t in r.shape) {
      const o = r.shape[t];
      e[t] = ZodOptional.create(deepPartialify(o));
    }
    return new ZodObject({ ...r._def, shape: () => e });
  } else
    return r instanceof ZodArray
      ? ZodArray.create(deepPartialify(r.element))
      : r instanceof ZodOptional
      ? ZodOptional.create(deepPartialify(r.unwrap()))
      : r instanceof ZodNullable
      ? ZodNullable.create(deepPartialify(r.unwrap()))
      : r instanceof ZodTuple
      ? ZodTuple.create(r.items.map((e) => deepPartialify(e)))
      : r;
}
class ZodObject extends ZodType {
  constructor() {
    super(...arguments),
      (this._cached = null),
      (this.nonstrict = this.passthrough),
      (this.augment = AugmentFactory(this._def)),
      (this.extend = AugmentFactory(this._def));
  }
  _getCached() {
    if (this._cached !== null) return this._cached;
    const e = this._def.shape(),
      t = util$5.objectKeys(e);
    return (this._cached = { shape: e, keys: t });
  }
  _parse(e) {
    if (this._getType(e) !== ZodParsedType.object) {
      const l = this._getOrReturnCtx(e);
      return (
        addIssueToContext(l, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: l.parsedType,
        }),
        INVALID
      );
    }
    const { status: o, ctx: n } = this._processInputParams(e),
      { shape: i, keys: s } = this._getCached(),
      a = [];
    if (
      !(
        this._def.catchall instanceof ZodNever &&
        this._def.unknownKeys === "strip"
      )
    )
      for (const l in n.data) s.includes(l) || a.push(l);
    const d = [];
    for (const l of s) {
      const u = i[l],
        p = n.data[l];
      d.push({
        key: { status: "valid", value: l },
        value: u._parse(new ParseInputLazyPath(n, p, n.path, l)),
        alwaysSet: l in n.data,
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const u of a)
          d.push({
            key: { status: "valid", value: u },
            value: { status: "valid", value: n.data[u] },
          });
      else if (l === "strict")
        a.length > 0 &&
          (addIssueToContext(n, {
            code: ZodIssueCode.unrecognized_keys,
            keys: a,
          }),
          o.dirty());
      else if (l !== "strip")
        throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const u of a) {
        const p = n.data[u];
        d.push({
          key: { status: "valid", value: u },
          value: l._parse(new ParseInputLazyPath(n, p, n.path, u)),
          alwaysSet: u in n.data,
        });
      }
    }
    return n.common.async
      ? Promise.resolve()
          .then(async () => {
            const l = [];
            for (const u of d) {
              const p = await u.key;
              l.push({ key: p, value: await u.value, alwaysSet: u.alwaysSet });
            }
            return l;
          })
          .then((l) => ParseStatus.mergeObjectSync(o, l))
      : ParseStatus.mergeObjectSync(o, d);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return (
      errorUtil.errToObj,
      new ZodObject({
        ...this._def,
        unknownKeys: "strict",
        ...(e !== void 0
          ? {
              errorMap: (t, o) => {
                var n, i, s, a;
                const d =
                  (s =
                    (i = (n = this._def).errorMap) === null || i === void 0
                      ? void 0
                      : i.call(n, t, o).message) !== null && s !== void 0
                    ? s
                    : o.defaultError;
                return t.code === "unrecognized_keys"
                  ? {
                      message:
                        (a = errorUtil.errToObj(e).message) !== null &&
                        a !== void 0
                          ? a
                          : d,
                    }
                  : { message: d };
              },
            }
          : {}),
      })
    );
  }
  strip() {
    return new ZodObject({ ...this._def, unknownKeys: "strip" });
  }
  passthrough() {
    return new ZodObject({ ...this._def, unknownKeys: "passthrough" });
  }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  merge(e) {
    return new ZodObject({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => objectUtil.mergeShapes(this._def.shape(), e._def.shape()),
      typeName: ZodFirstPartyTypeKind.ZodObject,
    });
  }
  catchall(e) {
    return new ZodObject({ ...this._def, catchall: e });
  }
  pick(e) {
    const t = {};
    return (
      util$5.objectKeys(e).map((o) => {
        this.shape[o] && (t[o] = this.shape[o]);
      }),
      new ZodObject({ ...this._def, shape: () => t })
    );
  }
  omit(e) {
    const t = {};
    return (
      util$5.objectKeys(this.shape).map((o) => {
        util$5.objectKeys(e).indexOf(o) === -1 && (t[o] = this.shape[o]);
      }),
      new ZodObject({ ...this._def, shape: () => t })
    );
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(e) {
    const t = {};
    if (e)
      return (
        util$5.objectKeys(this.shape).map((o) => {
          util$5.objectKeys(e).indexOf(o) === -1
            ? (t[o] = this.shape[o])
            : (t[o] = this.shape[o].optional());
        }),
        new ZodObject({ ...this._def, shape: () => t })
      );
    for (const o in this.shape) {
      const n = this.shape[o];
      t[o] = n.optional();
    }
    return new ZodObject({ ...this._def, shape: () => t });
  }
  required(e) {
    const t = {};
    if (e)
      util$5.objectKeys(this.shape).map((o) => {
        if (util$5.objectKeys(e).indexOf(o) === -1) t[o] = this.shape[o];
        else {
          let i = this.shape[o];
          for (; i instanceof ZodOptional; ) i = i._def.innerType;
          t[o] = i;
        }
      });
    else
      for (const o in this.shape) {
        let i = this.shape[o];
        for (; i instanceof ZodOptional; ) i = i._def.innerType;
        t[o] = i;
      }
    return new ZodObject({ ...this._def, shape: () => t });
  }
  keyof() {
    return createZodEnum(util$5.objectKeys(this.shape));
  }
}
ZodObject.create = (r, e) =>
  new ZodObject({
    shape: () => r,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(e),
  });
ZodObject.strictCreate = (r, e) =>
  new ZodObject({
    shape: () => r,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(e),
  });
ZodObject.lazycreate = (r, e) =>
  new ZodObject({
    shape: r,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(e),
  });
class ZodUnion extends ZodType {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e),
      o = this._def.options;
    function n(i) {
      for (const a of i) if (a.result.status === "valid") return a.result;
      for (const a of i)
        if (a.result.status === "dirty")
          return t.common.issues.push(...a.ctx.common.issues), a.result;
      const s = i.map((a) => new ZodError(a.ctx.common.issues));
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_union,
          unionErrors: s,
        }),
        INVALID
      );
    }
    if (t.common.async)
      return Promise.all(
        o.map(async (i) => {
          const s = { ...t, common: { ...t.common, issues: [] }, parent: null };
          return {
            result: await i._parseAsync({
              data: t.data,
              path: t.path,
              parent: s,
            }),
            ctx: s,
          };
        })
      ).then(n);
    {
      let i;
      const s = [];
      for (const d of o) {
        const l = { ...t, common: { ...t.common, issues: [] }, parent: null },
          u = d._parseSync({ data: t.data, path: t.path, parent: l });
        if (u.status === "valid") return u;
        u.status === "dirty" && !i && (i = { result: u, ctx: l }),
          l.common.issues.length && s.push(l.common.issues);
      }
      if (i) return t.common.issues.push(...i.ctx.common.issues), i.result;
      const a = s.map((d) => new ZodError(d));
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_union,
          unionErrors: a,
        }),
        INVALID
      );
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (r, e) =>
  new ZodUnion({
    options: r,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(e),
  });
const getDiscriminator = (r) =>
  r instanceof ZodLazy
    ? getDiscriminator(r.schema)
    : r instanceof ZodEffects
    ? getDiscriminator(r.innerType())
    : r instanceof ZodLiteral
    ? [r.value]
    : r instanceof ZodEnum
    ? r.options
    : r instanceof ZodNativeEnum
    ? Object.keys(r.enum)
    : r instanceof ZodDefault
    ? getDiscriminator(r._def.innerType)
    : r instanceof ZodUndefined
    ? [void 0]
    : r instanceof ZodNull
    ? [null]
    : null;
class ZodDiscriminatedUnion extends ZodType {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== ZodParsedType.object)
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: t.parsedType,
        }),
        INVALID
      );
    const o = this.discriminator,
      n = t.data[o],
      i = this.optionsMap.get(n);
    return i
      ? t.common.async
        ? i._parseAsync({ data: t.data, path: t.path, parent: t })
        : i._parseSync({ data: t.data, path: t.path, parent: t })
      : (addIssueToContext(t, {
          code: ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [o],
        }),
        INVALID);
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(e, t, o) {
    const n = new Map();
    for (const i of t) {
      const s = getDiscriminator(i.shape[e]);
      if (!s)
        throw new Error(
          `A discriminator value for key \`${e}\` could not be extracted from all schema options`
        );
      for (const a of s) {
        if (n.has(a))
          throw new Error(
            `Discriminator property ${String(e)} has duplicate value ${String(
              a
            )}`
          );
        n.set(a, i);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator: e,
      options: t,
      optionsMap: n,
      ...processCreateParams(o),
    });
  }
}
function mergeValues(r, e) {
  const t = getParsedType(r),
    o = getParsedType(e);
  if (r === e) return { valid: !0, data: r };
  if (t === ZodParsedType.object && o === ZodParsedType.object) {
    const n = util$5.objectKeys(e),
      i = util$5.objectKeys(r).filter((a) => n.indexOf(a) !== -1),
      s = { ...r, ...e };
    for (const a of i) {
      const d = mergeValues(r[a], e[a]);
      if (!d.valid) return { valid: !1 };
      s[a] = d.data;
    }
    return { valid: !0, data: s };
  } else if (t === ZodParsedType.array && o === ZodParsedType.array) {
    if (r.length !== e.length) return { valid: !1 };
    const n = [];
    for (let i = 0; i < r.length; i++) {
      const s = r[i],
        a = e[i],
        d = mergeValues(s, a);
      if (!d.valid) return { valid: !1 };
      n.push(d.data);
    }
    return { valid: !0, data: n };
  } else
    return t === ZodParsedType.date && o === ZodParsedType.date && +r == +e
      ? { valid: !0, data: r }
      : { valid: !1 };
}
class ZodIntersection extends ZodType {
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e),
      n = (i, s) => {
        if (isAborted(i) || isAborted(s)) return INVALID;
        const a = mergeValues(i.value, s.value);
        return a.valid
          ? ((isDirty(i) || isDirty(s)) && t.dirty(),
            { status: t.value, value: a.data })
          : (addIssueToContext(o, {
              code: ZodIssueCode.invalid_intersection_types,
            }),
            INVALID);
      };
    return o.common.async
      ? Promise.all([
          this._def.left._parseAsync({ data: o.data, path: o.path, parent: o }),
          this._def.right._parseAsync({
            data: o.data,
            path: o.path,
            parent: o,
          }),
        ]).then(([i, s]) => n(i, s))
      : n(
          this._def.left._parseSync({ data: o.data, path: o.path, parent: o }),
          this._def.right._parseSync({ data: o.data, path: o.path, parent: o })
        );
  }
}
ZodIntersection.create = (r, e, t) =>
  new ZodIntersection({
    left: r,
    right: e,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(t),
  });
class ZodTuple extends ZodType {
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e);
    if (o.parsedType !== ZodParsedType.array)
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: o.parsedType,
        }),
        INVALID
      );
    if (o.data.length < this._def.items.length)
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: !0,
          exact: !1,
          type: "array",
        }),
        INVALID
      );
    !this._def.rest &&
      o.data.length > this._def.items.length &&
      (addIssueToContext(o, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array",
      }),
      t.dirty());
    const i = o.data
      .map((s, a) => {
        const d = this._def.items[a] || this._def.rest;
        return d ? d._parse(new ParseInputLazyPath(o, s, o.path, a)) : null;
      })
      .filter((s) => !!s);
    return o.common.async
      ? Promise.all(i).then((s) => ParseStatus.mergeArray(t, s))
      : ParseStatus.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new ZodTuple({ ...this._def, rest: e });
  }
}
ZodTuple.create = (r, e) => {
  if (!Array.isArray(r))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new ZodTuple({
    items: r,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(e),
  });
};
class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e);
    if (o.parsedType !== ZodParsedType.object)
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: o.parsedType,
        }),
        INVALID
      );
    const n = [],
      i = this._def.keyType,
      s = this._def.valueType;
    for (const a in o.data)
      n.push({
        key: i._parse(new ParseInputLazyPath(o, a, o.path, a)),
        value: s._parse(new ParseInputLazyPath(o, o.data[a], o.path, a)),
      });
    return o.common.async
      ? ParseStatus.mergeObjectAsync(t, n)
      : ParseStatus.mergeObjectSync(t, n);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, o) {
    return t instanceof ZodType
      ? new ZodRecord({
          keyType: e,
          valueType: t,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(o),
        })
      : new ZodRecord({
          keyType: ZodString.create(),
          valueType: e,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(t),
        });
  }
}
class ZodMap extends ZodType {
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e);
    if (o.parsedType !== ZodParsedType.map)
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: o.parsedType,
        }),
        INVALID
      );
    const n = this._def.keyType,
      i = this._def.valueType,
      s = [...o.data.entries()].map(([a, d], l) => ({
        key: n._parse(new ParseInputLazyPath(o, a, o.path, [l, "key"])),
        value: i._parse(new ParseInputLazyPath(o, d, o.path, [l, "value"])),
      }));
    if (o.common.async) {
      const a = new Map();
      return Promise.resolve().then(async () => {
        for (const d of s) {
          const l = await d.key,
            u = await d.value;
          if (l.status === "aborted" || u.status === "aborted") return INVALID;
          (l.status === "dirty" || u.status === "dirty") && t.dirty(),
            a.set(l.value, u.value);
        }
        return { status: t.value, value: a };
      });
    } else {
      const a = new Map();
      for (const d of s) {
        const l = d.key,
          u = d.value;
        if (l.status === "aborted" || u.status === "aborted") return INVALID;
        (l.status === "dirty" || u.status === "dirty") && t.dirty(),
          a.set(l.value, u.value);
      }
      return { status: t.value, value: a };
    }
  }
}
ZodMap.create = (r, e, t) =>
  new ZodMap({
    valueType: e,
    keyType: r,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(t),
  });
class ZodSet extends ZodType {
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e);
    if (o.parsedType !== ZodParsedType.set)
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: o.parsedType,
        }),
        INVALID
      );
    const n = this._def;
    n.minSize !== null &&
      o.data.size < n.minSize.value &&
      (addIssueToContext(o, {
        code: ZodIssueCode.too_small,
        minimum: n.minSize.value,
        type: "set",
        inclusive: !0,
        exact: !1,
        message: n.minSize.message,
      }),
      t.dirty()),
      n.maxSize !== null &&
        o.data.size > n.maxSize.value &&
        (addIssueToContext(o, {
          code: ZodIssueCode.too_big,
          maximum: n.maxSize.value,
          type: "set",
          inclusive: !0,
          exact: !1,
          message: n.maxSize.message,
        }),
        t.dirty());
    const i = this._def.valueType;
    function s(d) {
      const l = new Set();
      for (const u of d) {
        if (u.status === "aborted") return INVALID;
        u.status === "dirty" && t.dirty(), l.add(u.value);
      }
      return { status: t.value, value: l };
    }
    const a = [...o.data.values()].map((d, l) =>
      i._parse(new ParseInputLazyPath(o, d, o.path, l))
    );
    return o.common.async ? Promise.all(a).then((d) => s(d)) : s(a);
  }
  min(e, t) {
    return new ZodSet({
      ...this._def,
      minSize: { value: e, message: errorUtil.toString(t) },
    });
  }
  max(e, t) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: e, message: errorUtil.toString(t) },
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ZodSet.create = (r, e) =>
  new ZodSet({
    valueType: r,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(e),
  });
class ZodFunction extends ZodType {
  constructor() {
    super(...arguments), (this.validate = this.implement);
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== ZodParsedType.function)
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: t.parsedType,
        }),
        INVALID
      );
    function o(a, d) {
      return makeIssue({
        data: a,
        path: t.path,
        errorMaps: [
          t.common.contextualErrorMap,
          t.schemaErrorMap,
          getErrorMap(),
          errorMap,
        ].filter((l) => !!l),
        issueData: { code: ZodIssueCode.invalid_arguments, argumentsError: d },
      });
    }
    function n(a, d) {
      return makeIssue({
        data: a,
        path: t.path,
        errorMaps: [
          t.common.contextualErrorMap,
          t.schemaErrorMap,
          getErrorMap(),
          errorMap,
        ].filter((l) => !!l),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: d,
        },
      });
    }
    const i = { errorMap: t.common.contextualErrorMap },
      s = t.data;
    return this._def.returns instanceof ZodPromise
      ? OK(async (...a) => {
          const d = new ZodError([]),
            l = await this._def.args.parseAsync(a, i).catch((m) => {
              throw (d.addIssue(o(a, m)), d);
            }),
            u = await s(...l);
          return await this._def.returns._def.type
            .parseAsync(u, i)
            .catch((m) => {
              throw (d.addIssue(n(u, m)), d);
            });
        })
      : OK((...a) => {
          const d = this._def.args.safeParse(a, i);
          if (!d.success) throw new ZodError([o(a, d.error)]);
          const l = s(...d.data),
            u = this._def.returns.safeParse(l, i);
          if (!u.success) throw new ZodError([n(l, u.error)]);
          return u.data;
        });
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...e) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(e).rest(ZodUnknown.create()),
    });
  }
  returns(e) {
    return new ZodFunction({ ...this._def, returns: e });
  }
  implement(e) {
    return this.parse(e);
  }
  strictImplement(e) {
    return this.parse(e);
  }
  static create(e, t, o) {
    return new ZodFunction({
      args: e || ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: t || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(o),
    });
  }
}
class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
ZodLazy.create = (r, e) =>
  new ZodLazy({
    getter: r,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(e),
  });
class ZodLiteral extends ZodType {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value,
        }),
        INVALID
      );
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (r, e) =>
  new ZodLiteral({
    value: r,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(e),
  });
function createZodEnum(r, e) {
  return new ZodEnum({
    values: r,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(e),
  });
}
class ZodEnum extends ZodType {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e),
        o = this._def.values;
      return (
        addIssueToContext(t, {
          expected: util$5.joinValues(o),
          received: t.parsedType,
          code: ZodIssueCode.invalid_type,
        }),
        INVALID
      );
    }
    if (this._def.values.indexOf(e.data) === -1) {
      const t = this._getOrReturnCtx(e),
        o = this._def.values;
      return (
        addIssueToContext(t, {
          received: t.data,
          code: ZodIssueCode.invalid_enum_value,
          options: o,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const t of this._def.values) e[t] = t;
    return e;
  }
  get Values() {
    const e = {};
    for (const t of this._def.values) e[t] = t;
    return e;
  }
  get Enum() {
    const e = {};
    for (const t of this._def.values) e[t] = t;
    return e;
  }
}
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
  _parse(e) {
    const t = util$5.getValidEnumValues(this._def.values),
      o = this._getOrReturnCtx(e);
    if (
      o.parsedType !== ZodParsedType.string &&
      o.parsedType !== ZodParsedType.number
    ) {
      const n = util$5.objectValues(t);
      return (
        addIssueToContext(o, {
          expected: util$5.joinValues(n),
          received: o.parsedType,
          code: ZodIssueCode.invalid_type,
        }),
        INVALID
      );
    }
    if (t.indexOf(e.data) === -1) {
      const n = util$5.objectValues(t);
      return (
        addIssueToContext(o, {
          received: o.data,
          code: ZodIssueCode.invalid_enum_value,
          options: n,
        }),
        INVALID
      );
    }
    return OK(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (r, e) =>
  new ZodNativeEnum({
    values: r,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(e),
  });
class ZodPromise extends ZodType {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== ZodParsedType.promise && t.common.async === !1)
      return (
        addIssueToContext(t, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: t.parsedType,
        }),
        INVALID
      );
    const o =
      t.parsedType === ZodParsedType.promise ? t.data : Promise.resolve(t.data);
    return OK(
      o.then((n) =>
        this._def.type.parseAsync(n, {
          path: t.path,
          errorMap: t.common.contextualErrorMap,
        })
      )
    );
  }
}
ZodPromise.create = (r, e) =>
  new ZodPromise({
    type: r,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(e),
  });
class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
      ? this._def.schema.sourceType()
      : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e),
      n = this._def.effect || null;
    if (n.type === "preprocess") {
      const s = n.transform(o.data);
      return o.common.async
        ? Promise.resolve(s).then((a) =>
            this._def.schema._parseAsync({ data: a, path: o.path, parent: o })
          )
        : this._def.schema._parseSync({ data: s, path: o.path, parent: o });
    }
    const i = {
      addIssue: (s) => {
        addIssueToContext(o, s), s.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return o.path;
      },
    };
    if (((i.addIssue = i.addIssue.bind(i)), n.type === "refinement")) {
      const s = (a) => {
        const d = n.refinement(a, i);
        if (o.common.async) return Promise.resolve(d);
        if (d instanceof Promise)
          throw new Error(
            "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
          );
        return a;
      };
      if (o.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: o.data,
          path: o.path,
          parent: o,
        });
        return a.status === "aborted"
          ? INVALID
          : (a.status === "dirty" && t.dirty(),
            s(a.value),
            { status: t.value, value: a.value });
      } else
        return this._def.schema
          ._parseAsync({ data: o.data, path: o.path, parent: o })
          .then((a) =>
            a.status === "aborted"
              ? INVALID
              : (a.status === "dirty" && t.dirty(),
                s(a.value).then(() => ({ status: t.value, value: a.value })))
          );
    }
    if (n.type === "transform")
      if (o.common.async === !1) {
        const s = this._def.schema._parseSync({
          data: o.data,
          path: o.path,
          parent: o,
        });
        if (!isValid(s)) return s;
        const a = n.transform(s.value, i);
        if (a instanceof Promise)
          throw new Error(
            "Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead."
          );
        return { status: t.value, value: a };
      } else
        return this._def.schema
          ._parseAsync({ data: o.data, path: o.path, parent: o })
          .then((s) =>
            isValid(s)
              ? Promise.resolve(n.transform(s.value, i)).then((a) => ({
                  status: t.value,
                  value: a,
                }))
              : s
          );
    util$5.assertNever(n);
  }
}
ZodEffects.create = (r, e, t) =>
  new ZodEffects({
    schema: r,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect: e,
    ...processCreateParams(t),
  });
ZodEffects.createWithPreprocess = (r, e, t) =>
  new ZodEffects({
    schema: e,
    effect: { type: "preprocess", transform: r },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(t),
  });
class ZodOptional extends ZodType {
  _parse(e) {
    return this._getType(e) === ZodParsedType.undefined
      ? OK(void 0)
      : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (r, e) =>
  new ZodOptional({
    innerType: r,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(e),
  });
class ZodNullable extends ZodType {
  _parse(e) {
    return this._getType(e) === ZodParsedType.null
      ? OK(null)
      : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (r, e) =>
  new ZodNullable({
    innerType: r,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(e),
  });
class ZodDefault extends ZodType {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let o = t.data;
    return (
      t.parsedType === ZodParsedType.undefined &&
        (o = this._def.defaultValue()),
      this._def.innerType._parse({ data: o, path: t.path, parent: t })
    );
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (r, e) =>
  new ZodDefault({
    innerType: r,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof e.default == "function" ? e.default : () => e.default,
    ...processCreateParams(e),
  });
class ZodCatch extends ZodType {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e),
      o = this._def.innerType._parse({ data: t.data, path: t.path, parent: t });
    return isAsync(o)
      ? o.then((n) => ({
          status: "valid",
          value: n.status === "valid" ? n.value : this._def.defaultValue(),
        }))
      : {
          status: "valid",
          value: o.status === "valid" ? o.value : this._def.defaultValue(),
        };
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodCatch.create = (r, e) =>
  new ZodCatch({
    innerType: r,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    defaultValue: typeof e.default == "function" ? e.default : () => e.default,
    ...processCreateParams(e),
  });
class ZodNaN extends ZodType {
  _parse(e) {
    if (this._getType(e) !== ZodParsedType.nan) {
      const o = this._getOrReturnCtx(e);
      return (
        addIssueToContext(o, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: o.parsedType,
        }),
        INVALID
      );
    }
    return { status: "valid", value: e.data };
  }
}
ZodNaN.create = (r) =>
  new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(r),
  });
const BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e),
      o = t.data;
    return this._def.type._parse({ data: o, path: t.path, parent: t });
  }
  unwrap() {
    return this._def.type;
  }
}
class ZodPipeline extends ZodType {
  _parse(e) {
    const { status: t, ctx: o } = this._processInputParams(e);
    if (o.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: o.data,
          path: o.path,
          parent: o,
        });
        return i.status === "aborted"
          ? INVALID
          : i.status === "dirty"
          ? (t.dirty(), DIRTY(i.value))
          : this._def.out._parseAsync({
              data: i.value,
              path: o.path,
              parent: o,
            });
      })();
    {
      const n = this._def.in._parseSync({
        data: o.data,
        path: o.path,
        parent: o,
      });
      return n.status === "aborted"
        ? INVALID
        : n.status === "dirty"
        ? (t.dirty(), { status: "dirty", value: n.value })
        : this._def.out._parseSync({ data: n.value, path: o.path, parent: o });
    }
  }
  static create(e, t) {
    return new ZodPipeline({
      in: e,
      out: t,
      typeName: ZodFirstPartyTypeKind.ZodPipeline,
    });
  }
}
const custom = (r, e = {}, t) =>
    r
      ? ZodAny.create().superRefine((o, n) => {
          if (!r(o)) {
            const i = typeof e == "function" ? e(o) : e,
              s = typeof i == "string" ? { message: i } : i;
            n.addIssue({ code: "custom", ...s, fatal: t });
          }
        })
      : ZodAny.create(),
  late = { object: ZodObject.lazycreate };
var ZodFirstPartyTypeKind;
(function (r) {
  (r.ZodString = "ZodString"),
    (r.ZodNumber = "ZodNumber"),
    (r.ZodNaN = "ZodNaN"),
    (r.ZodBigInt = "ZodBigInt"),
    (r.ZodBoolean = "ZodBoolean"),
    (r.ZodDate = "ZodDate"),
    (r.ZodSymbol = "ZodSymbol"),
    (r.ZodUndefined = "ZodUndefined"),
    (r.ZodNull = "ZodNull"),
    (r.ZodAny = "ZodAny"),
    (r.ZodUnknown = "ZodUnknown"),
    (r.ZodNever = "ZodNever"),
    (r.ZodVoid = "ZodVoid"),
    (r.ZodArray = "ZodArray"),
    (r.ZodObject = "ZodObject"),
    (r.ZodUnion = "ZodUnion"),
    (r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion"),
    (r.ZodIntersection = "ZodIntersection"),
    (r.ZodTuple = "ZodTuple"),
    (r.ZodRecord = "ZodRecord"),
    (r.ZodMap = "ZodMap"),
    (r.ZodSet = "ZodSet"),
    (r.ZodFunction = "ZodFunction"),
    (r.ZodLazy = "ZodLazy"),
    (r.ZodLiteral = "ZodLiteral"),
    (r.ZodEnum = "ZodEnum"),
    (r.ZodEffects = "ZodEffects"),
    (r.ZodNativeEnum = "ZodNativeEnum"),
    (r.ZodOptional = "ZodOptional"),
    (r.ZodNullable = "ZodNullable"),
    (r.ZodDefault = "ZodDefault"),
    (r.ZodCatch = "ZodCatch"),
    (r.ZodPromise = "ZodPromise"),
    (r.ZodBranded = "ZodBranded"),
    (r.ZodPipeline = "ZodPipeline");
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const instanceOfType = (
    r,
    e = { message: `Input not instance of ${r.name}` }
  ) => custom((t) => t instanceof r, e, !0),
  stringType = ZodString.create,
  numberType = ZodNumber.create,
  nanType = ZodNaN.create,
  bigIntType = ZodBigInt.create,
  booleanType = ZodBoolean.create,
  dateType = ZodDate.create,
  symbolType = ZodSymbol.create,
  undefinedType = ZodUndefined.create,
  nullType = ZodNull.create,
  anyType = ZodAny.create,
  unknownType = ZodUnknown.create,
  neverType = ZodNever.create,
  voidType = ZodVoid.create,
  arrayType = ZodArray.create,
  objectType = ZodObject.create,
  strictObjectType = ZodObject.strictCreate,
  unionType = ZodUnion.create,
  discriminatedUnionType = ZodDiscriminatedUnion.create,
  intersectionType = ZodIntersection.create,
  tupleType = ZodTuple.create,
  recordType = ZodRecord.create,
  mapType = ZodMap.create,
  setType = ZodSet.create,
  functionType = ZodFunction.create,
  lazyType = ZodLazy.create,
  literalType = ZodLiteral.create,
  enumType = ZodEnum.create,
  nativeEnumType = ZodNativeEnum.create,
  promiseType = ZodPromise.create,
  effectsType = ZodEffects.create,
  optionalType = ZodOptional.create,
  nullableType = ZodNullable.create,
  preprocessType = ZodEffects.createWithPreprocess,
  pipelineType = ZodPipeline.create,
  ostring = () => stringType().optional(),
  onumber = () => numberType().optional(),
  oboolean = () => booleanType().optional(),
  coerce = {
    string: (r) => ZodString.create({ ...r, coerce: !0 }),
    number: (r) => ZodNumber.create({ ...r, coerce: !0 }),
    boolean: (r) => ZodBoolean.create({ ...r, coerce: !0 }),
    bigint: (r) => ZodBigInt.create({ ...r, coerce: !0 }),
    date: (r) => ZodDate.create({ ...r, coerce: !0 }),
  },
  NEVER = INVALID;
var mod = Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util$5;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  get objectUtil() {
    return objectUtil;
  },
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  enum: enumType,
  function: functionType,
  instanceof: instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  null: nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  undefined: undefinedType,
  union: unionType,
  unknown: unknownType,
  void: voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError,
});
const lib = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        BRAND,
        DIRTY,
        EMPTY_PATH,
        INVALID,
        NEVER,
        OK,
        ParseStatus,
        Schema: ZodType,
        ZodAny,
        ZodArray,
        ZodBigInt,
        ZodBoolean,
        ZodBranded,
        ZodCatch,
        ZodDate,
        ZodDefault,
        ZodDiscriminatedUnion,
        ZodEffects,
        ZodEnum,
        ZodError,
        get ZodFirstPartyTypeKind() {
          return ZodFirstPartyTypeKind;
        },
        ZodFunction,
        ZodIntersection,
        ZodIssueCode,
        ZodLazy,
        ZodLiteral,
        ZodMap,
        ZodNaN,
        ZodNativeEnum,
        ZodNever,
        ZodNull,
        ZodNullable,
        ZodNumber,
        ZodObject,
        ZodOptional,
        ZodParsedType,
        ZodPipeline,
        ZodPromise,
        ZodRecord,
        ZodSchema: ZodType,
        ZodSet,
        ZodString,
        ZodSymbol,
        ZodTransformer: ZodEffects,
        ZodTuple,
        ZodType,
        ZodUndefined,
        ZodUnion,
        ZodUnknown,
        ZodVoid,
        addIssueToContext,
        any: anyType,
        array: arrayType,
        bigint: bigIntType,
        boolean: booleanType,
        coerce,
        custom,
        date: dateType,
        default: mod,
        defaultErrorMap: errorMap,
        discriminatedUnion: discriminatedUnionType,
        effect: effectsType,
        enum: enumType,
        function: functionType,
        getErrorMap,
        getParsedType,
        instanceof: instanceOfType,
        intersection: intersectionType,
        isAborted,
        isAsync,
        isDirty,
        isValid,
        late,
        lazy: lazyType,
        literal: literalType,
        makeIssue,
        map: mapType,
        nan: nanType,
        nativeEnum: nativeEnumType,
        never: neverType,
        null: nullType,
        nullable: nullableType,
        number: numberType,
        object: objectType,
        get objectUtil() {
          return objectUtil;
        },
        oboolean,
        onumber,
        optional: optionalType,
        ostring,
        pipeline: pipelineType,
        preprocess: preprocessType,
        promise: promiseType,
        quotelessJson,
        record: recordType,
        set: setType,
        setErrorMap,
        strictObject: strictObjectType,
        string: stringType,
        symbol: symbolType,
        transformer: effectsType,
        tuple: tupleType,
        undefined: undefinedType,
        union: unionType,
        unknown: unknownType,
        get util() {
          return util$5;
        },
        void: voidType,
        z: mod,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  ),
  isChatEvent = mod.object({ message: mod.string(), author: mod.string() });
var ChatMessageTypes = ((r) => (
  (r[(r.text = 1)] = "text"),
  (r[(r.me = 2)] = "me"),
  (r[(r.userIncoming = 3)] = "userIncoming"),
  (r[(r.userOutcoming = 4)] = "userOutcoming"),
  (r[(r.userWriting = 5)] = "userWriting"),
  (r[(r.userStopWriting = 6)] = "userStopWriting"),
  r
))(ChatMessageTypes || {});
const isChatMessageTypes = mod.nativeEnum(ChatMessageTypes),
  isChatMessage = mod.object({
    type: isChatMessageTypes,
    date: mod.date(),
    author: mod.optional(mod.nullable(mod.any())),
    name: mod.optional(mod.nullable(mod.string())),
    targets: mod.optional(mod.nullable(mod.array(mod.nullable(mod.string())))),
    text: mod.optional(mod.nullable(mod.array(mod.nullable(mod.string())))),
  }),
  isClosePopupEvent = mod.object({ popupId: mod.number() }),
  isGoToPageEvent = mod.object({ url: mod.string() }),
  isLoadPageEvent = mod.object({ url: mod.string() }),
  isOpenCoWebsiteEvent = mod.object({
    url: mod.string(),
    allowApi: mod.boolean().optional(),
    allowPolicy: mod.optional(mod.string()),
    widthPercent: mod.optional(mod.number()),
    position: mod.optional(mod.number()),
    closable: mod.boolean().optional(),
    lazy: mod.boolean().optional(),
  }),
  isCoWebsite = mod.object({ id: mod.string() }),
  isButtonDescriptor = mod.object({
    label: mod.string(),
    className: mod.optional(mod.string()),
  }),
  isOpenPopupEvent = mod.object({
    popupId: mod.number(),
    targetObject: mod.string(),
    message: mod.string(),
    buttons: mod.array(isButtonDescriptor),
  }),
  isOpenTabEvent = mod.object({ url: mod.string() }),
  isLayerEvent = mod.object({ name: mod.string() }),
  isSetPropertyEvent = mod.object({
    layerName: mod.string(),
    propertyName: mod.string(),
    propertyValue: mod.optional(
      mod.union([mod.string(), mod.number(), mod.boolean()])
    ),
  }),
  isLoadSoundEvent = mod.object({ url: mod.string() }),
  isSoundConfig = mod.object({
    volume: mod.optional(mod.number()),
    loop: mod.boolean().optional(),
    mute: mod.boolean().optional(),
    rate: mod.optional(mod.number()),
    detune: mod.optional(mod.number()),
    seek: mod.optional(mod.number()),
    delay: mod.optional(mod.number()),
  }),
  isPlaySoundEvent = mod.object({
    url: mod.string(),
    config: mod.optional(isSoundConfig),
  }),
  isStopSoundEvent = mod.object({ url: mod.string() }),
  isSetTilesEvent = mod.array(
    mod.object({
      x: mod.number(),
      y: mod.number(),
      tile: mod.union([mod.number(), mod.string(), mod.null()]),
      layer: mod.string(),
    })
  ),
  isGameStateEvent = mod.object({
    roomId: mod.string(),
    mapUrl: mod.string(),
    nickname: mod.string(),
    language: mod.string().optional(),
    playerId: mod.number().optional(),
    uuid: mod.string().optional(),
    startLayerName: mod.string().optional(),
    tags: mod.string().array(),
    variables: mod.unknown(),
    playerVariables: mod.unknown(),
    userRoomToken: mod.string().optional(),
    metadata: mod.unknown().optional(),
    iframeId: mod.string().optional(),
    isLogged: mod.boolean().optional().default(!1),
  }),
  isMapDataEvent = mod.object({ data: mod.unknown() }),
  isSetVariableEvent = mod.object({ key: mod.string(), value: mod.unknown() });
mod.object({ type: mod.literal("setVariable"), data: isSetVariableEvent });
const isRectangle = mod.object({
    x: mod.number(),
    y: mod.number(),
    width: mod.number(),
    height: mod.number(),
  }),
  isEmbeddedWebsiteEvent = mod.object({
    name: mod.string(),
    url: mod.optional(mod.string()),
    visible: mod.boolean().optional(),
    allowApi: mod.boolean().optional(),
    allow: mod.optional(mod.string()),
    x: mod.optional(mod.number()),
    y: mod.optional(mod.number()),
    width: mod.optional(mod.number()),
    height: mod.optional(mod.number()),
    origin: mod.optional(mod.enum(["player", "map"])),
    scale: mod.optional(mod.number()),
  }),
  isCreateEmbeddedWebsiteEvent = mod.object({
    name: mod.string(),
    url: mod.string(),
    position: isRectangle,
    visible: mod.boolean().optional(),
    allowApi: mod.boolean().optional(),
    allow: mod.optional(mod.string()),
    origin: mod.optional(mod.enum(["player", "map"])),
    scale: mod.optional(mod.number()),
  }),
  isLoadTilesetEvent = mod.object({ url: mod.string() }),
  triggerActionMessage = "triggerActionMessage",
  removeActionMessage = "removeActionMessage",
  isActionMessageType = mod.enum(["message", "warning"]),
  isTriggerActionMessageEvent = mod.object({
    message: mod.string(),
    uuid: mod.string(),
    type: isActionMessageType,
  }),
  isMessageReferenceEvent = mod.object({ uuid: mod.string() }),
  isUnregisterMenuEvent = mod.object({ name: mod.string() }),
  isMenuRegisterOptions = mod.object({ allowApi: mod.boolean() }),
  isMenuRegisterEvent = mod.object({
    name: mod.string(),
    iframe: mod.optional(mod.string()),
    options: isMenuRegisterOptions,
  }),
  isPlayerPosition = mod.object({ x: mod.number(), y: mod.number() }),
  isCameraSetEvent = mod.object({
    x: mod.number(),
    y: mod.number(),
    width: mod.optional(mod.number()),
    height: mod.optional(mod.number()),
    lock: mod.boolean(),
    smooth: mod.boolean(),
  }),
  isCameraFollowPlayerEvent = mod.object({ smooth: mod.boolean() }),
  isColorEvent = mod.object({
    red: mod.number(),
    green: mod.number(),
    blue: mod.number(),
  }),
  isMovePlayerToEventConfig = mod.object({
    x: mod.number(),
    y: mod.number(),
    speed: mod.optional(mod.number()),
  }),
  isMovePlayerToEventAnswer = mod.object({
    x: mod.number(),
    y: mod.number(),
    cancelled: mod.boolean(),
  }),
  isAddActionsMenuKeyToRemotePlayerEvent = mod.object({
    id: mod.number(),
    actionKey: mod.string(),
  }),
  isRemoveActionsMenuKeyFromRemotePlayerEvent = mod.object({
    id: mod.number(),
    actionKey: mod.string(),
  }),
  isSetAreaPropertyEvent = mod.object({
    areaName: mod.string(),
    propertyName: mod.string(),
    propertyValue: mod.optional(
      mod.union([mod.string(), mod.number(), mod.boolean()])
    ),
  }),
  regexUnit = /-*\d+(px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem)|auto|inherit/,
  isUIWebsiteCSSValue = mod.string().regex(regexUnit),
  isUIWebsiteMargin = mod.object({
    top: isUIWebsiteCSSValue.optional(),
    bottom: isUIWebsiteCSSValue.optional(),
    left: isUIWebsiteCSSValue.optional(),
    right: isUIWebsiteCSSValue.optional(),
  }),
  isViewportPositionVertical = mod.enum(["top", "middle", "bottom"]),
  isViewportPositionHorizontal = mod.enum(["left", "middle", "right"]),
  isUIWebsitePosition = mod.object({
    vertical: isViewportPositionVertical,
    horizontal: isViewportPositionHorizontal,
  }),
  isUIWebsiteSize = mod.object({
    height: isUIWebsiteCSSValue,
    width: isUIWebsiteCSSValue,
  }),
  isCreateUIWebsiteEvent = mod.object({
    url: mod.string(),
    visible: mod.boolean().optional(),
    allowApi: mod.boolean().optional(),
    allowPolicy: mod.optional(mod.string()),
    position: isUIWebsitePosition,
    size: isUIWebsiteSize,
    margin: isUIWebsiteMargin.partial().optional(),
  }),
  isModifyUIWebsiteEvent = mod.object({
    id: mod.string(),
    url: mod.string().optional(),
    visible: mod.boolean().optional(),
    position: isUIWebsitePosition.optional(),
    size: isUIWebsiteSize.optional(),
    margin: isUIWebsiteMargin.partial().optional(),
  }),
  isUIWebsiteEvent = mod.object({
    id: mod.string(),
    url: mod.string(),
    visible: mod.boolean(),
    allowApi: mod.boolean(),
    allowPolicy: mod.string(),
    position: isUIWebsitePosition,
    size: isUIWebsiteSize,
    margin: isUIWebsiteMargin.partial().optional(),
  }),
  isAreaEvent = mod.object({
    name: mod.string(),
    x: mod.optional(mod.number()),
    y: mod.optional(mod.number()),
    width: mod.optional(mod.number()),
    height: mod.optional(mod.number()),
  }),
  isCreateAreaEvent = mod.object({
    name: mod.string(),
    x: mod.number(),
    y: mod.number(),
    width: mod.number(),
    height: mod.number(),
  }),
  isUserInputChatEvent = mod.object({ message: mod.string() }),
  isEnterLeaveEvent = mod.object({ name: mod.string() }),
  isChangeLayerEvent = mod.object({ name: mod.string() }),
  isChangeAreaEvent = mod.object({ name: mod.string() }),
  isButtonClickedEvent = mod.object({
    popupId: mod.number(),
    buttonId: mod.number(),
  }),
  isActionsMenuActionClickedEvent = mod.object({
    id: mod.number(),
    actionName: mod.string(),
  }),
  isHasPlayerMovedEvent = mod.object({
    direction: mod.enum(["right", "left", "up", "down"]),
    moving: mod.boolean(),
    x: mod.number(),
    y: mod.number(),
    oldX: mod.optional(mod.number()),
    oldY: mod.optional(mod.number()),
  }),
  isWasCameraUpdatedEvent = mod.object({
    x: mod.number(),
    y: mod.number(),
    width: mod.number(),
    height: mod.number(),
    zoom: mod.number(),
  }),
  isAskPositionEvent = mod.object({
    uuid: mod.string(),
    playUri: mod.string(),
  }),
  isLeaveMucEvent = mod.object({ url: mod.string() }),
  isJoinMucEvent = mod.object({
    url: mod.string(),
    name: mod.string(),
    type: mod.string(),
    subscribe: mod.boolean(),
  }),
  isMenuItemClickedEvent = mod.object({ menuItem: mod.string() }),
  isAddPlayerEvent = mod.object({
    playerId: mod.number(),
    name: mod.string(),
    userUuid: mod.string(),
    availabilityStatus: mod.string(),
    outlineColor: mod.number().optional(),
    position: isPlayerPosition,
    variables: mod.map(mod.string(), mod.unknown()),
  }),
  isRemotePlayerChangedEvent = isAddPlayerEvent
    .omit({ userUuid: !0 })
    .partial({
      name: !0,
      availabilityStatus: !0,
      outlineColor: !0,
      position: !0,
      variables: !0,
    }),
  isJoinProximityMeetingEvent = mod.object({ users: isAddPlayerEvent.array() }),
  isParticipantProximityMeetingEvent = mod.object({ user: isAddPlayerEvent }),
  isSetSharedPlayerVariableEvent = mod.object({
    key: mod.string(),
    value: mod.unknown(),
    playerId: mod.number(),
  }),
  isEnablePlayersTrackingEvent = mod.object({
    players: mod.boolean(),
    movement: mod.boolean(),
  }),
  isSetPlayerVariableEvent = mod.object({
    key: mod.string(),
    value: mod.unknown(),
    public: mod.boolean(),
    persist: mod.boolean(),
    ttl: mod.number().optional(),
    scope: mod.union([mod.literal("room"), mod.literal("world")]),
  }),
  isSettingsEvent = mod.object({
    notification: mod.boolean(),
    chatSounds: mod.boolean(),
    enableChat: mod.boolean(),
    enableChatUpload: mod.boolean(),
    enableChatOnlineList: mod.boolean(),
    enableChatDisconnectedList: mod.boolean(),
  }),
  isChatVisibilityEvent = mod.object({ visibility: mod.boolean() }),
  isNotificationEvent = mod.object({
    userName: mod.string(),
    notificationType: mod.number(),
    forum: mod.optional(mod.nullable(mod.string())),
  }),
  isShowBusinessCardEvent = mod.object({ visitCardUrl: mod.string() }),
  isModalEvent = mod.object({
    src: mod.string(),
    allow: mod.string().optional().nullable().default(null),
    title: mod.string().optional().default("WorkAdventure modal iframe"),
    position: mod.enum(["right", "left", "center"]).optional().default("right"),
    allowApi: mod.boolean().optional().default(!1),
  });
var commonjsGlobal =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
    ? window
    : typeof global < "u"
    ? global
    : typeof self < "u"
    ? self
    : {};
function getDefaultExportFromCjs(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default")
    ? r.default
    : r;
}
function getAugmentedNamespace(r) {
  var e = r.default;
  if (typeof e == "function") {
    var t = function () {
      return e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return (
    Object.defineProperty(t, "__esModule", { value: !0 }),
    Object.keys(r).forEach(function (o) {
      var n = Object.getOwnPropertyDescriptor(r, o);
      Object.defineProperty(
        t,
        o,
        n.get
          ? n
          : {
              enumerable: !0,
              get: function () {
                return r[o];
              },
            }
      );
    }),
    t
  );
}
var minimal$1 = { exports: {} },
  indexMinimal = {},
  minimal = {},
  aspromise = asPromise;
function asPromise(r, e) {
  for (
    var t = new Array(arguments.length - 1), o = 0, n = 2, i = !0;
    n < arguments.length;

  )
    t[o++] = arguments[n++];
  return new Promise(function (a, d) {
    t[o] = function (u) {
      if (i)
        if (((i = !1), u)) d(u);
        else {
          for (var p = new Array(arguments.length - 1), m = 0; m < p.length; )
            p[m++] = arguments[m];
          a.apply(null, p);
        }
    };
    try {
      r.apply(e || null, t);
    } catch (l) {
      i && ((i = !1), d(l));
    }
  });
}
var base64$1 = {};
(function (r) {
  var e = r;
  e.length = function (a) {
    var d = a.length;
    if (!d) return 0;
    for (var l = 0; --d % 4 > 1 && a.charAt(d) === "="; ) ++l;
    return Math.ceil(a.length * 3) / 4 - l;
  };
  for (var t = new Array(64), o = new Array(123), n = 0; n < 64; )
    o[
      (t[n] =
        n < 26 ? n + 65 : n < 52 ? n + 71 : n < 62 ? n - 4 : (n - 59) | 43)
    ] = n++;
  e.encode = function (a, d, l) {
    for (var u = null, p = [], m = 0, h = 0, f; d < l; ) {
      var y = a[d++];
      switch (h) {
        case 0:
          (p[m++] = t[y >> 2]), (f = (y & 3) << 4), (h = 1);
          break;
        case 1:
          (p[m++] = t[f | (y >> 4)]), (f = (y & 15) << 2), (h = 2);
          break;
        case 2:
          (p[m++] = t[f | (y >> 6)]), (p[m++] = t[y & 63]), (h = 0);
          break;
      }
      m > 8191 &&
        ((u || (u = [])).push(String.fromCharCode.apply(String, p)), (m = 0));
    }
    return (
      h && ((p[m++] = t[f]), (p[m++] = 61), h === 1 && (p[m++] = 61)),
      u
        ? (m && u.push(String.fromCharCode.apply(String, p.slice(0, m))),
          u.join(""))
        : String.fromCharCode.apply(String, p.slice(0, m))
    );
  };
  var i = "invalid encoding";
  (e.decode = function (a, d, l) {
    for (var u = l, p = 0, m, h = 0; h < a.length; ) {
      var f = a.charCodeAt(h++);
      if (f === 61 && p > 1) break;
      if ((f = o[f]) === void 0) throw Error(i);
      switch (p) {
        case 0:
          (m = f), (p = 1);
          break;
        case 1:
          (d[l++] = (m << 2) | ((f & 48) >> 4)), (m = f), (p = 2);
          break;
        case 2:
          (d[l++] = ((m & 15) << 4) | ((f & 60) >> 2)), (m = f), (p = 3);
          break;
        case 3:
          (d[l++] = ((m & 3) << 6) | f), (p = 0);
          break;
      }
    }
    if (p === 1) throw Error(i);
    return l - u;
  }),
    (e.test = function (a) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        a
      );
    });
})(base64$1);
var eventemitter = EventEmitter;
function EventEmitter() {
  this._listeners = {};
}
EventEmitter.prototype.on = function (e, t, o) {
  return (
    (this._listeners[e] || (this._listeners[e] = [])).push({
      fn: t,
      ctx: o || this,
    }),
    this
  );
};
EventEmitter.prototype.off = function (e, t) {
  if (e === void 0) this._listeners = {};
  else if (t === void 0) this._listeners[e] = [];
  else
    for (var o = this._listeners[e], n = 0; n < o.length; )
      o[n].fn === t ? o.splice(n, 1) : ++n;
  return this;
};
EventEmitter.prototype.emit = function (e) {
  var t = this._listeners[e];
  if (t) {
    for (var o = [], n = 1; n < arguments.length; ) o.push(arguments[n++]);
    for (n = 0; n < t.length; ) t[n].fn.apply(t[n++].ctx, o);
  }
  return this;
};
var float = factory(factory);
function factory(r) {
  return (
    typeof Float32Array < "u"
      ? (function () {
          var e = new Float32Array([-0]),
            t = new Uint8Array(e.buffer),
            o = t[3] === 128;
          function n(d, l, u) {
            (e[0] = d),
              (l[u] = t[0]),
              (l[u + 1] = t[1]),
              (l[u + 2] = t[2]),
              (l[u + 3] = t[3]);
          }
          function i(d, l, u) {
            (e[0] = d),
              (l[u] = t[3]),
              (l[u + 1] = t[2]),
              (l[u + 2] = t[1]),
              (l[u + 3] = t[0]);
          }
          (r.writeFloatLE = o ? n : i), (r.writeFloatBE = o ? i : n);
          function s(d, l) {
            return (
              (t[0] = d[l]),
              (t[1] = d[l + 1]),
              (t[2] = d[l + 2]),
              (t[3] = d[l + 3]),
              e[0]
            );
          }
          function a(d, l) {
            return (
              (t[3] = d[l]),
              (t[2] = d[l + 1]),
              (t[1] = d[l + 2]),
              (t[0] = d[l + 3]),
              e[0]
            );
          }
          (r.readFloatLE = o ? s : a), (r.readFloatBE = o ? a : s);
        })()
      : (function () {
          function e(o, n, i, s) {
            var a = n < 0 ? 1 : 0;
            if ((a && (n = -n), n === 0)) o(1 / n > 0 ? 0 : 2147483648, i, s);
            else if (isNaN(n)) o(2143289344, i, s);
            else if (n > 34028234663852886e22)
              o(((a << 31) | 2139095040) >>> 0, i, s);
            else if (n < 11754943508222875e-54)
              o(((a << 31) | Math.round(n / 1401298464324817e-60)) >>> 0, i, s);
            else {
              var d = Math.floor(Math.log(n) / Math.LN2),
                l = Math.round(n * Math.pow(2, -d) * 8388608) & 8388607;
              o(((a << 31) | ((d + 127) << 23) | l) >>> 0, i, s);
            }
          }
          (r.writeFloatLE = e.bind(null, writeUintLE)),
            (r.writeFloatBE = e.bind(null, writeUintBE));
          function t(o, n, i) {
            var s = o(n, i),
              a = (s >> 31) * 2 + 1,
              d = (s >>> 23) & 255,
              l = s & 8388607;
            return d === 255
              ? l
                ? NaN
                : a * (1 / 0)
              : d === 0
              ? a * 1401298464324817e-60 * l
              : a * Math.pow(2, d - 150) * (l + 8388608);
          }
          (r.readFloatLE = t.bind(null, readUintLE)),
            (r.readFloatBE = t.bind(null, readUintBE));
        })(),
    typeof Float64Array < "u"
      ? (function () {
          var e = new Float64Array([-0]),
            t = new Uint8Array(e.buffer),
            o = t[7] === 128;
          function n(d, l, u) {
            (e[0] = d),
              (l[u] = t[0]),
              (l[u + 1] = t[1]),
              (l[u + 2] = t[2]),
              (l[u + 3] = t[3]),
              (l[u + 4] = t[4]),
              (l[u + 5] = t[5]),
              (l[u + 6] = t[6]),
              (l[u + 7] = t[7]);
          }
          function i(d, l, u) {
            (e[0] = d),
              (l[u] = t[7]),
              (l[u + 1] = t[6]),
              (l[u + 2] = t[5]),
              (l[u + 3] = t[4]),
              (l[u + 4] = t[3]),
              (l[u + 5] = t[2]),
              (l[u + 6] = t[1]),
              (l[u + 7] = t[0]);
          }
          (r.writeDoubleLE = o ? n : i), (r.writeDoubleBE = o ? i : n);
          function s(d, l) {
            return (
              (t[0] = d[l]),
              (t[1] = d[l + 1]),
              (t[2] = d[l + 2]),
              (t[3] = d[l + 3]),
              (t[4] = d[l + 4]),
              (t[5] = d[l + 5]),
              (t[6] = d[l + 6]),
              (t[7] = d[l + 7]),
              e[0]
            );
          }
          function a(d, l) {
            return (
              (t[7] = d[l]),
              (t[6] = d[l + 1]),
              (t[5] = d[l + 2]),
              (t[4] = d[l + 3]),
              (t[3] = d[l + 4]),
              (t[2] = d[l + 5]),
              (t[1] = d[l + 6]),
              (t[0] = d[l + 7]),
              e[0]
            );
          }
          (r.readDoubleLE = o ? s : a), (r.readDoubleBE = o ? a : s);
        })()
      : (function () {
          function e(o, n, i, s, a, d) {
            var l = s < 0 ? 1 : 0;
            if ((l && (s = -s), s === 0))
              o(0, a, d + n), o(1 / s > 0 ? 0 : 2147483648, a, d + i);
            else if (isNaN(s)) o(0, a, d + n), o(2146959360, a, d + i);
            else if (s > 17976931348623157e292)
              o(0, a, d + n), o(((l << 31) | 2146435072) >>> 0, a, d + i);
            else {
              var u;
              if (s < 22250738585072014e-324)
                (u = s / 5e-324),
                  o(u >>> 0, a, d + n),
                  o(((l << 31) | (u / 4294967296)) >>> 0, a, d + i);
              else {
                var p = Math.floor(Math.log(s) / Math.LN2);
                p === 1024 && (p = 1023),
                  (u = s * Math.pow(2, -p)),
                  o((u * 4503599627370496) >>> 0, a, d + n),
                  o(
                    ((l << 31) |
                      ((p + 1023) << 20) |
                      ((u * 1048576) & 1048575)) >>>
                      0,
                    a,
                    d + i
                  );
              }
            }
          }
          (r.writeDoubleLE = e.bind(null, writeUintLE, 0, 4)),
            (r.writeDoubleBE = e.bind(null, writeUintBE, 4, 0));
          function t(o, n, i, s, a) {
            var d = o(s, a + n),
              l = o(s, a + i),
              u = (l >> 31) * 2 + 1,
              p = (l >>> 20) & 2047,
              m = 4294967296 * (l & 1048575) + d;
            return p === 2047
              ? m
                ? NaN
                : u * (1 / 0)
              : p === 0
              ? u * 5e-324 * m
              : u * Math.pow(2, p - 1075) * (m + 4503599627370496);
          }
          (r.readDoubleLE = t.bind(null, readUintLE, 0, 4)),
            (r.readDoubleBE = t.bind(null, readUintBE, 4, 0));
        })(),
    r
  );
}
function writeUintLE(r, e, t) {
  (e[t] = r & 255),
    (e[t + 1] = (r >>> 8) & 255),
    (e[t + 2] = (r >>> 16) & 255),
    (e[t + 3] = r >>> 24);
}
function writeUintBE(r, e, t) {
  (e[t] = r >>> 24),
    (e[t + 1] = (r >>> 16) & 255),
    (e[t + 2] = (r >>> 8) & 255),
    (e[t + 3] = r & 255);
}
function readUintLE(r, e) {
  return (r[e] | (r[e + 1] << 8) | (r[e + 2] << 16) | (r[e + 3] << 24)) >>> 0;
}
function readUintBE(r, e) {
  return ((r[e] << 24) | (r[e + 1] << 16) | (r[e + 2] << 8) | r[e + 3]) >>> 0;
}
var inquire_1 = inquire;
function inquire(moduleName) {
  try {
    var mod = eval("quire".replace(/^/, "re"))(moduleName);
    if (mod && (mod.length || Object.keys(mod).length)) return mod;
  } catch (r) {}
  return null;
}
var utf8$2 = {};
(function (r) {
  var e = r;
  (e.length = function (o) {
    for (var n = 0, i = 0, s = 0; s < o.length; ++s)
      (i = o.charCodeAt(s)),
        i < 128
          ? (n += 1)
          : i < 2048
          ? (n += 2)
          : (i & 64512) === 55296 && (o.charCodeAt(s + 1) & 64512) === 56320
          ? (++s, (n += 4))
          : (n += 3);
    return n;
  }),
    (e.read = function (o, n, i) {
      var s = i - n;
      if (s < 1) return "";
      for (var a = null, d = [], l = 0, u; n < i; )
        (u = o[n++]),
          u < 128
            ? (d[l++] = u)
            : u > 191 && u < 224
            ? (d[l++] = ((u & 31) << 6) | (o[n++] & 63))
            : u > 239 && u < 365
            ? ((u =
                (((u & 7) << 18) |
                  ((o[n++] & 63) << 12) |
                  ((o[n++] & 63) << 6) |
                  (o[n++] & 63)) -
                65536),
              (d[l++] = 55296 + (u >> 10)),
              (d[l++] = 56320 + (u & 1023)))
            : (d[l++] =
                ((u & 15) << 12) | ((o[n++] & 63) << 6) | (o[n++] & 63)),
          l > 8191 &&
            ((a || (a = [])).push(String.fromCharCode.apply(String, d)),
            (l = 0));
      return a
        ? (l && a.push(String.fromCharCode.apply(String, d.slice(0, l))),
          a.join(""))
        : String.fromCharCode.apply(String, d.slice(0, l));
    }),
    (e.write = function (o, n, i) {
      for (var s = i, a, d, l = 0; l < o.length; ++l)
        (a = o.charCodeAt(l)),
          a < 128
            ? (n[i++] = a)
            : a < 2048
            ? ((n[i++] = (a >> 6) | 192), (n[i++] = (a & 63) | 128))
            : (a & 64512) === 55296 &&
              ((d = o.charCodeAt(l + 1)) & 64512) === 56320
            ? ((a = 65536 + ((a & 1023) << 10) + (d & 1023)),
              ++l,
              (n[i++] = (a >> 18) | 240),
              (n[i++] = ((a >> 12) & 63) | 128),
              (n[i++] = ((a >> 6) & 63) | 128),
              (n[i++] = (a & 63) | 128))
            : ((n[i++] = (a >> 12) | 224),
              (n[i++] = ((a >> 6) & 63) | 128),
              (n[i++] = (a & 63) | 128));
      return i - s;
    });
})(utf8$2);
var pool_1 = pool;
function pool(r, e, t) {
  var o = t || 8192,
    n = o >>> 1,
    i = null,
    s = o;
  return function (d) {
    if (d < 1 || d > n) return r(d);
    s + d > o && ((i = r(o)), (s = 0));
    var l = e.call(i, s, (s += d));
    return s & 7 && (s = (s | 7) + 1), l;
  };
}
var longbits, hasRequiredLongbits;
function requireLongbits() {
  if (hasRequiredLongbits) return longbits;
  (hasRequiredLongbits = 1), (longbits = e);
  var r = requireMinimal();
  function e(i, s) {
    (this.lo = i >>> 0), (this.hi = s >>> 0);
  }
  var t = (e.zero = new e(0, 0));
  (t.toNumber = function () {
    return 0;
  }),
    (t.zzEncode = t.zzDecode =
      function () {
        return this;
      }),
    (t.length = function () {
      return 1;
    });
  var o = (e.zeroHash = "\0\0\0\0\0\0\0\0");
  (e.fromNumber = function (s) {
    if (s === 0) return t;
    var a = s < 0;
    a && (s = -s);
    var d = s >>> 0,
      l = ((s - d) / 4294967296) >>> 0;
    return (
      a &&
        ((l = ~l >>> 0),
        (d = ~d >>> 0),
        ++d > 4294967295 && ((d = 0), ++l > 4294967295 && (l = 0))),
      new e(d, l)
    );
  }),
    (e.from = function (s) {
      if (typeof s == "number") return e.fromNumber(s);
      if (r.isString(s))
        if (r.Long) s = r.Long.fromString(s);
        else return e.fromNumber(parseInt(s, 10));
      return s.low || s.high ? new e(s.low >>> 0, s.high >>> 0) : t;
    }),
    (e.prototype.toNumber = function (s) {
      if (!s && this.hi >>> 31) {
        var a = (~this.lo + 1) >>> 0,
          d = ~this.hi >>> 0;
        return a || (d = (d + 1) >>> 0), -(a + d * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    }),
    (e.prototype.toLong = function (s) {
      return r.Long
        ? new r.Long(this.lo | 0, this.hi | 0, Boolean(s))
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(s) };
    });
  var n = String.prototype.charCodeAt;
  return (
    (e.fromHash = function (s) {
      return s === o
        ? t
        : new e(
            (n.call(s, 0) |
              (n.call(s, 1) << 8) |
              (n.call(s, 2) << 16) |
              (n.call(s, 3) << 24)) >>>
              0,
            (n.call(s, 4) |
              (n.call(s, 5) << 8) |
              (n.call(s, 6) << 16) |
              (n.call(s, 7) << 24)) >>>
              0
          );
    }),
    (e.prototype.toHash = function () {
      return String.fromCharCode(
        this.lo & 255,
        (this.lo >>> 8) & 255,
        (this.lo >>> 16) & 255,
        this.lo >>> 24,
        this.hi & 255,
        (this.hi >>> 8) & 255,
        (this.hi >>> 16) & 255,
        this.hi >>> 24
      );
    }),
    (e.prototype.zzEncode = function () {
      var s = this.hi >> 31;
      return (
        (this.hi = (((this.hi << 1) | (this.lo >>> 31)) ^ s) >>> 0),
        (this.lo = ((this.lo << 1) ^ s) >>> 0),
        this
      );
    }),
    (e.prototype.zzDecode = function () {
      var s = -(this.lo & 1);
      return (
        (this.lo = (((this.lo >>> 1) | (this.hi << 31)) ^ s) >>> 0),
        (this.hi = ((this.hi >>> 1) ^ s) >>> 0),
        this
      );
    }),
    (e.prototype.length = function () {
      var s = this.lo,
        a = ((this.lo >>> 28) | (this.hi << 4)) >>> 0,
        d = this.hi >>> 24;
      return d === 0
        ? a === 0
          ? s < 16384
            ? s < 128
              ? 1
              : 2
            : s < 2097152
            ? 3
            : 4
          : a < 16384
          ? a < 128
            ? 5
            : 6
          : a < 2097152
          ? 7
          : 8
        : d < 128
        ? 9
        : 10;
    }),
    longbits
  );
}
var hasRequiredMinimal;
function requireMinimal() {
  return (
    hasRequiredMinimal ||
      ((hasRequiredMinimal = 1),
      (function (r) {
        var e = r;
        (e.asPromise = aspromise),
          (e.base64 = base64$1),
          (e.EventEmitter = eventemitter),
          (e.float = float),
          (e.inquire = inquire_1),
          (e.utf8 = utf8$2),
          (e.pool = pool_1),
          (e.LongBits = requireLongbits()),
          (e.isNode = Boolean(
            typeof commonjsGlobal < "u" &&
              commonjsGlobal &&
              commonjsGlobal.process &&
              commonjsGlobal.process.versions &&
              commonjsGlobal.process.versions.node
          )),
          (e.global =
            (e.isNode && commonjsGlobal) ||
            (typeof window < "u" && window) ||
            (typeof self < "u" && self) ||
            commonjsGlobal),
          (e.emptyArray = Object.freeze ? Object.freeze([]) : []),
          (e.emptyObject = Object.freeze ? Object.freeze({}) : {}),
          (e.isInteger =
            Number.isInteger ||
            function (i) {
              return typeof i == "number" && isFinite(i) && Math.floor(i) === i;
            }),
          (e.isString = function (i) {
            return typeof i == "string" || i instanceof String;
          }),
          (e.isObject = function (i) {
            return i && typeof i == "object";
          }),
          (e.isset = e.isSet =
            function (i, s) {
              var a = i[s];
              return a != null && i.hasOwnProperty(s)
                ? typeof a != "object" ||
                    (Array.isArray(a) ? a.length : Object.keys(a).length) > 0
                : !1;
            }),
          (e.Buffer = (function () {
            try {
              var n = e.inquire("buffer").Buffer;
              return n.prototype.utf8Write ? n : null;
            } catch {
              return null;
            }
          })()),
          (e._Buffer_from = null),
          (e._Buffer_allocUnsafe = null),
          (e.newBuffer = function (i) {
            return typeof i == "number"
              ? e.Buffer
                ? e._Buffer_allocUnsafe(i)
                : new e.Array(i)
              : e.Buffer
              ? e._Buffer_from(i)
              : typeof Uint8Array > "u"
              ? i
              : new Uint8Array(i);
          }),
          (e.Array = typeof Uint8Array < "u" ? Uint8Array : Array),
          (e.Long =
            (e.global.dcodeIO && e.global.dcodeIO.Long) ||
            e.global.Long ||
            e.inquire("long")),
          (e.key2Re = /^true|false|0|1$/),
          (e.key32Re = /^-?(?:0|[1-9][0-9]*)$/),
          (e.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/),
          (e.longToHash = function (i) {
            return i ? e.LongBits.from(i).toHash() : e.LongBits.zeroHash;
          }),
          (e.longFromHash = function (i, s) {
            var a = e.LongBits.fromHash(i);
            return e.Long
              ? e.Long.fromBits(a.lo, a.hi, s)
              : a.toNumber(Boolean(s));
          });
        function t(n, i, s) {
          for (var a = Object.keys(i), d = 0; d < a.length; ++d)
            (n[a[d]] === void 0 || !s) && (n[a[d]] = i[a[d]]);
          return n;
        }
        (e.merge = t),
          (e.lcFirst = function (i) {
            return i.charAt(0).toLowerCase() + i.substring(1);
          });
        function o(n) {
          function i(s, a) {
            if (!(this instanceof i)) return new i(s, a);
            Object.defineProperty(this, "message", {
              get: function () {
                return s;
              },
            }),
              Error.captureStackTrace
                ? Error.captureStackTrace(this, i)
                : Object.defineProperty(this, "stack", {
                    value: new Error().stack || "",
                  }),
              a && t(this, a);
          }
          return (
            (i.prototype = Object.create(Error.prototype, {
              constructor: {
                value: i,
                writable: !0,
                enumerable: !1,
                configurable: !0,
              },
              name: {
                get() {
                  return n;
                },
                set: void 0,
                enumerable: !1,
                configurable: !0,
              },
              toString: {
                value() {
                  return this.name + ": " + this.message;
                },
                writable: !0,
                enumerable: !1,
                configurable: !0,
              },
            })),
            i
          );
        }
        (e.newError = o),
          (e.ProtocolError = o("ProtocolError")),
          (e.oneOfGetter = function (i) {
            for (var s = {}, a = 0; a < i.length; ++a) s[i[a]] = 1;
            return function () {
              for (var d = Object.keys(this), l = d.length - 1; l > -1; --l)
                if (
                  s[d[l]] === 1 &&
                  this[d[l]] !== void 0 &&
                  this[d[l]] !== null
                )
                  return d[l];
            };
          }),
          (e.oneOfSetter = function (i) {
            return function (s) {
              for (var a = 0; a < i.length; ++a)
                i[a] !== s && delete this[i[a]];
            };
          }),
          (e.toJSONOptions = {
            longs: String,
            enums: String,
            bytes: String,
            json: !0,
          }),
          (e._configure = function () {
            var n = e.Buffer;
            if (!n) {
              e._Buffer_from = e._Buffer_allocUnsafe = null;
              return;
            }
            (e._Buffer_from =
              (n.from !== Uint8Array.from && n.from) ||
              function (s, a) {
                return new n(s, a);
              }),
              (e._Buffer_allocUnsafe =
                n.allocUnsafe ||
                function (s) {
                  return new n(s);
                });
          });
      })(minimal)),
    minimal
  );
}
var writer = Writer$1,
  util$4 = requireMinimal(),
  BufferWriter$1,
  LongBits$1 = util$4.LongBits,
  base64 = util$4.base64,
  utf8$1 = util$4.utf8;
function Op(r, e, t) {
  (this.fn = r), (this.len = e), (this.next = void 0), (this.val = t);
}
function noop() {}
function State(r) {
  (this.head = r.head),
    (this.tail = r.tail),
    (this.len = r.len),
    (this.next = r.states);
}
function Writer$1() {
  (this.len = 0),
    (this.head = new Op(noop, 0, 0)),
    (this.tail = this.head),
    (this.states = null);
}
var create$1 = function r() {
  return util$4.Buffer
    ? function () {
        return (Writer$1.create = function () {
          return new BufferWriter$1();
        })();
      }
    : function () {
        return new Writer$1();
      };
};
Writer$1.create = create$1();
Writer$1.alloc = function r(e) {
  return new util$4.Array(e);
};
util$4.Array !== Array &&
  (Writer$1.alloc = util$4.pool(
    Writer$1.alloc,
    util$4.Array.prototype.subarray
  ));
Writer$1.prototype._push = function r(e, t, o) {
  return (this.tail = this.tail.next = new Op(e, t, o)), (this.len += t), this;
};
function writeByte(r, e, t) {
  e[t] = r & 255;
}
function writeVarint32(r, e, t) {
  for (; r > 127; ) (e[t++] = (r & 127) | 128), (r >>>= 7);
  e[t] = r;
}
function VarintOp(r, e) {
  (this.len = r), (this.next = void 0), (this.val = e);
}
VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;
Writer$1.prototype.uint32 = function r(e) {
  return (
    (this.len += (this.tail = this.tail.next =
      new VarintOp(
        (e = e >>> 0) < 128
          ? 1
          : e < 16384
          ? 2
          : e < 2097152
          ? 3
          : e < 268435456
          ? 4
          : 5,
        e
      )).len),
    this
  );
};
Writer$1.prototype.int32 = function r(e) {
  return e < 0
    ? this._push(writeVarint64, 10, LongBits$1.fromNumber(e))
    : this.uint32(e);
};
Writer$1.prototype.sint32 = function r(e) {
  return this.uint32(((e << 1) ^ (e >> 31)) >>> 0);
};
function writeVarint64(r, e, t) {
  for (; r.hi; )
    (e[t++] = (r.lo & 127) | 128),
      (r.lo = ((r.lo >>> 7) | (r.hi << 25)) >>> 0),
      (r.hi >>>= 7);
  for (; r.lo > 127; ) (e[t++] = (r.lo & 127) | 128), (r.lo = r.lo >>> 7);
  e[t++] = r.lo;
}
Writer$1.prototype.uint64 = function r(e) {
  var t = LongBits$1.from(e);
  return this._push(writeVarint64, t.length(), t);
};
Writer$1.prototype.int64 = Writer$1.prototype.uint64;
Writer$1.prototype.sint64 = function r(e) {
  var t = LongBits$1.from(e).zzEncode();
  return this._push(writeVarint64, t.length(), t);
};
Writer$1.prototype.bool = function r(e) {
  return this._push(writeByte, 1, e ? 1 : 0);
};
function writeFixed32(r, e, t) {
  (e[t] = r & 255),
    (e[t + 1] = (r >>> 8) & 255),
    (e[t + 2] = (r >>> 16) & 255),
    (e[t + 3] = r >>> 24);
}
Writer$1.prototype.fixed32 = function r(e) {
  return this._push(writeFixed32, 4, e >>> 0);
};
Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;
Writer$1.prototype.fixed64 = function r(e) {
  var t = LongBits$1.from(e);
  return this._push(writeFixed32, 4, t.lo)._push(writeFixed32, 4, t.hi);
};
Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;
Writer$1.prototype.float = function r(e) {
  return this._push(util$4.float.writeFloatLE, 4, e);
};
Writer$1.prototype.double = function r(e) {
  return this._push(util$4.float.writeDoubleLE, 8, e);
};
var writeBytes = util$4.Array.prototype.set
  ? function r(e, t, o) {
      t.set(e, o);
    }
  : function r(e, t, o) {
      for (var n = 0; n < e.length; ++n) t[o + n] = e[n];
    };
Writer$1.prototype.bytes = function r(e) {
  var t = e.length >>> 0;
  if (!t) return this._push(writeByte, 1, 0);
  if (util$4.isString(e)) {
    var o = Writer$1.alloc((t = base64.length(e)));
    base64.decode(e, o, 0), (e = o);
  }
  return this.uint32(t)._push(writeBytes, t, e);
};
Writer$1.prototype.string = function r(e) {
  var t = utf8$1.length(e);
  return t
    ? this.uint32(t)._push(utf8$1.write, t, e)
    : this._push(writeByte, 1, 0);
};
Writer$1.prototype.fork = function r() {
  return (
    (this.states = new State(this)),
    (this.head = this.tail = new Op(noop, 0, 0)),
    (this.len = 0),
    this
  );
};
Writer$1.prototype.reset = function r() {
  return (
    this.states
      ? ((this.head = this.states.head),
        (this.tail = this.states.tail),
        (this.len = this.states.len),
        (this.states = this.states.next))
      : ((this.head = this.tail = new Op(noop, 0, 0)), (this.len = 0)),
    this
  );
};
Writer$1.prototype.ldelim = function r() {
  var e = this.head,
    t = this.tail,
    o = this.len;
  return (
    this.reset().uint32(o),
    o && ((this.tail.next = e.next), (this.tail = t), (this.len += o)),
    this
  );
};
Writer$1.prototype.finish = function r() {
  for (var e = this.head.next, t = this.constructor.alloc(this.len), o = 0; e; )
    e.fn(e.val, t, o), (o += e.len), (e = e.next);
  return t;
};
Writer$1._configure = function (r) {
  (BufferWriter$1 = r),
    (Writer$1.create = create$1()),
    BufferWriter$1._configure();
};
var writer_buffer = BufferWriter,
  Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor =
  BufferWriter;
var util$3 = requireMinimal();
function BufferWriter() {
  Writer.call(this);
}
BufferWriter._configure = function () {
  (BufferWriter.alloc = util$3._Buffer_allocUnsafe),
    (BufferWriter.writeBytesBuffer =
      util$3.Buffer &&
      util$3.Buffer.prototype instanceof Uint8Array &&
      util$3.Buffer.prototype.set.name === "set"
        ? function (e, t, o) {
            t.set(e, o);
          }
        : function (e, t, o) {
            if (e.copy) e.copy(t, o, 0, e.length);
            else for (var n = 0; n < e.length; ) t[o++] = e[n++];
          });
};
BufferWriter.prototype.bytes = function r(e) {
  util$3.isString(e) && (e = util$3._Buffer_from(e, "base64"));
  var t = e.length >>> 0;
  return (
    this.uint32(t), t && this._push(BufferWriter.writeBytesBuffer, t, e), this
  );
};
function writeStringBuffer(r, e, t) {
  r.length < 40
    ? util$3.utf8.write(r, e, t)
    : e.utf8Write
    ? e.utf8Write(r, t)
    : e.write(r, t);
}
BufferWriter.prototype.string = function r(e) {
  var t = util$3.Buffer.byteLength(e);
  return this.uint32(t), t && this._push(writeStringBuffer, t, e), this;
};
BufferWriter._configure();
var reader = Reader$1,
  util$2 = requireMinimal(),
  BufferReader$1,
  LongBits = util$2.LongBits,
  utf8 = util$2.utf8;
function indexOutOfRange(r, e) {
  return RangeError(
    "index out of range: " + r.pos + " + " + (e || 1) + " > " + r.len
  );
}
function Reader$1(r) {
  (this.buf = r), (this.pos = 0), (this.len = r.length);
}
var create_array =
    typeof Uint8Array < "u"
      ? function r(e) {
          if (e instanceof Uint8Array || Array.isArray(e))
            return new Reader$1(e);
          throw Error("illegal buffer");
        }
      : function r(e) {
          if (Array.isArray(e)) return new Reader$1(e);
          throw Error("illegal buffer");
        },
  create = function r() {
    return util$2.Buffer
      ? function (t) {
          return (Reader$1.create = function (n) {
            return util$2.Buffer.isBuffer(n)
              ? new BufferReader$1(n)
              : create_array(n);
          })(t);
        }
      : create_array;
  };
Reader$1.create = create();
Reader$1.prototype._slice =
  util$2.Array.prototype.subarray || util$2.Array.prototype.slice;
Reader$1.prototype.uint32 = (function r() {
  var e = 4294967295;
  return function () {
    if (
      ((e = (this.buf[this.pos] & 127) >>> 0),
      this.buf[this.pos++] < 128 ||
        ((e = (e | ((this.buf[this.pos] & 127) << 7)) >>> 0),
        this.buf[this.pos++] < 128) ||
        ((e = (e | ((this.buf[this.pos] & 127) << 14)) >>> 0),
        this.buf[this.pos++] < 128) ||
        ((e = (e | ((this.buf[this.pos] & 127) << 21)) >>> 0),
        this.buf[this.pos++] < 128) ||
        ((e = (e | ((this.buf[this.pos] & 15) << 28)) >>> 0),
        this.buf[this.pos++] < 128))
    )
      return e;
    if ((this.pos += 5) > this.len)
      throw ((this.pos = this.len), indexOutOfRange(this, 10));
    return e;
  };
})();
Reader$1.prototype.int32 = function r() {
  return this.uint32() | 0;
};
Reader$1.prototype.sint32 = function r() {
  var e = this.uint32();
  return ((e >>> 1) ^ -(e & 1)) | 0;
};
function readLongVarint() {
  var r = new LongBits(0, 0),
    e = 0;
  if (this.len - this.pos > 4) {
    for (; e < 4; ++e)
      if (
        ((r.lo = (r.lo | ((this.buf[this.pos] & 127) << (e * 7))) >>> 0),
        this.buf[this.pos++] < 128)
      )
        return r;
    if (
      ((r.lo = (r.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0),
      (r.hi = (r.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0),
      this.buf[this.pos++] < 128)
    )
      return r;
    e = 0;
  } else {
    for (; e < 3; ++e) {
      if (this.pos >= this.len) throw indexOutOfRange(this);
      if (
        ((r.lo = (r.lo | ((this.buf[this.pos] & 127) << (e * 7))) >>> 0),
        this.buf[this.pos++] < 128)
      )
        return r;
    }
    return (r.lo = (r.lo | ((this.buf[this.pos++] & 127) << (e * 7))) >>> 0), r;
  }
  if (this.len - this.pos > 4) {
    for (; e < 5; ++e)
      if (
        ((r.hi = (r.hi | ((this.buf[this.pos] & 127) << (e * 7 + 3))) >>> 0),
        this.buf[this.pos++] < 128)
      )
        return r;
  } else
    for (; e < 5; ++e) {
      if (this.pos >= this.len) throw indexOutOfRange(this);
      if (
        ((r.hi = (r.hi | ((this.buf[this.pos] & 127) << (e * 7 + 3))) >>> 0),
        this.buf[this.pos++] < 128)
      )
        return r;
    }
  throw Error("invalid varint encoding");
}
Reader$1.prototype.bool = function r() {
  return this.uint32() !== 0;
};
function readFixed32_end(r, e) {
  return (
    (r[e - 4] | (r[e - 3] << 8) | (r[e - 2] << 16) | (r[e - 1] << 24)) >>> 0
  );
}
Reader$1.prototype.fixed32 = function r() {
  if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
  return readFixed32_end(this.buf, (this.pos += 4));
};
Reader$1.prototype.sfixed32 = function r() {
  if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
  return readFixed32_end(this.buf, (this.pos += 4)) | 0;
};
function readFixed64() {
  if (this.pos + 8 > this.len) throw indexOutOfRange(this, 8);
  return new LongBits(
    readFixed32_end(this.buf, (this.pos += 4)),
    readFixed32_end(this.buf, (this.pos += 4))
  );
}
Reader$1.prototype.float = function r() {
  if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
  var e = util$2.float.readFloatLE(this.buf, this.pos);
  return (this.pos += 4), e;
};
Reader$1.prototype.double = function r() {
  if (this.pos + 8 > this.len) throw indexOutOfRange(this, 4);
  var e = util$2.float.readDoubleLE(this.buf, this.pos);
  return (this.pos += 8), e;
};
Reader$1.prototype.bytes = function r() {
  var e = this.uint32(),
    t = this.pos,
    o = this.pos + e;
  if (o > this.len) throw indexOutOfRange(this, e);
  return (
    (this.pos += e),
    Array.isArray(this.buf)
      ? this.buf.slice(t, o)
      : t === o
      ? new this.buf.constructor(0)
      : this._slice.call(this.buf, t, o)
  );
};
Reader$1.prototype.string = function r() {
  var e = this.bytes();
  return utf8.read(e, 0, e.length);
};
Reader$1.prototype.skip = function r(e) {
  if (typeof e == "number") {
    if (this.pos + e > this.len) throw indexOutOfRange(this, e);
    this.pos += e;
  } else
    do if (this.pos >= this.len) throw indexOutOfRange(this);
    while (this.buf[this.pos++] & 128);
  return this;
};
Reader$1.prototype.skipType = function (r) {
  switch (r) {
    case 0:
      this.skip();
      break;
    case 1:
      this.skip(8);
      break;
    case 2:
      this.skip(this.uint32());
      break;
    case 3:
      for (; (r = this.uint32() & 7) !== 4; ) this.skipType(r);
      break;
    case 5:
      this.skip(4);
      break;
    default:
      throw Error("invalid wire type " + r + " at offset " + this.pos);
  }
  return this;
};
Reader$1._configure = function (r) {
  (BufferReader$1 = r),
    (Reader$1.create = create()),
    BufferReader$1._configure();
  var e = util$2.Long ? "toLong" : "toNumber";
  util$2.merge(Reader$1.prototype, {
    int64: function () {
      return readLongVarint.call(this)[e](!1);
    },
    uint64: function () {
      return readLongVarint.call(this)[e](!0);
    },
    sint64: function () {
      return readLongVarint.call(this).zzDecode()[e](!1);
    },
    fixed64: function () {
      return readFixed64.call(this)[e](!0);
    },
    sfixed64: function () {
      return readFixed64.call(this)[e](!1);
    },
  });
};
var reader_buffer = BufferReader,
  Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor =
  BufferReader;
var util$1 = requireMinimal();
function BufferReader(r) {
  Reader.call(this, r);
}
BufferReader._configure = function () {
  util$1.Buffer &&
    (BufferReader.prototype._slice = util$1.Buffer.prototype.slice);
};
BufferReader.prototype.string = function r() {
  var e = this.uint32();
  return this.buf.utf8Slice
    ? this.buf.utf8Slice(
        this.pos,
        (this.pos = Math.min(this.pos + e, this.len))
      )
    : this.buf.toString(
        "utf-8",
        this.pos,
        (this.pos = Math.min(this.pos + e, this.len))
      );
};
BufferReader._configure();
var rpc = {},
  service = Service,
  util = requireMinimal();
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor =
  Service;
function Service(r, e, t) {
  if (typeof r != "function") throw TypeError("rpcImpl must be a function");
  util.EventEmitter.call(this),
    (this.rpcImpl = r),
    (this.requestDelimited = Boolean(e)),
    (this.responseDelimited = Boolean(t));
}
Service.prototype.rpcCall = function r(e, t, o, n, i) {
  if (!n) throw TypeError("request must be specified");
  var s = this;
  if (!i) return util.asPromise(r, s, e, t, o, n);
  if (!s.rpcImpl) {
    setTimeout(function () {
      i(Error("already ended"));
    }, 0);
    return;
  }
  try {
    return s.rpcImpl(
      e,
      t[s.requestDelimited ? "encodeDelimited" : "encode"](n).finish(),
      function (d, l) {
        if (d) return s.emit("error", d, e), i(d);
        if (l === null) {
          s.end(!0);
          return;
        }
        if (!(l instanceof o))
          try {
            l = o[s.responseDelimited ? "decodeDelimited" : "decode"](l);
          } catch (u) {
            return s.emit("error", u, e), i(u);
          }
        return s.emit("data", l, e), i(null, l);
      }
    );
  } catch (a) {
    s.emit("error", a, e),
      setTimeout(function () {
        i(a);
      }, 0);
    return;
  }
};
Service.prototype.end = function r(e) {
  return (
    this.rpcImpl &&
      (e || this.rpcImpl(null, null, null),
      (this.rpcImpl = null),
      this.emit("end").off()),
    this
  );
};
(function (r) {
  var e = r;
  e.Service = service;
})(rpc);
var roots = {};
(function (r) {
  var e = r;
  (e.build = "minimal"),
    (e.Writer = writer),
    (e.BufferWriter = writer_buffer),
    (e.Reader = reader),
    (e.BufferReader = reader_buffer),
    (e.util = requireMinimal()),
    (e.rpc = rpc),
    (e.roots = roots),
    (e.configure = t);
  function t() {
    e.util._configure(),
      e.Writer._configure(e.BufferWriter),
      e.Reader._configure(e.BufferReader);
  }
  t();
})(indexMinimal);
(function (r) {
  r.exports = indexMinimal;
})(minimal$1);
const _m0 = getDefaultExportFromCjs(minimal$1.exports);
/**
 * @license
 * Copyright 2009 The Closure Library Authors
 * Copyright 2020 Daniel Wirtz / The long.js Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */ var wasm = null;
try {
  wasm = new WebAssembly.Instance(
    new WebAssembly.Module(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127,
        127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11,
        7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5,
        100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114,
        101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0,
        10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173,
        66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4,
        66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32,
        1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127,
        34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0,
        173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134,
        132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126,
        32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66,
        32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36,
        1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3,
        173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167,
        11,
      ])
    ),
    {}
  ).exports;
} catch (r) {}
function Long(r, e, t) {
  (this.low = r | 0), (this.high = e | 0), (this.unsigned = !!t);
}
Long.prototype.__isLong__;
Object.defineProperty(Long.prototype, "__isLong__", { value: !0 });
function isLong(r) {
  return (r && r.__isLong__) === !0;
}
function ctz32(r) {
  var e = Math.clz32(r & -r);
  return r ? 31 - e : e;
}
Long.isLong = isLong;
var INT_CACHE = {},
  UINT_CACHE = {};
function fromInt(r, e) {
  var t, o, n;
  return e
    ? ((r >>>= 0),
      (n = 0 <= r && r < 256) && ((o = UINT_CACHE[r]), o)
        ? o
        : ((t = fromBits(r, 0, !0)), n && (UINT_CACHE[r] = t), t))
    : ((r |= 0),
      (n = -128 <= r && r < 128) && ((o = INT_CACHE[r]), o)
        ? o
        : ((t = fromBits(r, r < 0 ? -1 : 0, !1)), n && (INT_CACHE[r] = t), t));
}
Long.fromInt = fromInt;
function fromNumber(r, e) {
  if (isNaN(r)) return e ? UZERO : ZERO;
  if (e) {
    if (r < 0) return UZERO;
    if (r >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
  } else {
    if (r <= -TWO_PWR_63_DBL) return MIN_VALUE;
    if (r + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
  }
  return r < 0
    ? fromNumber(-r, e).neg()
    : fromBits(r % TWO_PWR_32_DBL | 0, (r / TWO_PWR_32_DBL) | 0, e);
}
Long.fromNumber = fromNumber;
function fromBits(r, e, t) {
  return new Long(r, e, t);
}
Long.fromBits = fromBits;
var pow_dbl = Math.pow;
function fromString(r, e, t) {
  if (r.length === 0) throw Error("empty string");
  if (
    (typeof e == "number" ? ((t = e), (e = !1)) : (e = !!e),
    r === "NaN" || r === "Infinity" || r === "+Infinity" || r === "-Infinity")
  )
    return e ? UZERO : ZERO;
  if (((t = t || 10), t < 2 || 36 < t)) throw RangeError("radix");
  var o;
  if ((o = r.indexOf("-")) > 0) throw Error("interior hyphen");
  if (o === 0) return fromString(r.substring(1), e, t).neg();
  for (
    var n = fromNumber(pow_dbl(t, 8)), i = ZERO, s = 0;
    s < r.length;
    s += 8
  ) {
    var a = Math.min(8, r.length - s),
      d = parseInt(r.substring(s, s + a), t);
    if (a < 8) {
      var l = fromNumber(pow_dbl(t, a));
      i = i.mul(l).add(fromNumber(d));
    } else (i = i.mul(n)), (i = i.add(fromNumber(d)));
  }
  return (i.unsigned = e), i;
}
Long.fromString = fromString;
function fromValue(r, e) {
  return typeof r == "number"
    ? fromNumber(r, e)
    : typeof r == "string"
    ? fromString(r, e)
    : fromBits(r.low, r.high, typeof e == "boolean" ? e : r.unsigned);
}
Long.fromValue = fromValue;
var TWO_PWR_16_DBL = 1 << 16,
  TWO_PWR_24_DBL = 1 << 24,
  TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL,
  TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL,
  TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2,
  TWO_PWR_24 = fromInt(TWO_PWR_24_DBL),
  ZERO = fromInt(0);
Long.ZERO = ZERO;
var UZERO = fromInt(0, !0);
Long.UZERO = UZERO;
var ONE = fromInt(1);
Long.ONE = ONE;
var UONE = fromInt(1, !0);
Long.UONE = UONE;
var NEG_ONE = fromInt(-1);
Long.NEG_ONE = NEG_ONE;
var MAX_VALUE = fromBits(-1, 2147483647, !1);
Long.MAX_VALUE = MAX_VALUE;
var MAX_UNSIGNED_VALUE = fromBits(-1, -1, !0);
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
var MIN_VALUE = fromBits(0, -2147483648, !1);
Long.MIN_VALUE = MIN_VALUE;
var LongPrototype = Long.prototype;
LongPrototype.toInt = function r() {
  return this.unsigned ? this.low >>> 0 : this.low;
};
LongPrototype.toNumber = function r() {
  return this.unsigned
    ? (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0)
    : this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};
LongPrototype.toString = function r(e) {
  if (((e = e || 10), e < 2 || 36 < e)) throw RangeError("radix");
  if (this.isZero()) return "0";
  if (this.isNegative())
    if (this.eq(MIN_VALUE)) {
      var t = fromNumber(e),
        o = this.div(t),
        n = o.mul(t).sub(this);
      return o.toString(e) + n.toInt().toString(e);
    } else return "-" + this.neg().toString(e);
  for (var i = fromNumber(pow_dbl(e, 6), this.unsigned), s = this, a = ""; ; ) {
    var d = s.div(i),
      l = s.sub(d.mul(i)).toInt() >>> 0,
      u = l.toString(e);
    if (((s = d), s.isZero())) return u + a;
    for (; u.length < 6; ) u = "0" + u;
    a = "" + u + a;
  }
};
LongPrototype.getHighBits = function r() {
  return this.high;
};
LongPrototype.getHighBitsUnsigned = function r() {
  return this.high >>> 0;
};
LongPrototype.getLowBits = function r() {
  return this.low;
};
LongPrototype.getLowBitsUnsigned = function r() {
  return this.low >>> 0;
};
LongPrototype.getNumBitsAbs = function r() {
  if (this.isNegative())
    return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
  for (
    var e = this.high != 0 ? this.high : this.low, t = 31;
    t > 0 && (e & (1 << t)) == 0;
    t--
  );
  return this.high != 0 ? t + 33 : t + 1;
};
LongPrototype.isZero = function r() {
  return this.high === 0 && this.low === 0;
};
LongPrototype.eqz = LongPrototype.isZero;
LongPrototype.isNegative = function r() {
  return !this.unsigned && this.high < 0;
};
LongPrototype.isPositive = function r() {
  return this.unsigned || this.high >= 0;
};
LongPrototype.isOdd = function r() {
  return (this.low & 1) === 1;
};
LongPrototype.isEven = function r() {
  return (this.low & 1) === 0;
};
LongPrototype.equals = function r(e) {
  return (
    isLong(e) || (e = fromValue(e)),
    this.unsigned !== e.unsigned &&
    this.high >>> 31 === 1 &&
    e.high >>> 31 === 1
      ? !1
      : this.high === e.high && this.low === e.low
  );
};
LongPrototype.eq = LongPrototype.equals;
LongPrototype.notEquals = function r(e) {
  return !this.eq(e);
};
LongPrototype.neq = LongPrototype.notEquals;
LongPrototype.ne = LongPrototype.notEquals;
LongPrototype.lessThan = function r(e) {
  return this.comp(e) < 0;
};
LongPrototype.lt = LongPrototype.lessThan;
LongPrototype.lessThanOrEqual = function r(e) {
  return this.comp(e) <= 0;
};
LongPrototype.lte = LongPrototype.lessThanOrEqual;
LongPrototype.le = LongPrototype.lessThanOrEqual;
LongPrototype.greaterThan = function r(e) {
  return this.comp(e) > 0;
};
LongPrototype.gt = LongPrototype.greaterThan;
LongPrototype.greaterThanOrEqual = function r(e) {
  return this.comp(e) >= 0;
};
LongPrototype.gte = LongPrototype.greaterThanOrEqual;
LongPrototype.ge = LongPrototype.greaterThanOrEqual;
LongPrototype.compare = function r(e) {
  if ((isLong(e) || (e = fromValue(e)), this.eq(e))) return 0;
  var t = this.isNegative(),
    o = e.isNegative();
  return t && !o
    ? -1
    : !t && o
    ? 1
    : this.unsigned
    ? e.high >>> 0 > this.high >>> 0 ||
      (e.high === this.high && e.low >>> 0 > this.low >>> 0)
      ? -1
      : 1
    : this.sub(e).isNegative()
    ? -1
    : 1;
};
LongPrototype.comp = LongPrototype.compare;
LongPrototype.negate = function r() {
  return !this.unsigned && this.eq(MIN_VALUE) ? MIN_VALUE : this.not().add(ONE);
};
LongPrototype.neg = LongPrototype.negate;
LongPrototype.add = function r(e) {
  isLong(e) || (e = fromValue(e));
  var t = this.high >>> 16,
    o = this.high & 65535,
    n = this.low >>> 16,
    i = this.low & 65535,
    s = e.high >>> 16,
    a = e.high & 65535,
    d = e.low >>> 16,
    l = e.low & 65535,
    u = 0,
    p = 0,
    m = 0,
    h = 0;
  return (
    (h += i + l),
    (m += h >>> 16),
    (h &= 65535),
    (m += n + d),
    (p += m >>> 16),
    (m &= 65535),
    (p += o + a),
    (u += p >>> 16),
    (p &= 65535),
    (u += t + s),
    (u &= 65535),
    fromBits((m << 16) | h, (u << 16) | p, this.unsigned)
  );
};
LongPrototype.subtract = function r(e) {
  return isLong(e) || (e = fromValue(e)), this.add(e.neg());
};
LongPrototype.sub = LongPrototype.subtract;
LongPrototype.multiply = function r(e) {
  if (this.isZero()) return this;
  if ((isLong(e) || (e = fromValue(e)), wasm)) {
    var t = wasm.mul(this.low, this.high, e.low, e.high);
    return fromBits(t, wasm.get_high(), this.unsigned);
  }
  if (e.isZero()) return this.unsigned ? UZERO : ZERO;
  if (this.eq(MIN_VALUE)) return e.isOdd() ? MIN_VALUE : ZERO;
  if (e.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  if (this.isNegative())
    return e.isNegative() ? this.neg().mul(e.neg()) : this.neg().mul(e).neg();
  if (e.isNegative()) return this.mul(e.neg()).neg();
  if (this.lt(TWO_PWR_24) && e.lt(TWO_PWR_24))
    return fromNumber(this.toNumber() * e.toNumber(), this.unsigned);
  var o = this.high >>> 16,
    n = this.high & 65535,
    i = this.low >>> 16,
    s = this.low & 65535,
    a = e.high >>> 16,
    d = e.high & 65535,
    l = e.low >>> 16,
    u = e.low & 65535,
    p = 0,
    m = 0,
    h = 0,
    f = 0;
  return (
    (f += s * u),
    (h += f >>> 16),
    (f &= 65535),
    (h += i * u),
    (m += h >>> 16),
    (h &= 65535),
    (h += s * l),
    (m += h >>> 16),
    (h &= 65535),
    (m += n * u),
    (p += m >>> 16),
    (m &= 65535),
    (m += i * l),
    (p += m >>> 16),
    (m &= 65535),
    (m += s * d),
    (p += m >>> 16),
    (m &= 65535),
    (p += o * u + n * l + i * d + s * a),
    (p &= 65535),
    fromBits((h << 16) | f, (p << 16) | m, this.unsigned)
  );
};
LongPrototype.mul = LongPrototype.multiply;
LongPrototype.divide = function r(e) {
  if ((isLong(e) || (e = fromValue(e)), e.isZero()))
    throw Error("division by zero");
  if (wasm) {
    if (
      !this.unsigned &&
      this.high === -2147483648 &&
      e.low === -1 &&
      e.high === -1
    )
      return this;
    var t = (this.unsigned ? wasm.div_u : wasm.div_s)(
      this.low,
      this.high,
      e.low,
      e.high
    );
    return fromBits(t, wasm.get_high(), this.unsigned);
  }
  if (this.isZero()) return this.unsigned ? UZERO : ZERO;
  var o, n, i;
  if (this.unsigned) {
    if ((e.unsigned || (e = e.toUnsigned()), e.gt(this))) return UZERO;
    if (e.gt(this.shru(1))) return UONE;
    i = UZERO;
  } else {
    if (this.eq(MIN_VALUE)) {
      if (e.eq(ONE) || e.eq(NEG_ONE)) return MIN_VALUE;
      if (e.eq(MIN_VALUE)) return ONE;
      var s = this.shr(1);
      return (
        (o = s.div(e).shl(1)),
        o.eq(ZERO)
          ? e.isNegative()
            ? ONE
            : NEG_ONE
          : ((n = this.sub(e.mul(o))), (i = o.add(n.div(e))), i)
      );
    } else if (e.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
    if (this.isNegative())
      return e.isNegative() ? this.neg().div(e.neg()) : this.neg().div(e).neg();
    if (e.isNegative()) return this.div(e.neg()).neg();
    i = ZERO;
  }
  for (n = this; n.gte(e); ) {
    o = Math.max(1, Math.floor(n.toNumber() / e.toNumber()));
    for (
      var a = Math.ceil(Math.log(o) / Math.LN2),
        d = a <= 48 ? 1 : pow_dbl(2, a - 48),
        l = fromNumber(o),
        u = l.mul(e);
      u.isNegative() || u.gt(n);

    )
      (o -= d), (l = fromNumber(o, this.unsigned)), (u = l.mul(e));
    l.isZero() && (l = ONE), (i = i.add(l)), (n = n.sub(u));
  }
  return i;
};
LongPrototype.div = LongPrototype.divide;
LongPrototype.modulo = function r(e) {
  if ((isLong(e) || (e = fromValue(e)), wasm)) {
    var t = (this.unsigned ? wasm.rem_u : wasm.rem_s)(
      this.low,
      this.high,
      e.low,
      e.high
    );
    return fromBits(t, wasm.get_high(), this.unsigned);
  }
  return this.sub(this.div(e).mul(e));
};
LongPrototype.mod = LongPrototype.modulo;
LongPrototype.rem = LongPrototype.modulo;
LongPrototype.not = function r() {
  return fromBits(~this.low, ~this.high, this.unsigned);
};
LongPrototype.countLeadingZeros = function r() {
  return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
};
LongPrototype.clz = LongPrototype.countLeadingZeros;
LongPrototype.countTrailingZeros = function r() {
  return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
};
LongPrototype.ctz = LongPrototype.countTrailingZeros;
LongPrototype.and = function r(e) {
  return (
    isLong(e) || (e = fromValue(e)),
    fromBits(this.low & e.low, this.high & e.high, this.unsigned)
  );
};
LongPrototype.or = function r(e) {
  return (
    isLong(e) || (e = fromValue(e)),
    fromBits(this.low | e.low, this.high | e.high, this.unsigned)
  );
};
LongPrototype.xor = function r(e) {
  return (
    isLong(e) || (e = fromValue(e)),
    fromBits(this.low ^ e.low, this.high ^ e.high, this.unsigned)
  );
};
LongPrototype.shiftLeft = function r(e) {
  return (
    isLong(e) && (e = e.toInt()),
    (e &= 63) === 0
      ? this
      : e < 32
      ? fromBits(
          this.low << e,
          (this.high << e) | (this.low >>> (32 - e)),
          this.unsigned
        )
      : fromBits(0, this.low << (e - 32), this.unsigned)
  );
};
LongPrototype.shl = LongPrototype.shiftLeft;
LongPrototype.shiftRight = function r(e) {
  return (
    isLong(e) && (e = e.toInt()),
    (e &= 63) === 0
      ? this
      : e < 32
      ? fromBits(
          (this.low >>> e) | (this.high << (32 - e)),
          this.high >> e,
          this.unsigned
        )
      : fromBits(this.high >> (e - 32), this.high >= 0 ? 0 : -1, this.unsigned)
  );
};
LongPrototype.shr = LongPrototype.shiftRight;
LongPrototype.shiftRightUnsigned = function r(e) {
  return (
    isLong(e) && (e = e.toInt()),
    (e &= 63) === 0
      ? this
      : e < 32
      ? fromBits(
          (this.low >>> e) | (this.high << (32 - e)),
          this.high >>> e,
          this.unsigned
        )
      : e === 32
      ? fromBits(this.high, 0, this.unsigned)
      : fromBits(this.high >>> (e - 32), 0, this.unsigned)
  );
};
LongPrototype.shru = LongPrototype.shiftRightUnsigned;
LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
LongPrototype.rotateLeft = function r(e) {
  var t;
  return (
    isLong(e) && (e = e.toInt()),
    (e &= 63) === 0
      ? this
      : e === 32
      ? fromBits(this.high, this.low, this.unsigned)
      : e < 32
      ? ((t = 32 - e),
        fromBits(
          (this.low << e) | (this.high >>> t),
          (this.high << e) | (this.low >>> t),
          this.unsigned
        ))
      : ((e -= 32),
        (t = 32 - e),
        fromBits(
          (this.high << e) | (this.low >>> t),
          (this.low << e) | (this.high >>> t),
          this.unsigned
        ))
  );
};
LongPrototype.rotl = LongPrototype.rotateLeft;
LongPrototype.rotateRight = function r(e) {
  var t;
  return (
    isLong(e) && (e = e.toInt()),
    (e &= 63) === 0
      ? this
      : e === 32
      ? fromBits(this.high, this.low, this.unsigned)
      : e < 32
      ? ((t = 32 - e),
        fromBits(
          (this.high << t) | (this.low >>> e),
          (this.low << t) | (this.high >>> e),
          this.unsigned
        ))
      : ((e -= 32),
        (t = 32 - e),
        fromBits(
          (this.low << t) | (this.high >>> e),
          (this.high << t) | (this.low >>> e),
          this.unsigned
        ))
  );
};
LongPrototype.rotr = LongPrototype.rotateRight;
LongPrototype.toSigned = function r() {
  return this.unsigned ? fromBits(this.low, this.high, !1) : this;
};
LongPrototype.toUnsigned = function r() {
  return this.unsigned ? this : fromBits(this.low, this.high, !0);
};
LongPrototype.toBytes = function r(e) {
  return e ? this.toBytesLE() : this.toBytesBE();
};
LongPrototype.toBytesLE = function r() {
  var e = this.high,
    t = this.low;
  return [
    t & 255,
    (t >>> 8) & 255,
    (t >>> 16) & 255,
    t >>> 24,
    e & 255,
    (e >>> 8) & 255,
    (e >>> 16) & 255,
    e >>> 24,
  ];
};
LongPrototype.toBytesBE = function r() {
  var e = this.high,
    t = this.low;
  return [
    e >>> 24,
    (e >>> 16) & 255,
    (e >>> 8) & 255,
    e & 255,
    t >>> 24,
    (t >>> 16) & 255,
    (t >>> 8) & 255,
    t & 255,
  ];
};
Long.fromBytes = function r(e, t, o) {
  return o ? Long.fromBytesLE(e, t) : Long.fromBytesBE(e, t);
};
Long.fromBytesLE = function r(e, t) {
  return new Long(
    e[0] | (e[1] << 8) | (e[2] << 16) | (e[3] << 24),
    e[4] | (e[5] << 8) | (e[6] << 16) | (e[7] << 24),
    t
  );
};
Long.fromBytesBE = function r(e, t) {
  return new Long(
    (e[4] << 24) | (e[5] << 16) | (e[6] << 8) | e[7],
    (e[0] << 24) | (e[1] << 16) | (e[2] << 8) | e[3],
    t
  );
};
var globalThis$1 = (() => {
  if (typeof globalThis$1 < "u") return globalThis$1;
  if (typeof self < "u") return self;
  if (typeof window < "u") return window;
  if (typeof global < "u") return global;
  throw "Unable to locate global object";
})();
_m0.util.Long !== Long && ((_m0.util.Long = Long), _m0.configure());
var src = {},
  zodOpenapi = {},
  dist = {},
  __assign =
    (commonjsGlobal && commonjsGlobal.__assign) ||
    function () {
      return (
        (__assign =
          Object.assign ||
          function (r) {
            for (var e, t = 1, o = arguments.length; t < o; t++) {
              e = arguments[t];
              for (var n in e)
                Object.prototype.hasOwnProperty.call(e, n) && (r[n] = e[n]);
            }
            return r;
          }),
        __assign.apply(this, arguments)
      );
    },
  __read =
    (commonjsGlobal && commonjsGlobal.__read) ||
    function (r, e) {
      var t = typeof Symbol == "function" && r[Symbol.iterator];
      if (!t) return r;
      var o = t.call(r),
        n,
        i = [],
        s;
      try {
        for (; (e === void 0 || e-- > 0) && !(n = o.next()).done; )
          i.push(n.value);
      } catch (a) {
        s = { error: a };
      } finally {
        try {
          n && !n.done && (t = o.return) && t.call(o);
        } finally {
          if (s) throw s.error;
        }
      }
      return i;
    },
  __spreadArray =
    (commonjsGlobal && commonjsGlobal.__spreadArray) ||
    function (r, e, t) {
      if (t || arguments.length === 2)
        for (var o = 0, n = e.length, i; o < n; o++)
          (i || !(o in e)) &&
            (i || (i = Array.prototype.slice.call(e, 0, o)), (i[o] = e[o]));
      return r.concat(i || Array.prototype.slice.call(e));
    };
Object.defineProperty(dist, "__esModule", { value: !0 });
var isObject$1 = function (r) {
    if (typeof r == "object" && r !== null) {
      if (typeof Object.getPrototypeOf == "function") {
        var e = Object.getPrototypeOf(r);
        return e === Object.prototype || e === null;
      }
      return Object.prototype.toString.call(r) === "[object Object]";
    }
    return !1;
  },
  merge = function () {
    for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e];
    return r.reduce(function (t, o) {
      if (Array.isArray(o))
        throw new TypeError(
          "Arguments provided to ts-deepmerge must be objects, not arrays."
        );
      return (
        Object.keys(o).forEach(function (n) {
          ["__proto__", "constructor", "prototype"].includes(n) ||
            (Array.isArray(t[n]) && Array.isArray(o[n])
              ? (t[n] = merge.options.mergeArrays
                  ? Array.from(new Set(t[n].concat(o[n])))
                  : o[n])
              : isObject$1(t[n]) && isObject$1(o[n])
              ? (t[n] = merge(t[n], o[n]))
              : (t[n] = o[n]));
        }),
        t
      );
    }, {});
  },
  defaultOptions = { mergeArrays: !0 };
merge.options = defaultOptions;
merge.withOptions = function (r) {
  for (var e = [], t = 1; t < arguments.length; t++) e[t - 1] = arguments[t];
  merge.options = __assign({ mergeArrays: !0 }, r);
  var o = merge.apply(void 0, __spreadArray([], __read(e), !1));
  return (merge.options = defaultOptions), o;
};
dist.default = merge;
const require$$1 = getAugmentedNamespace(lib);
Object.defineProperty(zodOpenapi, "__esModule", { value: !0 });
zodOpenapi.generateSchema = zodOpenapi.extendApi = void 0;
const ts_deepmerge_1 = dist,
  zod_1 = require$$1;
function extendApi(r, e = {}) {
  return (r.metaOpenApi = Object.assign(r.metaOpenApi || {}, e)), r;
}
zodOpenapi.extendApi = extendApi;
function iterateZodObject({ zodRef: r, useOutput: e }) {
  return Object.keys(r.shape).reduce(
    (t, o) =>
      Object.assign(Object.assign({}, t), {
        [o]: generateSchema(r.shape[o], e),
      }),
    {}
  );
}
function parseTransformation({ zodRef: r, schemas: e, useOutput: t }) {
  const o = generateSchema(r._def.schema, t);
  r._def;
  let n = "undefined";
  if (t && r._def.effect) {
    const i = r._def.effect.type === "transform" ? r._def.effect : null;
    if (i && "transform" in i)
      try {
        n = typeof i.transform(
          ["integer", "number"].includes(`${o.type}`)
            ? 0
            : o.type === "string"
            ? ""
            : o.type === "boolean"
            ? !1
            : o.type === "object"
            ? {}
            : o.type === "null"
            ? null
            : o.type === "array"
            ? []
            : void 0,
          { addIssue: () => {}, path: [] }
        );
      } catch {}
  }
  return (0, ts_deepmerge_1.default)(
    Object.assign(
      Object.assign(
        Object.assign({}, r.description ? { description: r.description } : {}),
        o
      ),
      ["number", "string", "boolean", "null"].includes(n) ? { type: n } : {}
    ),
    ...e
  );
}
function parseString({ zodRef: r, schemas: e }) {
  const t = { type: "string" },
    { checks: o = [] } = r._def;
  return (
    o.forEach((n) => {
      switch (n.kind) {
        case "email":
          t.format = "email";
          break;
        case "uuid":
          t.format = "uuid";
          break;
        case "cuid":
          t.format = "cuid";
          break;
        case "url":
          t.format = "uri";
          break;
        case "length":
          (t.minLength = n.value), (t.maxLength = n.value);
          break;
        case "max":
          t.maxLength = n.value;
          break;
        case "min":
          t.minLength = n.value;
          break;
        case "regex":
          t.pattern = n.regex.source;
          break;
      }
    }),
    (0, ts_deepmerge_1.default)(
      t,
      r.description ? { description: r.description } : {},
      ...e
    )
  );
}
function parseNumber({ zodRef: r, schemas: e }) {
  const t = { type: "number" },
    { checks: o = [] } = r._def;
  return (
    o.forEach((n) => {
      switch (n.kind) {
        case "max":
          (t.maximum = n.value), n.inclusive || (t.exclusiveMaximum = !0);
          break;
        case "min":
          (t.minimum = n.value), n.inclusive || (t.exclusiveMinimum = !0);
          break;
        case "int":
          t.type = "integer";
          break;
        case "multipleOf":
          t.multipleOf = n.value;
      }
    }),
    (0, ts_deepmerge_1.default)(
      t,
      r.description ? { description: r.description } : {},
      ...e
    )
  );
}
function parseObject({ zodRef: r, schemas: e, useOutput: t }) {
  var o;
  let n;
  return (
    r._def.catchall instanceof zod_1.z.ZodNever ||
    ((o = r._def.catchall) === null || o === void 0
      ? void 0
      : o._def.typeName) === "ZodNever"
      ? r._def.unknownKeys === "passthrough" && (n = !0)
      : (n = generateSchema(r._def.catchall, t)),
    (n = n ? { additionalProperties: n } : {}),
    (0, ts_deepmerge_1.default)(
      Object.assign(
        {
          type: "object",
          properties: iterateZodObject({ zodRef: r, schemas: e, useOutput: t }),
          required: Object.keys(r.shape).filter((i) => {
            const s = r.shape[i];
            return (
              !(
                s.isOptional() ||
                s instanceof zod_1.z.ZodDefault ||
                s._def.typeName === "ZodDefault"
              ) &&
              !(
                s instanceof zod_1.z.ZodNever ||
                s._def.typeName === "ZodDefault"
              )
            );
          }),
        },
        n
      ),
      r.description ? { description: r.description } : {},
      ...e
    )
  );
}
function parseRecord({ zodRef: r, schemas: e, useOutput: t }) {
  return (0, ts_deepmerge_1.default)(
    {
      type: "object",
      additionalProperties:
        r._def.valueType instanceof zod_1.z.ZodUnknown
          ? {}
          : generateSchema(r._def.valueType, t),
    },
    r.description ? { description: r.description } : {},
    ...e
  );
}
function parseBigInt({ zodRef: r, schemas: e }) {
  return (0, ts_deepmerge_1.default)(
    { type: "integer", format: "int64" },
    r.description ? { description: r.description } : {},
    ...e
  );
}
function parseBoolean({ zodRef: r, schemas: e }) {
  return (0, ts_deepmerge_1.default)(
    { type: "boolean" },
    r.description ? { description: r.description } : {},
    ...e
  );
}
function parseDate({ zodRef: r, schemas: e }) {
  return (0, ts_deepmerge_1.default)(
    { type: "string", format: "date-time" },
    r.description ? { description: r.description } : {},
    ...e
  );
}
function parseNull({ zodRef: r, schemas: e }) {
  return (0, ts_deepmerge_1.default)(
    { type: "string", format: "null", nullable: !0 },
    r.description ? { description: r.description } : {},
    ...e
  );
}
function parseOptionalNullable({ schemas: r, zodRef: e, useOutput: t }) {
  return (0, ts_deepmerge_1.default)(
    generateSchema(e.unwrap(), t),
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseDefault({ schemas: r, zodRef: e, useOutput: t }) {
  return (0, ts_deepmerge_1.default)(
    Object.assign(
      { default: e._def.defaultValue() },
      generateSchema(e._def.innerType, t)
    ),
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseArray({ schemas: r, zodRef: e, useOutput: t }) {
  const o = {};
  return (
    e._def.exactLength != null &&
      ((o.minItems = e._def.exactLength.value),
      (o.maxItems = e._def.exactLength.value)),
    e._def.minLength != null && (o.minItems = e._def.minLength.value),
    e._def.maxLength != null && (o.maxItems = e._def.maxLength.value),
    (0, ts_deepmerge_1.default)(
      Object.assign({ type: "array", items: generateSchema(e.element, t) }, o),
      e.description ? { description: e.description } : {},
      ...r
    )
  );
}
function parseLiteral({ schemas: r, zodRef: e }) {
  return (0, ts_deepmerge_1.default)(
    { type: typeof e._def.value, enum: [e._def.value] },
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseEnum({ schemas: r, zodRef: e }) {
  return (0, ts_deepmerge_1.default)(
    {
      type: typeof Object.values(e._def.values)[0],
      enum: Object.values(e._def.values),
    },
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseIntersection({ schemas: r, zodRef: e, useOutput: t }) {
  return (0, ts_deepmerge_1.default)(
    {
      allOf: [generateSchema(e._def.left, t), generateSchema(e._def.right, t)],
    },
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseUnion({ schemas: r, zodRef: e, useOutput: t }) {
  return (0, ts_deepmerge_1.default)(
    { oneOf: e._def.options.map((o) => generateSchema(o, t)) },
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseDiscriminatedUnion({ schemas: r, zodRef: e, useOutput: t }) {
  return (0, ts_deepmerge_1.default)(
    {
      discriminator: { propertyName: e._def.discriminator },
      oneOf: Array.from(e._def.options.values()).map((o) =>
        generateSchema(o, t)
      ),
    },
    e.description ? { description: e.description } : {},
    ...r
  );
}
function parseNever({ zodRef: r, schemas: e }) {
  return (0, ts_deepmerge_1.default)(
    { readOnly: !0 },
    r.description ? { description: r.description } : {},
    ...e
  );
}
function catchAllParser({ zodRef: r, schemas: e }) {
  return (0, ts_deepmerge_1.default)(
    r.description ? { description: r.description } : {},
    ...e
  );
}
const workerMap = {
  ZodObject: parseObject,
  ZodRecord: parseRecord,
  ZodString: parseString,
  ZodNumber: parseNumber,
  ZodBigInt: parseBigInt,
  ZodBoolean: parseBoolean,
  ZodDate: parseDate,
  ZodNull: parseNull,
  ZodOptional: parseOptionalNullable,
  ZodNullable: parseOptionalNullable,
  ZodDefault: parseDefault,
  ZodArray: parseArray,
  ZodLiteral: parseLiteral,
  ZodEnum: parseEnum,
  ZodNativeEnum: parseEnum,
  ZodTransformer: parseTransformation,
  ZodEffects: parseTransformation,
  ZodIntersection: parseIntersection,
  ZodUnion: parseUnion,
  ZodDiscriminatedUnion: parseDiscriminatedUnion,
  ZodNever: parseNever,
  ZodUndefined: catchAllParser,
  ZodTuple: catchAllParser,
  ZodMap: catchAllParser,
  ZodFunction: catchAllParser,
  ZodLazy: catchAllParser,
  ZodPromise: catchAllParser,
  ZodAny: catchAllParser,
  ZodUnknown: catchAllParser,
  ZodVoid: catchAllParser,
};
function generateSchema(r, e) {
  const { metaOpenApi: t = {} } = r,
    o = [
      r.isNullable && r.isNullable() ? { nullable: !0 } : {},
      ...(Array.isArray(t) ? t : [t]),
    ];
  try {
    const n = r._def.typeName;
    return n in workerMap
      ? workerMap[n]({ zodRef: r, schemas: o, useOutput: e })
      : catchAllParser({ zodRef: r, schemas: o });
  } catch (n) {
    return console.error(n), catchAllParser({ zodRef: r, schemas: o });
  }
}
zodOpenapi.generateSchema = generateSchema;
(function (r) {
  var e =
      (commonjsGlobal && commonjsGlobal.__createBinding) ||
      (Object.create
        ? function (o, n, i, s) {
            s === void 0 && (s = i);
            var a = Object.getOwnPropertyDescriptor(n, i);
            (!a ||
              ("get" in a ? !n.__esModule : a.writable || a.configurable)) &&
              (a = {
                enumerable: !0,
                get: function () {
                  return n[i];
                },
              }),
              Object.defineProperty(o, s, a);
          }
        : function (o, n, i, s) {
            s === void 0 && (s = i), (o[s] = n[i]);
          }),
    t =
      (commonjsGlobal && commonjsGlobal.__exportStar) ||
      function (o, n) {
        for (var i in o)
          i !== "default" &&
            !Object.prototype.hasOwnProperty.call(n, i) &&
            e(n, o, i);
      };
  Object.defineProperty(r, "__esModule", { value: !0 }), t(zodOpenapi, r);
})(src);
mod.object({
  userUuid: src.extendApi(mod.string(), {
    example: "998ce839-3dea-4698-8b41-ebbdf7688ad9",
  }),
  email: src.extendApi(mod.string().nullable(), {
    description: "The email of the current user.",
    example: "example@workadventu.re",
  }),
  roomUrl: src.extendApi(mod.string(), {
    example: "/@/teamSlug/worldSlug/roomSlug",
  }),
  mapUrlStart: src.extendApi(mod.string(), {
    description: "The full URL to the JSON map file",
    example: "https://myuser.github.io/myrepo/map.json",
  }),
  messages: mod.optional(mod.array(mod.unknown())),
});
mod.object({
  messages: mod.optional(mod.array(mod.unknown())),
  alg: mod.string(),
  iss: mod.string(),
  aud: mod.string(),
  iat: mod.number(),
  uid: mod.string(),
  user: src.extendApi(mod.string().nullable(), {
    description: "The email of the current user.",
    example: "example@workadventu.re",
  }),
  room: src.extendApi(mod.string(), {
    description: "The room URL of the current user.",
    example: "/@/teamSlug/worldSlug/roomSlug",
  }),
  exp: mod.number(),
});
mod.object({
  name: src.extendApi(mod.string(), {
    description: "The name of the application",
    example: "Onboarding woka",
  }),
  script: src.extendApi(mod.string(), {
    description: "The url of the application",
    example: "http://example.com/@/teamSLug/worldSlug",
  }),
});
mod.object({
  "api/companion/list": src.extendApi(mod.optional(mod.string()), {
    description: "Means the api implements a companion list",
    example: "v1",
  }),
  "api/woka/list": src.extendApi(mod.optional(mod.string()), {
    description:
      "Means the api implements woka list, This capability will be added regardless",
    example: "v1",
  }),
});
const isCompanionDetail = mod.object({
    name: src.extendApi(mod.string(), {
      description: "The name of the texture.",
      example: "dog1",
    }),
    img: src.extendApi(mod.string(), {
      description: "The URL of the image of the texture.",
      example: "https://example.com/resources/characters/pipoya/Cat 01-1.png",
    }),
  }),
  companionList = mod.array(isCompanionDetail),
  companionTextureCollection = mod.object({
    name: src.extendApi(mod.string(), {
      description: "Collection name",
      example: "cats",
    }),
    textures: companionList,
  });
mod.array(companionTextureCollection);
mod.object({
  uuid: mod.string(),
  email: mod.string().nullable().optional(),
  name: mod.string(),
  playUri: mod.string(),
  authToken: mod.optional(mod.string()),
  color: mod.string(),
  woka: mod.string(),
  isLogged: mod.boolean(),
  availabilityStatus: mod.number(),
  roomName: mod.optional(mod.nullable(mod.string())),
  userRoomToken: mod.optional(mod.nullable(mod.string())),
  visitCardUrl: mod.optional(mod.nullable(mod.string())),
});
const isErrorApiErrorData = src.extendApi(
    mod.object({
      type: mod.literal("error"),
      code: src.extendApi(mod.string(), {
        description:
          "The system code of an error, it must be in SCREAMING_SNAKE_CASE.",
        example: "ROOM_NOT_FOUND",
      }),
      title: src.extendApi(mod.string(), {
        description: "Big title displayed on the error screen.",
        example: "ERROR",
      }),
      subtitle: src.extendApi(mod.string(), {
        description:
          "Subtitle displayed to let the user know what is the main subject of the error.",
        example: "The room was not found.",
      }),
      details: src.extendApi(mod.string(), {
        description:
          "Some others details on what the user can do if he don't understand the error.",
        example:
          "If you would like more information, you can contact the administrator or us at example@workadventu.re.",
      }),
      image: src.extendApi(mod.string(), {
        description:
          "The URL of the image displayed just under the logo in the error screen.",
        example: "https://example.com/error.png",
      }),
    }),
    {
      description: `This is an error that can be returned by the API, its type must be equal to "error".
 If such an error is caught, an error screen will be displayed.`,
    }
  ),
  isErrorApiRetryData = src.extendApi(
    mod.object({
      type: mod.literal("retry"),
      code: src.extendApi(mod.string(), {
        description: `The system code of an error, it must be in SCREAMING_SNAKE_CASE. 
 It will not be displayed to the user.`,
        example: "WORLD_FULL",
      }),
      title: src.extendApi(mod.string(), {
        description: "Big title displayed on the error screen.",
        example: "ERROR",
      }),
      subtitle: src.extendApi(mod.string(), {
        description:
          "Subtitle displayed to let the user know what is the main subject of the error.",
        example: "Too successful, your WorkAdventure world is full!",
      }),
      details: src.extendApi(mod.string(), {
        description:
          "Some others details on what the user can do if he don't understand the error.",
        example: "New automatic attempt in 30 seconds",
      }),
      image: src.extendApi(mod.string(), {
        description:
          "The URL of the image displayed just under the logo in the waiting screen.",
        example: "https://example.com/wait.png",
      }),
      buttonTitle: src.extendApi(mod.string().nullable().optional(), {
        description:
          "If this is not defined the button and the parameter canRetryManual is set to true, the button will be not displayed at all.",
        example: "Retry",
      }),
      timeToRetry: src.extendApi(mod.number(), {
        description:
          "This is the time (in millisecond) between the next auto refresh of the page.",
        example: 3e4,
      }),
      canRetryManual: src.extendApi(mod.boolean(), {
        description:
          "This boolean show or hide the button to let the user refresh manually the current page.",
        example: !0,
      }),
    }),
    {
      description: `This is an error that can be returned by the API, its type must be equal to "retry".
If such an error is caught, a waiting screen will be displayed.`,
    }
  ),
  isErrorApiRedirectData = src.extendApi(
    mod.object({
      type: mod.literal("redirect"),
      urlToRedirect: src.extendApi(mod.string(), {
        description: "A URL specified to redirect the user onto it directly",
        example: "/contact-us",
      }),
    }),
    {
      description: `This is an error that can be returned by the API, its type must be equal to "redirect".
If such an error is caught, the user will be automatically redirected to urlToRedirect.`,
    }
  ),
  isErrorApiUnauthorizedData = src.extendApi(
    mod.object({
      type: mod.literal("unauthorized"),
      code: src.extendApi(mod.string(), {
        description:
          "This is the system code of an error, it must be in SCREAMING_SNAKE_CASE.",
        example: "USER_ACCESS_FORBIDDEN",
      }),
      title: src.extendApi(mod.string(), {
        description: "Big title displayed on the error screen.",
        example: "ERROR",
      }),
      subtitle: src.extendApi(mod.string(), {
        description:
          "Subtitle displayed to let the user know what is the main subject of the error.",
        example: "You can't access this place.",
      }),
      details: src.extendApi(mod.string(), {
        description:
          "Some others details on what the user can do if he don't understand the error.",
        example:
          "If you would like more information, you can contact the administrator or us at example@workadventu.re.",
      }),
      image: src.extendApi(mod.string(), {
        description:
          "The URL of the image displayed just under the logo in the error screen.",
        example: "https://example.com/error.png",
      }),
      buttonTitle: src.extendApi(mod.string().nullable().optional(), {
        description:
          "If this is not defined the button to logout will be not displayed.",
        example: "Log out",
      }),
    }),
    {
      description: `This is an error that can be returned by the API, its type must be equal to "unauthorized".
If such an error is caught, an error screen will be displayed with a button to let him logout and go to login page.`,
    }
  );
mod.discriminatedUnion("type", [
  isErrorApiErrorData,
  isErrorApiRetryData,
  isErrorApiRedirectData,
  isErrorApiUnauthorizedData,
]);
const isMucRoomDefinition = mod.object({
    name: src.extendApi(mod.string(), {
      description: "The name of the MUC room",
      example: "Default room",
    }),
    url: src.extendApi(mod.string(), {
      description: "The url of the MUC room",
      example: "http://example.com/@/teamSLug/worldSlug",
    }),
    type: src.extendApi(mod.string(), {
      description: "The type of the MUC room",
      example: "live",
    }),
    subscribe: src.extendApi(mod.boolean().optional().default(!1), {
      description:
        "If the user need to subscribe and be persisted in the MUC room",
    }),
  }),
  isMetaTagFavicon = mod.object({
    rel: src.extendApi(mod.string(), {
      description: "Device specification",
      example: "apple-touch-icon",
    }),
    sizes: src.extendApi(mod.string(), {
      description: "Icon sizes",
      example: "57x57",
    }),
    src: src.extendApi(mod.string(), {
      description: "Icon path",
      example: "https://workadventu.re/icons/apple-icon-57x57.png",
    }),
  }),
  isMetaTagManifestIcon = src.extendApi(
    mod.object({
      sizes: src.extendApi(mod.string(), {
        description: "Icon sizes",
        example: "57x57 64x64",
      }),
      src: src.extendApi(mod.string(), {
        description: "Icon path",
        example: "https://workadventu.re/icons/apple-icon-57x57.png",
      }),
      type: src.extendApi(mod.string().optional(), {
        description:
          "A hint as to the media type of the image. The purpose of this member is to allow a user agent to quickly ignore images with media types it does not support.",
        example: "image/webp",
      }),
      purpose: src.extendApi(mod.string().optional(), {
        description:
          "Defines the purpose of the image, for example if the image is intended to serve some special purpose in the context of the host OS (i.e., for better integration).",
        example: "any",
      }),
    }),
    {
      description: "An icon as represented in the manifest.json file (for PWA)",
    }
  ),
  OpidWokaNamePolicy = src
    .extendApi(
      mod.enum(["user_input", "allow_override_opid", "force_opid", ""]),
      { example: "['user_input', 'allow_override_opid', 'force_opid']" }
    )
    .optional()
    .nullable(),
  isBbbData = mod.object({
    url: src.extendApi(mod.string(), {
      description:
        'The full URL to your BigBlueButton server. Do not forget the trailing "/bigbluebutton/".',
      example: "https://test-install.blindsidenetworks.com/bigbluebutton/",
    }),
    secret: src.extendApi(mod.string(), {
      description:
        'The BigBlueButton secret. From your BBB instance, you can get the correct values using the command: "bbb-conf --secret"',
    }),
  }),
  isJitsiData = mod.object({
    url: src.extendApi(mod.string(), {
      description: "The domain name of your Jitsi server.",
      example: "meet.jit.si",
    }),
    iss: src.extendApi(mod.string().nullable().optional(), {
      description:
        "The Jitsi ISS setting. See https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/tokens.md",
      default: !1,
    }),
    secret: src.extendApi(mod.string().nullable().optional(), {
      description:
        "The Jitsi secret setting. See https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/tokens.md",
    }),
  }),
  isMapThirdPartyData = mod.object({
    bbb: src.extendApi(isBbbData.nullable().optional(), {
      description:
        "Use these settings to override default BigBlueButton settings.",
    }),
    jitsi: src.extendApi(isJitsiData.nullable().optional(), {
      description: "Use these settings to override default Jitsi settings.",
    }),
  }),
  MetaTagsData = mod.object({
    title: src.extendApi(mod.string().optional().default("WorkAdventure"), {
      description: "Title shown on browser tab",
      example: "WorkAdventure - My Awesome World",
    }),
    description: src.extendApi(
      mod
        .string()
        .optional()
        .default(
          "Create your own digital office, Metaverse and meet online with the world."
        ),
      {
        description: "Description of the webpage",
        example: "My awesome world in WorkAdventure",
      }
    ),
    author: src.extendApi(
      mod.string().optional().default("WorkAdventure team"),
      { description: "Author of the webpage", example: "My Awesome team" }
    ),
    provider: src.extendApi(mod.string().optional().default("WorkAdventure"), {
      description: "Provider of the webpage",
      example: "WorkAdventure SAAS plateform",
    }),
    favIcons: src.extendApi(isMetaTagFavicon.array().optional(), {
      description: "Icon to load inside the index.html and on the manifest",
    }),
    manifestIcons: isMetaTagManifestIcon.array().optional(),
    appName: src.extendApi(mod.string().optional(), {
      description: "Name display on the PWA",
      example: "WorkAdventure",
    }),
    shortAppName: src.extendApi(mod.string().optional(), {
      description: "PWA name when there not enough space",
      example: "WA",
    }),
    themeColor: src.extendApi(mod.string().optional(), {
      description:
        "Color use for theme PWA icons, Windows app and android browser",
      example: "#000000",
    }),
    cardImage: src.extendApi(mod.string().optional(), {
      description: "The URL of the image to be used on OG card tags",
      example: "https://example.com/awesome_world.png",
    }),
  });
MetaTagsData.required();
const isLegalsData = mod.object({
    termsOfUseUrl: src.extendApi(mod.string().nullable().optional(), {
      description:
        "The link to the 'terms of user' page (link displayed on the 'enter your name' scene)",
    }),
    privacyPolicyUrl: src.extendApi(mod.string().nullable().optional(), {
      description:
        "The link to the 'privacy policy' page (link displayed on the 'enter your name' scene)",
    }),
    cookiePolicyUrl: src.extendApi(mod.string().nullable().optional(), {
      description:
        "The link to the 'cookie policy' page (link displayed on the 'enter your name' scene)",
    }),
  }),
  CustomizeSceneData = mod.object({
    clothesIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the clothes icon",
    }),
    accessoryIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the accessory icon",
    }),
    hatIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the hat icon",
    }),
    hairIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the hair icon",
    }),
    eyesIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the eyes icon",
    }),
    bodyIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the body icon",
    }),
    turnIcon: src.extendApi(mod.string().nullable().optional(), {
      description: "The URL of the turn icon",
    }),
  });
mod.object({
  mapUrl: src.extendApi(mod.string(), {
    description: "The full URL to the JSON map file",
    example: "https://myuser.github.io/myrepo/map.json",
  }),
  authenticationMandatory: src.extendApi(mod.boolean().nullable().optional(), {
    description: "Whether the authentication is mandatory or not for this map",
    example: !0,
  }),
  group: src.extendApi(mod.string().nullable(), {
    description:
      'The group this room is part of (maps the notion of "world" in WorkAdventure SAAS)',
    example: "myorg/myworld",
  }),
  mucRooms: src.extendApi(isMucRoomDefinition.array().nullable(), {
    description: "The MUC room is a room of message",
  }),
  contactPage: src.extendApi(mod.string().nullable().optional(), {
    description: "The URL to the contact page",
    example: "https://mycompany.com/contact-us",
  }),
  iframeAuthentication: src.extendApi(mod.string().nullable().optional(), {
    description: "The URL of the authentication Iframe",
    example: "https://mycompany.com/authc",
  }),
  opidLogoutRedirectUrl: src.extendApi(mod.string().nullable().optional(), {
    description: "The URL of the logout redirect",
    example: "https://mycompany.com/logout",
  }),
  opidWokaNamePolicy: src.extendApi(OpidWokaNamePolicy.nullable().optional(), {
    description: "Username policy",
    example: "user_input",
  }),
  expireOn: src.extendApi(mod.optional(mod.string()), {
    description: "The date (in ISO 8601 format) at which the room will expire",
    example: "2022-11-05T08:15:30-05:00",
  }),
  canReport: src.extendApi(mod.boolean().optional(), {
    description: 'Whether the "report" feature is enabled or not on this room',
    example: !0,
  }),
  editable: src.extendApi(mod.optional(mod.boolean()), {
    description:
      'Whether the "map editor" feature is enabled or not on this room (true if the map comes from the map-storage)',
    example: !0,
  }),
  loadingCowebsiteLogo: src.extendApi(mod.string().nullable().optional(), {
    description:
      "The URL of the image to be used on the cowebsite loading page",
    example: "https://example.com/logo.gif",
  }),
  miniLogo: mod.string().nullable().optional(),
  loadingLogo: src.extendApi(mod.string().nullable().optional(), {
    description: "The URL of the image to be used on the loading page",
    example: "https://example.com/logo.png",
  }),
  loginSceneLogo: src.extendApi(mod.string().nullable().optional(), {
    description: "The URL of the image to be used on the LoginScene",
    example: "https://example.com/logo_login.png",
  }),
  showPoweredBy: src.extendApi(mod.boolean().nullable().optional(), {
    description: "Whether the logo PoweredBy is enabled or not on this room",
    example: !0,
  }),
  thirdParty: src.extendApi(isMapThirdPartyData.nullable().optional(), {
    description: "Configuration data for third party services",
  }),
  metadata: src.extendApi(mod.unknown().optional(), {
    description: "Metadata from administration",
  }),
  roomName: src.extendApi(mod.string().nullable().optional(), {
    description: "The name of the current room.",
    example: "WA Village",
  }),
  pricingUrl: src.extendApi(mod.string().nullable().optional(), {
    description:
      "The url of the page where the user can see the price to upgrade and can use the features he wants in the future.",
    example: "https://example.com/pricing",
  }),
  enableChat: src.extendApi(mod.boolean().optional(), {
    description: "Whether the chat is enabled or not on this room",
    example: !0,
  }),
  enableChatUpload: src.extendApi(mod.boolean().optional(), {
    description:
      "Whether the feature 'upload' in the chat is enabled or not on this room",
    example: !0,
  }),
  enableChatOnlineList: src.extendApi(mod.boolean().optional(), {
    description:
      "Whether the feature 'Users list' in the chat is enabled or not on this room",
    example: !0,
  }),
  enableChatDisconnectedList: src.extendApi(mod.boolean().optional(), {
    description:
      "Whether the feature 'disconnected users' in the chat is enabled or not on this room",
    example: !0,
  }),
  metatags: src.extendApi(MetaTagsData.nullable().optional(), {
    description:
      "Data related to METATAGS / meta tags. Contains page title, favicons, og data, etc...",
  }),
  legals: src.extendApi(isLegalsData.nullable().optional(), {
    description: "Configuration of the legals link (privacy policy, etc...)",
  }),
  customizeWokaScene: src.extendApi(CustomizeSceneData.nullable().optional(), {
    description: "Configuration of the 'Customize your Woka' scene (WIP)",
  }),
  backgroundColor: src.extendApi(mod.string().nullable().optional(), {
    description:
      "The background color used on configuration scenes (enter your name, select a woka, etc...) (WIP)",
    example: "#330033",
  }),
  reportIssuesUrl: src.extendApi(mod.string().nullable().optional(), {
    description:
      "The URL of the page to report issues (in the 'Report issues' menu). If this parameter is null, report issues menu is hidden",
    example: "https://my-report-issues-form.com/issues",
  }),
  entityCollectionsUrls: src.extendApi(
    mod.array(mod.string()).optional().nullable(),
    { description: "What entity collections are available for this map" }
  ),
});
const wokaTexture = mod.object({
    id: src.extendApi(mod.string(), {
      description: "A unique identifier for this texture.",
      example: "03395306-5dee-4b16-a034-36f2c5f2324a",
    }),
    name: src.extendApi(mod.string(), {
      description: "The name of the texture.",
      example: "Hair 1",
    }),
    url: src.extendApi(mod.string(), {
      description: "The URL of the image of the texture.",
      example:
        "http://example.com/resources/customisation/character_hairs/character_hairs1.png",
    }),
    tags: src.extendApi(mod.array(mod.string()).optional(), { deprecated: !0 }),
    tintable: src.extendApi(mod.boolean().optional(), {
      description: "Whether the color is customizable or not. Not used yet.",
      example: !0,
    }),
  }),
  wokaTextureCollection = mod.object({
    name: src.extendApi(mod.string(), {
      description: "Name of the collection",
      example: "Hair",
    }),
    textures: mod.array(wokaTexture),
  }),
  wokaPartType = mod.object({
    collections: mod.array(wokaTextureCollection),
    required: mod.boolean().optional(),
  });
mod.record(wokaPartType);
mod.object({
  id: src.extendApi(mod.string(), {
    description: "The unique identifier of the Woka.",
    example: "03395306-5dee-4b16-a034-36f2c5f2324a",
  }),
  url: src.extendApi(mod.optional(mod.string()), {
    description: "The URL of the image of the woka.",
    example: "http://example.com/resources/characters/pipoya/male.png",
  }),
  layer: src.extendApi(mod.optional(mod.string()), {
    description: "The layer of where the woka will be rendered.",
  }),
});
mod.object({
  roomUrl: mod.string(),
  email: mod.string().nullable(),
  organizationMemberToken: mod.string().nullable(),
  mapUrlStart: mod.string(),
  userUuid: mod.string(),
  authToken: mod.string(),
  messages: mod.optional(mod.array(mod.unknown())),
});
mod.object({
  redirectUrl: src.extendApi(mod.string(), {
    description: "The WorkAdventure URL to redirect to.",
    example: "/_/global/example.com/start.json",
  }),
});
const isXmppSettingsMessageEvent = mod.object({
    jid: mod.string(),
    conferenceDomain: mod.string(),
    rooms: mod.array(isMucRoomDefinition),
    jabberId: mod.string(),
    jabberPassword: mod.string(),
  }),
  isAddClassicButtonActionBarEvent = mod.object({
    id: mod.string(),
    label: mod.string(),
    type: mod.enum(["button"]).optional().default("button"),
  }),
  isAddActionButtonActionBarEvent = mod.object({
    id: mod.string(),
    type: mod.enum(["action"]),
    imageSrc: mod.string(),
    toolTip: mod.string(),
  }),
  isAddButtonActionBarEvent = mod.union([
    isAddClassicButtonActionBarEvent,
    isAddActionButtonActionBarEvent,
  ]),
  isRemoveButtonActionBarEvent = mod.object({ id: mod.string() }),
  isBannerEvent = mod.object({
    id: mod.string(),
    text: mod.string(),
    bgColor: mod.string().optional(),
    textColor: mod.string().optional(),
    closable: mod.boolean().optional().default(!0),
    link: mod.object({ url: mod.string(), label: mod.string() }).optional(),
  });
mod.union([
  mod.object({
    type: mod.literal("addActionsMenuKeyToRemotePlayer"),
    data: isAddActionsMenuKeyToRemotePlayerEvent,
  }),
  mod.object({
    type: mod.literal("removeActionsMenuKeyFromRemotePlayer"),
    data: isRemoveActionsMenuKeyFromRemotePlayerEvent,
  }),
  mod.object({ type: mod.literal("loadPage"), data: isLoadPageEvent }),
  mod.object({ type: mod.literal("chat"), data: isChatEvent }),
  mod.object({ type: mod.literal("openChat"), data: mod.undefined() }),
  mod.object({ type: mod.literal("closeChat"), data: mod.undefined() }),
  mod.object({ type: mod.literal("addPersonnalMessage"), data: mod.string() }),
  mod.object({
    type: mod.literal("newChatMessageWritingStatus"),
    data: mod.number(),
  }),
  mod.object({
    type: mod.literal("cameraFollowPlayer"),
    data: isCameraFollowPlayerEvent,
  }),
  mod.object({ type: mod.literal("cameraSet"), data: isCameraSetEvent }),
  mod.object({ type: mod.literal("openPopup"), data: isOpenPopupEvent }),
  mod.object({ type: mod.literal("closePopup"), data: isClosePopupEvent }),
  mod.object({ type: mod.literal("openTab"), data: isOpenTabEvent }),
  mod.object({ type: mod.literal("goToPage"), data: isGoToPageEvent }),
  mod.object({ type: mod.literal("turnOffMicrophone"), data: mod.undefined() }),
  mod.object({ type: mod.literal("turnOffWebcam"), data: mod.undefined() }),
  mod.object({ type: mod.literal("disableMicrophone"), data: mod.undefined() }),
  mod.object({ type: mod.literal("restoreMicrophone"), data: mod.undefined() }),
  mod.object({ type: mod.literal("disableWebcam"), data: mod.undefined() }),
  mod.object({ type: mod.literal("restoreWebcam"), data: mod.undefined() }),
  mod.object({
    type: mod.literal("disablePlayerControls"),
    data: mod.undefined(),
  }),
  mod.object({
    type: mod.literal("restorePlayerControls"),
    data: mod.undefined(),
  }),
  mod.object({
    type: mod.literal("disablePlayerProximityMeeting"),
    data: mod.undefined(),
  }),
  mod.object({
    type: mod.literal("restorePlayerProximityMeeting"),
    data: mod.undefined(),
  }),
  mod.object({ type: mod.literal("displayBubble"), data: mod.undefined() }),
  mod.object({ type: mod.literal("removeBubble"), data: mod.undefined() }),
  mod.object({ type: mod.literal("onPlayerMove"), data: mod.undefined() }),
  mod.object({ type: mod.literal("onCameraUpdate"), data: mod.undefined() }),
  mod.object({ type: mod.literal("showLayer"), data: isLayerEvent }),
  mod.object({ type: mod.literal("hideLayer"), data: isLayerEvent }),
  mod.object({ type: mod.literal("setProperty"), data: isSetPropertyEvent }),
  mod.object({
    type: mod.literal("setAreaProperty"),
    data: isSetAreaPropertyEvent,
  }),
  mod.object({ type: mod.literal("loadSound"), data: isLoadSoundEvent }),
  mod.object({ type: mod.literal("playSound"), data: isPlaySoundEvent }),
  mod.object({ type: mod.literal("stopSound"), data: isStopSoundEvent }),
  mod.object({ type: mod.literal("registerMenu"), data: isMenuRegisterEvent }),
  mod.object({
    type: mod.literal("unregisterMenu"),
    data: isUnregisterMenuEvent,
  }),
  mod.object({ type: mod.literal("setTiles"), data: isSetTilesEvent }),
  mod.object({
    type: mod.literal("modifyEmbeddedWebsite"),
    data: isEmbeddedWebsiteEvent,
  }),
  mod.object({
    type: mod.literal("modifyUIWebsite"),
    data: isModifyUIWebsiteEvent,
  }),
  mod.object({ type: mod.literal("modifyArea"), data: isAreaEvent }),
  mod.object({ type: mod.literal("askPosition"), data: isAskPositionEvent }),
  mod.object({ type: mod.literal("openInviteMenu"), data: mod.undefined() }),
  mod.object({
    type: mod.literal("chatTotalMessagesToSee"),
    data: mod.number(),
  }),
  mod.object({ type: mod.literal("notification"), data: isNotificationEvent }),
  mod.object({ type: mod.literal("login"), data: mod.undefined() }),
  mod.object({ type: mod.literal("refresh"), data: mod.undefined() }),
  mod.object({
    type: mod.literal("showBusinessCard"),
    data: isShowBusinessCardEvent,
  }),
  mod.object({ type: mod.literal("openModal"), data: isModalEvent }),
  mod.object({ type: mod.literal("closeModal"), data: mod.undefined() }),
  mod.object({ type: mod.literal("redirectPricing"), data: mod.undefined() }),
  mod.object({
    type: mod.literal("addButtonActionBar"),
    data: isAddButtonActionBarEvent,
  }),
  mod.object({
    type: mod.literal("removeButtonActionBar"),
    data: isRemoveButtonActionBarEvent,
  }),
  mod.object({ type: mod.literal("chatReady"), data: mod.undefined() }),
  mod.object({ type: mod.literal("openBanner"), data: isBannerEvent }),
  mod.object({ type: mod.literal("closeBanner"), data: mod.undefined() }),
]);
const isIframeResponseEvent = mod.union([
    mod.object({
      type: mod.literal("userInputChat"),
      data: isUserInputChatEvent,
    }),
    mod.object({
      type: mod.literal("joinProximityMeetingEvent"),
      data: isJoinProximityMeetingEvent,
    }),
    mod.object({
      type: mod.literal("participantJoinProximityMeetingEvent"),
      data: isParticipantProximityMeetingEvent,
    }),
    mod.object({
      type: mod.literal("participantLeaveProximityMeetingEvent"),
      data: isParticipantProximityMeetingEvent,
    }),
    mod.object({
      type: mod.literal("leaveProximityMeetingEvent"),
      data: mod.undefined(),
    }),
    mod.object({ type: mod.literal("enterEvent"), data: isEnterLeaveEvent }),
    mod.object({ type: mod.literal("leaveEvent"), data: isEnterLeaveEvent }),
    mod.object({
      type: mod.literal("enterLayerEvent"),
      data: isChangeLayerEvent,
    }),
    mod.object({
      type: mod.literal("leaveLayerEvent"),
      data: isChangeLayerEvent,
    }),
    mod.object({
      type: mod.literal("enterAreaEvent"),
      data: isChangeAreaEvent,
    }),
    mod.object({
      type: mod.literal("leaveAreaEvent"),
      data: isChangeAreaEvent,
    }),
    mod.object({
      type: mod.literal("buttonClickedEvent"),
      data: isButtonClickedEvent,
    }),
    mod.object({
      type: mod.literal("remotePlayerClickedEvent"),
      data: isAddPlayerEvent,
    }),
    mod.object({
      type: mod.literal("actionsMenuActionClickedEvent"),
      data: isActionsMenuActionClickedEvent,
    }),
    mod.object({
      type: mod.literal("hasPlayerMoved"),
      data: isHasPlayerMovedEvent,
    }),
    mod.object({
      type: mod.literal("wasCameraUpdated"),
      data: isWasCameraUpdatedEvent,
    }),
    mod.object({
      type: mod.literal("menuItemClicked"),
      data: isMenuItemClickedEvent,
    }),
    mod.object({ type: mod.literal("setVariable"), data: isSetVariableEvent }),
    mod.object({
      type: mod.literal("setPlayerVariable"),
      data: isSetVariableEvent,
    }),
    mod.object({
      type: mod.literal("setSharedPlayerVariable"),
      data: isSetSharedPlayerVariableEvent,
    }),
    mod.object({
      type: mod.literal("messageTriggered"),
      data: isMessageReferenceEvent,
    }),
    mod.object({ type: mod.literal("leaveMuc"), data: isLeaveMucEvent }),
    mod.object({ type: mod.literal("joinMuc"), data: isJoinMucEvent }),
    mod.object({
      type: mod.literal("addRemotePlayer"),
      data: isAddPlayerEvent,
    }),
    mod.object({ type: mod.literal("removeRemotePlayer"), data: mod.number() }),
    mod.object({
      type: mod.literal("remotePlayerChanged"),
      data: isRemotePlayerChangedEvent,
    }),
    mod.object({ type: mod.literal("settings"), data: isSettingsEvent }),
    mod.object({
      type: mod.literal("chatVisibility"),
      data: isChatVisibilityEvent,
    }),
    mod.object({ type: mod.literal("availabilityStatus"), data: mod.number() }),
    mod.object({
      type: mod.literal("xmppSettingsMessage"),
      data: isXmppSettingsMessageEvent,
    }),
    mod.object({
      type: mod.literal("peerConnectionStatus"),
      data: mod.boolean(),
    }),
    mod.object({ type: mod.literal("comingUser"), data: isChatMessage }),
    mod.object({ type: mod.literal("addChatMessage"), data: isChatMessage }),
    mod.object({
      type: mod.literal("updateWritingStatusChatList"),
      data: mod.array(mod.nullable(mod.string())),
    }),
    mod.object({
      type: mod.literal("buttonActionBarTrigger"),
      data: isAddButtonActionBarEvent,
    }),
    mod.object({ type: mod.literal("modalCloseTrigger"), data: isModalEvent }),
  ]),
  isLookingLikeIframeEventWrapper = mod.object({
    type: mod.string(),
    data: mod.unknown().optional(),
  });
mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.number(),
  mod.undefined(),
  mod.array(isCoWebsite),
  mod.string(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.string(),
  mod.string(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.string(),
  mod.undefined(),
  mod.string(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.undefined(),
  mod.string(),
  mod.undefined(),
  mod.undefined(),
  mod.array(isUIWebsiteEvent),
  mod.string(),
  mod.array(isAddPlayerEvent),
  mod.undefined(),
  mod.string();
const isIframeAnswerEvent = (r) =>
    typeof r.type == "string" && typeof r.id == "number",
  isIframeErrorAnswerEvent = mod.object({
    id: mod.number(),
    type: mod.string(),
    error: mod.string(),
  });
function sendToWorkadventure(r) {
  window.parent.postMessage(r, "*");
}
let queryNumber = 0;
const answerPromises = new Map();
function queryWorkadventure(r) {
  return new Promise((e, t) => {
    window.parent.postMessage({ id: queryNumber, query: r }, "*"),
      answerPromises.set(queryNumber, { resolve: e, reject: t }),
      queryNumber++;
  });
}
class IframeApiContribution {}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ var extendStatics =
  function (r, e) {
    return (
      (extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (t, o) {
            t.__proto__ = o;
          }) ||
        function (t, o) {
          for (var n in o) o.hasOwnProperty(n) && (t[n] = o[n]);
        }),
      extendStatics(r, e)
    );
  };
function __extends(r, e) {
  extendStatics(r, e);
  function t() {
    this.constructor = r;
  }
  r.prototype =
    e === null ? Object.create(e) : ((t.prototype = e.prototype), new t());
}
function isFunction(r) {
  return typeof r == "function";
}
var _enable_super_gross_mode_that_will_cause_bad_things = !1,
  config = {
    Promise: void 0,
    set useDeprecatedSynchronousErrorHandling(r) {
      if (r) {
        var e = new Error();
        "" + e.stack;
      }
      _enable_super_gross_mode_that_will_cause_bad_things = r;
    },
    get useDeprecatedSynchronousErrorHandling() {
      return _enable_super_gross_mode_that_will_cause_bad_things;
    },
  };
function hostReportError(r) {
  setTimeout(function () {
    throw r;
  }, 0);
}
var empty = {
    closed: !0,
    next: function (r) {},
    error: function (r) {
      if (config.useDeprecatedSynchronousErrorHandling) throw r;
      hostReportError(r);
    },
    complete: function () {},
  },
  isArray = (function () {
    return (
      Array.isArray ||
      function (r) {
        return r && typeof r.length == "number";
      }
    );
  })();
function isObject(r) {
  return r !== null && typeof r == "object";
}
var UnsubscriptionErrorImpl = (function () {
    function r(e) {
      return (
        Error.call(this),
        (this.message = e
          ? e.length +
            ` errors occurred during unsubscription:
` +
            e.map(function (t, o) {
              return o + 1 + ") " + t.toString();
            }).join(`
  `)
          : ""),
        (this.name = "UnsubscriptionError"),
        (this.errors = e),
        this
      );
    }
    return (r.prototype = Object.create(Error.prototype)), r;
  })(),
  UnsubscriptionError = UnsubscriptionErrorImpl,
  Subscription = (function () {
    function r(e) {
      (this.closed = !1),
        (this._parentOrParents = null),
        (this._subscriptions = null),
        e && ((this._ctorUnsubscribe = !0), (this._unsubscribe = e));
    }
    return (
      (r.prototype.unsubscribe = function () {
        var e;
        if (!this.closed) {
          var t = this,
            o = t._parentOrParents,
            n = t._ctorUnsubscribe,
            i = t._unsubscribe,
            s = t._subscriptions;
          if (
            ((this.closed = !0),
            (this._parentOrParents = null),
            (this._subscriptions = null),
            o instanceof r)
          )
            o.remove(this);
          else if (o !== null)
            for (var a = 0; a < o.length; ++a) {
              var d = o[a];
              d.remove(this);
            }
          if (isFunction(i)) {
            n && (this._unsubscribe = void 0);
            try {
              i.call(this);
            } catch (p) {
              e =
                p instanceof UnsubscriptionError
                  ? flattenUnsubscriptionErrors(p.errors)
                  : [p];
            }
          }
          if (isArray(s))
            for (var a = -1, l = s.length; ++a < l; ) {
              var u = s[a];
              if (isObject(u))
                try {
                  u.unsubscribe();
                } catch (m) {
                  (e = e || []),
                    m instanceof UnsubscriptionError
                      ? (e = e.concat(flattenUnsubscriptionErrors(m.errors)))
                      : e.push(m);
                }
            }
          if (e) throw new UnsubscriptionError(e);
        }
      }),
      (r.prototype.add = function (e) {
        var t = e;
        if (!e) return r.EMPTY;
        switch (typeof e) {
          case "function":
            t = new r(e);
          case "object":
            if (t === this || t.closed || typeof t.unsubscribe != "function")
              return t;
            if (this.closed) return t.unsubscribe(), t;
            if (!(t instanceof r)) {
              var o = t;
              (t = new r()), (t._subscriptions = [o]);
            }
            break;
          default:
            throw new Error(
              "unrecognized teardown " + e + " added to Subscription."
            );
        }
        var n = t._parentOrParents;
        if (n === null) t._parentOrParents = this;
        else if (n instanceof r) {
          if (n === this) return t;
          t._parentOrParents = [n, this];
        } else if (n.indexOf(this) === -1) n.push(this);
        else return t;
        var i = this._subscriptions;
        return i === null ? (this._subscriptions = [t]) : i.push(t), t;
      }),
      (r.prototype.remove = function (e) {
        var t = this._subscriptions;
        if (t) {
          var o = t.indexOf(e);
          o !== -1 && t.splice(o, 1);
        }
      }),
      (r.EMPTY = (function (e) {
        return (e.closed = !0), e;
      })(new r())),
      r
    );
  })();
function flattenUnsubscriptionErrors(r) {
  return r.reduce(function (e, t) {
    return e.concat(t instanceof UnsubscriptionError ? t.errors : t);
  }, []);
}
var rxSubscriber = (function () {
    return typeof Symbol == "function"
      ? Symbol("rxSubscriber")
      : "@@rxSubscriber_" + Math.random();
  })(),
  Subscriber = (function (r) {
    __extends(e, r);
    function e(t, o, n) {
      var i = r.call(this) || this;
      switch (
        ((i.syncErrorValue = null),
        (i.syncErrorThrown = !1),
        (i.syncErrorThrowable = !1),
        (i.isStopped = !1),
        arguments.length)
      ) {
        case 0:
          i.destination = empty;
          break;
        case 1:
          if (!t) {
            i.destination = empty;
            break;
          }
          if (typeof t == "object") {
            t instanceof e
              ? ((i.syncErrorThrowable = t.syncErrorThrowable),
                (i.destination = t),
                t.add(i))
              : ((i.syncErrorThrowable = !0),
                (i.destination = new SafeSubscriber(i, t)));
            break;
          }
        default:
          (i.syncErrorThrowable = !0),
            (i.destination = new SafeSubscriber(i, t, o, n));
          break;
      }
      return i;
    }
    return (
      (e.prototype[rxSubscriber] = function () {
        return this;
      }),
      (e.create = function (t, o, n) {
        var i = new e(t, o, n);
        return (i.syncErrorThrowable = !1), i;
      }),
      (e.prototype.next = function (t) {
        this.isStopped || this._next(t);
      }),
      (e.prototype.error = function (t) {
        this.isStopped || ((this.isStopped = !0), this._error(t));
      }),
      (e.prototype.complete = function () {
        this.isStopped || ((this.isStopped = !0), this._complete());
      }),
      (e.prototype.unsubscribe = function () {
        this.closed ||
          ((this.isStopped = !0), r.prototype.unsubscribe.call(this));
      }),
      (e.prototype._next = function (t) {
        this.destination.next(t);
      }),
      (e.prototype._error = function (t) {
        this.destination.error(t), this.unsubscribe();
      }),
      (e.prototype._complete = function () {
        this.destination.complete(), this.unsubscribe();
      }),
      (e.prototype._unsubscribeAndRecycle = function () {
        var t = this._parentOrParents;
        return (
          (this._parentOrParents = null),
          this.unsubscribe(),
          (this.closed = !1),
          (this.isStopped = !1),
          (this._parentOrParents = t),
          this
        );
      }),
      e
    );
  })(Subscription),
  SafeSubscriber = (function (r) {
    __extends(e, r);
    function e(t, o, n, i) {
      var s = r.call(this) || this;
      s._parentSubscriber = t;
      var a,
        d = s;
      return (
        isFunction(o)
          ? (a = o)
          : o &&
            ((a = o.next),
            (n = o.error),
            (i = o.complete),
            o !== empty &&
              ((d = Object.create(o)),
              isFunction(d.unsubscribe) && s.add(d.unsubscribe.bind(d)),
              (d.unsubscribe = s.unsubscribe.bind(s)))),
        (s._context = d),
        (s._next = a),
        (s._error = n),
        (s._complete = i),
        s
      );
    }
    return (
      (e.prototype.next = function (t) {
        if (!this.isStopped && this._next) {
          var o = this._parentSubscriber;
          !config.useDeprecatedSynchronousErrorHandling || !o.syncErrorThrowable
            ? this.__tryOrUnsub(this._next, t)
            : this.__tryOrSetError(o, this._next, t) && this.unsubscribe();
        }
      }),
      (e.prototype.error = function (t) {
        if (!this.isStopped) {
          var o = this._parentSubscriber,
            n = config.useDeprecatedSynchronousErrorHandling;
          if (this._error)
            !n || !o.syncErrorThrowable
              ? (this.__tryOrUnsub(this._error, t), this.unsubscribe())
              : (this.__tryOrSetError(o, this._error, t), this.unsubscribe());
          else if (o.syncErrorThrowable)
            n
              ? ((o.syncErrorValue = t), (o.syncErrorThrown = !0))
              : hostReportError(t),
              this.unsubscribe();
          else {
            if ((this.unsubscribe(), n)) throw t;
            hostReportError(t);
          }
        }
      }),
      (e.prototype.complete = function () {
        var t = this;
        if (!this.isStopped) {
          var o = this._parentSubscriber;
          if (this._complete) {
            var n = function () {
              return t._complete.call(t._context);
            };
            !config.useDeprecatedSynchronousErrorHandling ||
            !o.syncErrorThrowable
              ? (this.__tryOrUnsub(n), this.unsubscribe())
              : (this.__tryOrSetError(o, n), this.unsubscribe());
          } else this.unsubscribe();
        }
      }),
      (e.prototype.__tryOrUnsub = function (t, o) {
        try {
          t.call(this._context, o);
        } catch (n) {
          if (
            (this.unsubscribe(), config.useDeprecatedSynchronousErrorHandling)
          )
            throw n;
          hostReportError(n);
        }
      }),
      (e.prototype.__tryOrSetError = function (t, o, n) {
        if (!config.useDeprecatedSynchronousErrorHandling)
          throw new Error("bad call");
        try {
          o.call(this._context, n);
        } catch (i) {
          return config.useDeprecatedSynchronousErrorHandling
            ? ((t.syncErrorValue = i), (t.syncErrorThrown = !0), !0)
            : (hostReportError(i), !0);
        }
        return !1;
      }),
      (e.prototype._unsubscribe = function () {
        var t = this._parentSubscriber;
        (this._context = null),
          (this._parentSubscriber = null),
          t.unsubscribe();
      }),
      e
    );
  })(Subscriber);
function canReportError(r) {
  for (; r; ) {
    var e = r,
      t = e.closed,
      o = e.destination,
      n = e.isStopped;
    if (t || n) return !1;
    o && o instanceof Subscriber ? (r = o) : (r = null);
  }
  return !0;
}
function toSubscriber(r, e, t) {
  if (r) {
    if (r instanceof Subscriber) return r;
    if (r[rxSubscriber]) return r[rxSubscriber]();
  }
  return !r && !e && !t ? new Subscriber(empty) : new Subscriber(r, e, t);
}
var observable = (function () {
  return (typeof Symbol == "function" && Symbol.observable) || "@@observable";
})();
function identity(r) {
  return r;
}
function pipeFromArray(r) {
  return r.length === 0
    ? identity
    : r.length === 1
    ? r[0]
    : function (t) {
        return r.reduce(function (o, n) {
          return n(o);
        }, t);
      };
}
var Observable = (function () {
  function r(e) {
    (this._isScalar = !1), e && (this._subscribe = e);
  }
  return (
    (r.prototype.lift = function (e) {
      var t = new r();
      return (t.source = this), (t.operator = e), t;
    }),
    (r.prototype.subscribe = function (e, t, o) {
      var n = this.operator,
        i = toSubscriber(e, t, o);
      if (
        (n
          ? i.add(n.call(i, this.source))
          : i.add(
              this.source ||
                (config.useDeprecatedSynchronousErrorHandling &&
                  !i.syncErrorThrowable)
                ? this._subscribe(i)
                : this._trySubscribe(i)
            ),
        config.useDeprecatedSynchronousErrorHandling &&
          i.syncErrorThrowable &&
          ((i.syncErrorThrowable = !1), i.syncErrorThrown))
      )
        throw i.syncErrorValue;
      return i;
    }),
    (r.prototype._trySubscribe = function (e) {
      try {
        return this._subscribe(e);
      } catch (t) {
        config.useDeprecatedSynchronousErrorHandling &&
          ((e.syncErrorThrown = !0), (e.syncErrorValue = t)),
          canReportError(e) ? e.error(t) : console.warn(t);
      }
    }),
    (r.prototype.forEach = function (e, t) {
      var o = this;
      return (
        (t = getPromiseCtor(t)),
        new t(function (n, i) {
          var s;
          s = o.subscribe(
            function (a) {
              try {
                e(a);
              } catch (d) {
                i(d), s && s.unsubscribe();
              }
            },
            i,
            n
          );
        })
      );
    }),
    (r.prototype._subscribe = function (e) {
      var t = this.source;
      return t && t.subscribe(e);
    }),
    (r.prototype[observable] = function () {
      return this;
    }),
    (r.prototype.pipe = function () {
      for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
      return e.length === 0 ? this : pipeFromArray(e)(this);
    }),
    (r.prototype.toPromise = function (e) {
      var t = this;
      return (
        (e = getPromiseCtor(e)),
        new e(function (o, n) {
          var i;
          t.subscribe(
            function (s) {
              return (i = s);
            },
            function (s) {
              return n(s);
            },
            function () {
              return o(i);
            }
          );
        })
      );
    }),
    (r.create = function (e) {
      return new r(e);
    }),
    r
  );
})();
function getPromiseCtor(r) {
  if ((r || (r = config.Promise || Promise), !r))
    throw new Error("no Promise impl found");
  return r;
}
var ObjectUnsubscribedErrorImpl = (function () {
    function r() {
      return (
        Error.call(this),
        (this.message = "object unsubscribed"),
        (this.name = "ObjectUnsubscribedError"),
        this
      );
    }
    return (r.prototype = Object.create(Error.prototype)), r;
  })(),
  ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl,
  SubjectSubscription = (function (r) {
    __extends(e, r);
    function e(t, o) {
      var n = r.call(this) || this;
      return (n.subject = t), (n.subscriber = o), (n.closed = !1), n;
    }
    return (
      (e.prototype.unsubscribe = function () {
        if (!this.closed) {
          this.closed = !0;
          var t = this.subject,
            o = t.observers;
          if (
            ((this.subject = null),
            !(!o || o.length === 0 || t.isStopped || t.closed))
          ) {
            var n = o.indexOf(this.subscriber);
            n !== -1 && o.splice(n, 1);
          }
        }
      }),
      e
    );
  })(Subscription),
  SubjectSubscriber = (function (r) {
    __extends(e, r);
    function e(t) {
      var o = r.call(this, t) || this;
      return (o.destination = t), o;
    }
    return e;
  })(Subscriber),
  Subject = (function (r) {
    __extends(e, r);
    function e() {
      var t = r.call(this) || this;
      return (
        (t.observers = []),
        (t.closed = !1),
        (t.isStopped = !1),
        (t.hasError = !1),
        (t.thrownError = null),
        t
      );
    }
    return (
      (e.prototype[rxSubscriber] = function () {
        return new SubjectSubscriber(this);
      }),
      (e.prototype.lift = function (t) {
        var o = new AnonymousSubject(this, this);
        return (o.operator = t), o;
      }),
      (e.prototype.next = function (t) {
        if (this.closed) throw new ObjectUnsubscribedError();
        if (!this.isStopped)
          for (
            var o = this.observers, n = o.length, i = o.slice(), s = 0;
            s < n;
            s++
          )
            i[s].next(t);
      }),
      (e.prototype.error = function (t) {
        if (this.closed) throw new ObjectUnsubscribedError();
        (this.hasError = !0), (this.thrownError = t), (this.isStopped = !0);
        for (
          var o = this.observers, n = o.length, i = o.slice(), s = 0;
          s < n;
          s++
        )
          i[s].error(t);
        this.observers.length = 0;
      }),
      (e.prototype.complete = function () {
        if (this.closed) throw new ObjectUnsubscribedError();
        this.isStopped = !0;
        for (
          var t = this.observers, o = t.length, n = t.slice(), i = 0;
          i < o;
          i++
        )
          n[i].complete();
        this.observers.length = 0;
      }),
      (e.prototype.unsubscribe = function () {
        (this.isStopped = !0), (this.closed = !0), (this.observers = null);
      }),
      (e.prototype._trySubscribe = function (t) {
        if (this.closed) throw new ObjectUnsubscribedError();
        return r.prototype._trySubscribe.call(this, t);
      }),
      (e.prototype._subscribe = function (t) {
        if (this.closed) throw new ObjectUnsubscribedError();
        return this.hasError
          ? (t.error(this.thrownError), Subscription.EMPTY)
          : this.isStopped
          ? (t.complete(), Subscription.EMPTY)
          : (this.observers.push(t), new SubjectSubscription(this, t));
      }),
      (e.prototype.asObservable = function () {
        var t = new Observable();
        return (t.source = this), t;
      }),
      (e.create = function (t, o) {
        return new AnonymousSubject(t, o);
      }),
      e
    );
  })(Observable),
  AnonymousSubject = (function (r) {
    __extends(e, r);
    function e(t, o) {
      var n = r.call(this) || this;
      return (n.destination = t), (n.source = o), n;
    }
    return (
      (e.prototype.next = function (t) {
        var o = this.destination;
        o && o.next && o.next(t);
      }),
      (e.prototype.error = function (t) {
        var o = this.destination;
        o && o.error && this.destination.error(t);
      }),
      (e.prototype.complete = function () {
        var t = this.destination;
        t && t.complete && this.destination.complete();
      }),
      (e.prototype._subscribe = function (t) {
        var o = this.source;
        return o ? this.source.subscribe(t) : Subscription.EMPTY;
      }),
      e
    );
  })(Subject);
const chatStream = new Subject();
class WorkadventureChatCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", [
      apiCallback({
        callback: (t) => {
          chatStream.next(t.message);
        },
        type: "userInputChat",
      }),
    ]);
  }
  open() {
    sendToWorkadventure({ type: "openChat", data: void 0 });
  }
  close() {
    sendToWorkadventure({ type: "closeChat", data: void 0 });
  }
  sendChatMessage(t, o) {
    sendToWorkadventure({
      type: "chat",
      data: { message: t, author: o != null ? o : "System" },
    });
  }
  onChatMessage(t) {
    chatStream.subscribe(t);
  }
}
const chat = new WorkadventureChatCommands();
class CoWebsite {
  constructor(e) {
    this.id = e;
  }
  close() {
    return queryWorkadventure({ type: "closeCoWebsite", data: this.id });
  }
}
class WorkadventureNavigationCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", []);
  }
  openTab(t) {
    sendToWorkadventure({ type: "openTab", data: { url: t } });
  }
  goToPage(t) {
    sendToWorkadventure({ type: "goToPage", data: { url: t } });
  }
  goToRoom(t) {
    sendToWorkadventure({ type: "loadPage", data: { url: t } });
  }
  async openCoWebSite(t, o, n, i, s, a, d) {
    const l = await queryWorkadventure({
      type: "openCoWebsite",
      data: {
        url: t,
        allowApi: o,
        allowPolicy: n,
        widthPercent: i,
        position: s,
        closable: a,
        lazy: d,
      },
    });
    return new CoWebsite(l.id);
  }
  async getCoWebSites() {
    return (
      await queryWorkadventure({ type: "getCoWebsites", data: void 0 })
    ).map((o) => new CoWebsite(o.id));
  }
  closeCoWebSite() {
    return queryWorkadventure({ type: "closeCoWebsites", data: void 0 });
  }
}
const nav = new WorkadventureNavigationCommands();
class WorkadventureControlsCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", []);
  }
  disablePlayerControls() {
    sendToWorkadventure({ type: "disablePlayerControls", data: void 0 });
  }
  restorePlayerControls() {
    sendToWorkadventure({ type: "restorePlayerControls", data: void 0 });
  }
  turnOffMicrophone() {
    sendToWorkadventure({ type: "turnOffMicrophone", data: void 0 });
  }
  turnOffWebcam() {
    sendToWorkadventure({ type: "turnOffWebcam", data: void 0 });
  }
  disableMicrophone() {
    sendToWorkadventure({ type: "disableMicrophone", data: void 0 });
  }
  restoreMicrophone() {
    sendToWorkadventure({ type: "restoreMicrophone", data: void 0 });
  }
  disableWebcam() {
    sendToWorkadventure({ type: "disableWebcam", data: void 0 });
  }
  restoreWebcam() {
    sendToWorkadventure({ type: "restoreWebcam", data: void 0 });
  }
  disablePlayerProximityMeeting() {
    sendToWorkadventure({
      type: "disablePlayerProximityMeeting",
      data: void 0,
    });
  }
  restorePlayerProximityMeeting() {
    sendToWorkadventure({
      type: "restorePlayerProximityMeeting",
      data: void 0,
    });
  }
}
const controls = new WorkadventureControlsCommands();
class Popup {
  constructor(e) {
    this.id = e;
  }
  close() {
    sendToWorkadventure({ type: "closePopup", data: { popupId: this.id } });
  }
}
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (r) => {
    const e = (Math.random() * 16) | 0;
    return (r === "x" ? e : (e & 3) | 8).toString(16);
  });
}
class ActionMessage {
  constructor(e, t) {
    c(this, "uuid");
    c(this, "type");
    c(this, "message");
    c(this, "callback");
    var o;
    (this.onRemove = t),
      (this.uuid = uuidv4()),
      (this.message = e.message),
      (this.type = (o = e.type) != null ? o : "message"),
      (this.callback = e.callback),
      this.create().catch((n) => console.error(n));
  }
  async create() {
    await queryWorkadventure({
      type: triggerActionMessage,
      data: { message: this.message, type: this.type, uuid: this.uuid },
    });
  }
  async remove() {
    await queryWorkadventure({
      type: removeActionMessage,
      data: { uuid: this.uuid },
    }),
      this.onRemove();
  }
  triggerCallback() {
    this.callback();
  }
}
class Menu {
  constructor(e) {
    this.menuName = e;
  }
  remove() {
    sendToWorkadventure({
      type: "unregisterMenu",
      data: { name: this.menuName },
    });
  }
}
class UIWebsitePositionInternal {
  constructor(e, t) {
    c(this, "website");
    c(this, "_vertical");
    c(this, "_horizontal");
    (this.website = e),
      (this._vertical = t.vertical),
      (this._horizontal = t.horizontal);
  }
  get vertical() {
    return this._vertical;
  }
  set vertical(e) {
    (this._vertical = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.website.id,
          position: { vertical: this._vertical, horizontal: this._horizontal },
        },
      });
  }
  get horizontal() {
    return this._horizontal;
  }
  set horizontal(e) {
    (this._horizontal = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.website.id,
          position: { vertical: this._vertical, horizontal: this._horizontal },
        },
      });
  }
}
class UIWebsiteSizeInternal {
  constructor(e, t) {
    c(this, "website");
    c(this, "_height");
    c(this, "_width");
    (this.website = e), (this._height = t.height), (this._width = t.width);
  }
  get height() {
    return this._height;
  }
  set height(e) {
    (this._height = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.website.id,
          size: { height: this._height, width: this._width },
        },
      });
  }
  get width() {
    return this._height;
  }
  set width(e) {
    (this._width = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.website.id,
          size: { height: this._height, width: this._width },
        },
      });
  }
}
class UIWebsiteMarginInternal {
  constructor(e, t) {
    c(this, "website");
    c(this, "_top");
    c(this, "_bottom");
    c(this, "_left");
    c(this, "_right");
    (this.website = e),
      (this._top = t.top),
      (this._bottom = t.bottom),
      (this._left = t.left),
      (this._right = t.right);
  }
  get top() {
    return this._top;
  }
  set top(e) {
    (this._top = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: { id: this.website.id, margin: { top: this._top } },
      });
  }
  get bottom() {
    return this._bottom;
  }
  set bottom(e) {
    (this._bottom = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: { id: this.website.id, margin: { bottom: this._bottom } },
      });
  }
  get left() {
    return this._left;
  }
  set left(e) {
    (this._left = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: { id: this.website.id, margin: { left: this._left } },
      });
  }
  get right() {
    return this._right;
  }
  set right(e) {
    (this._right = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: { id: this.website.id, margin: { right: this._right } },
      });
  }
}
class UIWebsite {
  constructor(e) {
    c(this, "id");
    c(this, "_url");
    c(this, "_visible");
    c(this, "_allowPolicy");
    c(this, "_allowApi");
    c(this, "_position");
    c(this, "_size");
    c(this, "_margin");
    var t, o, n, i;
    (this.id = e.id),
      (this._url = e.url),
      (this._visible = (t = e.visible) != null ? t : !0),
      (this._allowPolicy = (o = e.allowPolicy) != null ? o : ""),
      (this._allowApi = (n = e.allowApi) != null ? n : !1),
      (this._position = new UIWebsitePositionInternal(this, e.position)),
      (this._size = new UIWebsiteSizeInternal(this, e.size)),
      (this._margin = new UIWebsiteMarginInternal(
        this,
        (i = e.margin) != null ? i : {}
      ));
  }
  get url() {
    return this._url;
  }
  set url(e) {
    (this._url = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: { id: this.id, url: this._url },
      });
  }
  get visible() {
    return this._visible;
  }
  set visible(e) {
    (this._visible = e),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: { id: this.id, visible: this._visible },
      });
  }
  get allowPolicy() {
    return this._allowPolicy;
  }
  get allowApi() {
    return this._allowApi;
  }
  get position() {
    return this._position;
  }
  set position(e) {
    (this._position = new UIWebsitePositionInternal(this, e)),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.id,
          position: {
            vertical: this._position.vertical,
            horizontal: this._position.horizontal,
          },
        },
      });
  }
  get size() {
    return this._size;
  }
  set size(e) {
    (this._size = new UIWebsiteSizeInternal(this, e)),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.id,
          size: { height: this._size.height, width: this._size.width },
        },
      });
  }
  get margin() {
    return this._margin;
  }
  set margin(e) {
    (this._margin = new UIWebsiteMarginInternal(this, e)),
      sendToWorkadventure({
        type: "modifyUIWebsite",
        data: {
          id: this.id,
          margin: {
            top: this._margin.top,
            bottom: this._margin.bottom,
            left: this._margin.left,
            right: this._margin.right,
          },
        },
      });
  }
  close() {
    return queryWorkadventure({ type: "closeUIWebsite", data: this.id });
  }
}
class UIWebsiteCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", []);
  }
  async open(t) {
    const o = await queryWorkadventure({ type: "openUIWebsite", data: t });
    return new UIWebsite(o);
  }
  async getAll() {
    return (
      await queryWorkadventure({ type: "getUIWebsites", data: void 0 })
    ).map((o) => new UIWebsite(o));
  }
  async getById(t) {
    const o = await queryWorkadventure({ type: "getUIWebsiteById", data: t });
    return new UIWebsite(o);
  }
}
const website$1 = new UIWebsiteCommands(),
  remotePlayers = new Map();
class RemotePlayer {
  constructor(e) {
    c(this, "_playerId");
    c(this, "_name");
    c(this, "_userUuid");
    c(this, "_availabilityStatus");
    c(this, "_outlineColor");
    c(this, "_position");
    c(this, "_variables");
    c(this, "_variablesSubjects", new Map());
    c(this, "state");
    c(this, "actions", new Map());
    c(this, "_position$", new Subject());
    c(this, "position$", this._position$.asObservable());
    (this._playerId = e.playerId),
      (this._name = e.name),
      (this._userUuid = e.userUuid),
      (this._availabilityStatus = e.availabilityStatus),
      (this._outlineColor = e.outlineColor),
      (this._position = e.position),
      (this._variables = e.variables);
    const t = this._variablesSubjects,
      o = this._variables;
    this.state = new Proxy(
      {
        onVariableChange(n) {
          let i = t.get(n);
          return (
            i === void 0 && ((i = new Subject()), t.set(n, i)), i.asObservable()
          );
        },
      },
      {
        get(n, i, s) {
          return i in n ? Reflect.get(n, i, s) : o.get(i.toString());
        },
        has(n, i) {
          return i in n ? !0 : o.has(i.toString());
        },
      }
    );
  }
  get playerId() {
    return this._playerId;
  }
  get name() {
    return this._name;
  }
  get uuid() {
    return this._userUuid;
  }
  get outlineColor() {
    return this._outlineColor;
  }
  get position() {
    return this._position;
  }
  set position(e) {
    (this._position = e), this._position$.next(e);
  }
  destroy() {
    this._position$.complete();
    for (const e of this._variablesSubjects.values()) e.complete();
  }
  setVariable(e, t) {
    this._variables.set(e, t);
    const o = this._variablesSubjects.get(e);
    o && o.next(t);
  }
  addAction(e, t) {
    const o = new ActionsMenuAction(this, e, t);
    return (
      this.actions.set(e, o),
      sendToWorkadventure({
        type: "addActionsMenuKeyToRemotePlayer",
        data: { id: this._playerId, actionKey: e },
      }),
      o
    );
  }
  callAction(e) {
    const t = this.actions.get(e);
    t && t.call();
  }
  removeAction(e) {
    this.actions.delete(e),
      sendToWorkadventure({
        type: "removeActionsMenuKeyFromRemotePlayer",
        data: { id: this._playerId, actionKey: e },
      });
  }
}
class WorkadventureModalCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "_closeCallback");
    c(this, "callbacks", [
      apiCallback({
        type: "modalCloseTrigger",
        callback: (t) => {
          this._closeCallback && this._closeCallback(t);
        },
      }),
    ]);
  }
  openModal(t, o) {
    (this._closeCallback = o),
      sendToWorkadventure({ type: "openModal", data: t });
  }
  closeModal() {
    (this._closeCallback = void 0),
      sendToWorkadventure({ type: "closeModal", data: void 0 });
  }
}
const modal = new WorkadventureModalCommands();
class WorkAdventureButtonActionBarCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "_callbacks", new Map());
    c(this, "callbacks", [
      apiCallback({
        type: "buttonActionBarTrigger",
        callback: (t) => {
          this._callbacks.has(t.id) && this._callbacks.get(t.id)(t);
        },
      }),
    ]);
  }
  addButton(t) {
    t.callback != null && this._callbacks.set(t.id, t.callback);
    const o = isAddClassicButtonActionBarEvent.safeParse(t);
    o.success &&
      o.data.type === "button" &&
      sendToWorkadventure({
        type: "addButtonActionBar",
        data: { id: o.data.id, label: o.data.label, type: o.data.type },
      });
    const n = isAddActionButtonActionBarEvent.safeParse(t);
    n.success &&
      n.data.type === "action" &&
      sendToWorkadventure({
        type: "addButtonActionBar",
        data: {
          id: n.data.id,
          type: n.data.type,
          imageSrc: n.data.imageSrc,
          toolTip: n.data.toolTip,
        },
      });
  }
  removeButton(t) {
    this._callbacks.delete(t),
      sendToWorkadventure({ type: "removeButtonActionBar", data: { id: t } });
  }
}
const buttonActionBar = new WorkAdventureButtonActionBarCommands();
class WorkadventureBannerCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", []);
  }
  openBanner(t) {
    sendToWorkadventure({ type: "openBanner", data: t });
  }
  closeBanner() {
    sendToWorkadventure({ type: "closeBanner" });
  }
}
const banner = new WorkadventureBannerCommands();
let popupId = 0;
const popups = new Map(),
  popupCallbacks = new Map(),
  menus = new Map(),
  menuCallbacks = new Map(),
  actionMessages = new Map();
class ActionsMenuAction {
  constructor(e, t, o) {
    c(this, "remotePlayer");
    c(this, "key");
    c(this, "callback");
    (this.remotePlayer = e), (this.key = t), (this.callback = o);
  }
  call() {
    this.callback();
  }
  remove() {
    this.remotePlayer.removeAction(this.key);
  }
}
class WorkAdventureUiCommands extends IframeApiContribution {
  constructor() {
    super();
    c(this, "_onRemotePlayerClicked");
    c(this, "onRemotePlayerClicked");
    c(this, "currentlyClickedRemotePlayer");
    c(this, "callbacks", [
      apiCallback({
        type: "buttonClickedEvent",
        callback: (t) => {
          var i;
          const o =
              (i = popupCallbacks.get(t.popupId)) == null
                ? void 0
                : i.get(t.buttonId),
            n = popups.get(t.popupId);
          if (n === void 0)
            throw new Error('Could not find popup with ID "' + t.popupId + '"');
          o && o(n);
        },
      }),
      apiCallback({
        type: "menuItemClicked",
        callback: (t) => {
          const o = menuCallbacks.get(t.menuItem);
          if (menus.get(t.menuItem) === void 0)
            throw new Error('Could not find menu named "' + t.menuItem + '"');
          o && o(t.menuItem);
        },
      }),
      apiCallback({
        type: "messageTriggered",
        callback: (t) => {
          const o = actionMessages.get(t.uuid);
          o && o.triggerCallback();
        },
      }),
      apiCallback({
        type: "remotePlayerClickedEvent",
        callback: (t) => {
          const o = new RemotePlayer(t);
          (this.currentlyClickedRemotePlayer = o),
            this._onRemotePlayerClicked.next(o);
        },
      }),
      apiCallback({
        type: "actionsMenuActionClickedEvent",
        callback: (t) => {
          var o;
          (o = this.currentlyClickedRemotePlayer) == null ||
            o.callAction(t.actionName);
        },
      }),
    ]);
    (this._onRemotePlayerClicked = new Subject()),
      (this.onRemotePlayerClicked = this._onRemotePlayerClicked.asObservable());
  }
  opup(t, o, n) {
    popupId+openP;
    const i = new Popup(popupId),
      s = new Map();
    popupCallbacks.set(popupId, s);
    let a = 0;
    for (const d of n) {
      const l = d.callback;
      l &&
        s.set(a, () => {
          l(i);
        }),
        a++;
    }
    return (
      sendToWorkadventure({
        type: "openPopup",
        data: {
          popupId,
          targetObject: t,
          message: o,
          buttons: n.map((d) => ({ label: d.label, className: d.className })),
        },
      }),
      popups.set(popupId, i),
      i
    );
  }
  registerMenuCommand(t, o) {
    const n = new Menu(t);
    if (typeof o == "function")
      menuCallbacks.set(t, o),
        sendToWorkadventure({
          type: "registerMenu",
          data: { name: t, options: { allowApi: !1 } },
        });
    else if (
      ((o.allowApi = o.allowApi === void 0 ? o.iframe !== void 0 : o.allowApi),
      o.iframe !== void 0)
    )
      sendToWorkadventure({
        type: "registerMenu",
        data: { name: t, iframe: o.iframe, options: { allowApi: o.allowApi } },
      });
    else if (o.callback !== void 0)
      menuCallbacks.set(t, o.callback),
        sendToWorkadventure({
          type: "registerMenu",
          data: { name: t, options: { allowApi: o.allowApi } },
        });
    else
      throw new Error(
        "When adding a menu with WA.ui.registerMenuCommand, you must pass either an iframe or a callback"
      );
    return menus.set(t, n), n;
  }
  addActionsMenuKeyToRemotePlayer(t, o) {
    sendToWorkadventure({
      type: "addActionsMenuKeyToRemotePlayer",
      data: { id: t, actionKey: o },
    });
  }
  removeActionsMenuKeyFromRemotePlayer(t, o) {
    sendToWorkadventure({
      type: "removeActionsMenuKeyFromRemotePlayer",
      data: { id: t, actionKey: o },
    });
  }
  displayBubble() {
    sendToWorkadventure({ type: "displayBubble", data: void 0 });
  }
  removeBubble() {
    sendToWorkadventure({ type: "removeBubble", data: void 0 });
  }
  displayActionMessage(t) {
    const o = new ActionMessage(t, () => {
      actionMessages.delete(o.uuid);
    });
    return actionMessages.set(o.uuid, o), o;
  }
  get website() {
    return website$1;
  }
  get modal() {
    return modal;
  }
  get actionBar() {
    return buttonActionBar;
  }
  get banner() {
    return banner;
  }
}
const ui = new WorkAdventureUiCommands();
class Sound {
  constructor(e) {
    (this.url = e),
      sendToWorkadventure({ type: "loadSound", data: { url: this.url } });
  }
  play(e) {
    return (
      sendToWorkadventure({
        type: "playSound",
        data: { url: this.url, config: e },
      }),
      this.url
    );
  }
  stop() {
    return (
      sendToWorkadventure({ type: "stopSound", data: { url: this.url } }),
      this.url
    );
  }
}
class WorkadventureSoundCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", []);
  }
  loadSound(t) {
    return new Sound(t);
  }
}
const sound = new WorkadventureSoundCommands();
class EmbeddedWebsite {
  constructor(e) {
    c(this, "name");
    c(this, "_url");
    c(this, "_visible");
    c(this, "_position");
    c(this, "_scale");
    var t, o;
    (this.config = e),
      (this.name = e.name),
      (this._url = e.url),
      (this._visible = (t = e.visible) != null ? t : !0),
      (this._position = e.position),
      (this._scale = (o = e.scale) != null ? o : 1);
  }
  get url() {
    return this._url;
  }
  set url(e) {
    (this._url = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, url: this._url },
      });
  }
  get visible() {
    return this._visible;
  }
  set visible(e) {
    (this._visible = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, visible: this._visible },
      });
  }
  get x() {
    return this._position.x;
  }
  set x(e) {
    (this._position.x = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, x: this._position.x },
      });
  }
  get y() {
    return this._position.y;
  }
  set y(e) {
    (this._position.y = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, y: this._position.y },
      });
  }
  get width() {
    return this._position.width;
  }
  set width(e) {
    (this._position.width = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, width: this._position.width },
      });
  }
  get height() {
    return this._position.height;
  }
  set height(e) {
    (this._position.height = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, height: this._position.height },
      });
  }
  get scale() {
    return this._scale;
  }
  set scale(e) {
    (this._scale = e),
      sendToWorkadventure({
        type: "modifyEmbeddedWebsite",
        data: { name: this.name, scale: this._scale },
      });
  }
}
class WorkadventureRoomWebsiteCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", []);
  }
  async get(t) {
    const o = await queryWorkadventure({ type: "getEmbeddedWebsite", data: t });
    return new EmbeddedWebsite(o);
  }
  create(t) {
    return (
      queryWorkadventure({ type: "createEmbeddedWebsite", data: t }).catch(
        (o) => {
          console.error(o);
        }
      ),
      new EmbeddedWebsite(t)
    );
  }
  async delete(t) {
    return await queryWorkadventure({ type: "deleteEmbeddedWebsite", data: t });
  }
}
const website = new WorkadventureRoomWebsiteCommands();
class Area {
  constructor(e) {
    c(this, "config");
    c(this, "name");
    c(this, "type", "area");
    c(this, "class", "area");
    c(this, "_x");
    c(this, "_y");
    c(this, "_width");
    c(this, "_height");
    (this.config = e),
      (this.name = e.name),
      (this._x = e.x),
      (this._y = e.y),
      (this._width = e.width),
      (this._height = e.height);
  }
  setProperty(e, t) {
    sendToWorkadventure({
      type: "setAreaProperty",
      data: { areaName: this.name, propertyName: e, propertyValue: t },
    });
  }
  get x() {
    return this._x;
  }
  set x(e) {
    (this._x = e),
      sendToWorkadventure({
        type: "modifyArea",
        data: { name: this.name, x: this._x },
      });
  }
  set y(e) {
    (this._y = e),
      sendToWorkadventure({
        type: "modifyArea",
        data: { name: this.name, y: this._y },
      });
  }
  get y() {
    return this._y;
  }
  set width(e) {
    (this._width = e),
      sendToWorkadventure({
        type: "modifyArea",
        data: { name: this.name, width: this._width },
      });
  }
  get width() {
    return this._width;
  }
  set height(e) {
    (this._height = e),
      sendToWorkadventure({
        type: "modifyArea",
        data: { name: this.name, height: this._height },
      });
  }
  get height() {
    return this._height;
  }
}
const enterAreaStreams = new Map(),
  leaveAreaStreams = new Map();
class WorkadventureAreaCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", [
      apiCallback({
        type: "enterAreaEvent",
        callback: (t) => {
          var o;
          (o = enterAreaStreams.get(t.name)) == null || o.next();
        },
      }),
      apiCallback({
        type: "leaveAreaEvent",
        callback: (t) => {
          var o;
          (o = leaveAreaStreams.get(t.name)) == null || o.next();
        },
      }),
    ]);
  }
  create(t) {
    return queryWorkadventure({ type: "createArea", data: t }), new Area(t);
  }
  async get(t) {
    const o = await queryWorkadventure({ type: "getArea", data: t });
    return new Area(o);
  }
  async delete(t) {
    await queryWorkadventure({ type: "deleteArea", data: t }),
      enterAreaStreams.delete(t),
      leaveAreaStreams.delete(t);
  }
  onEnter(t) {
    let o = enterAreaStreams.get(t);
    return (
      o === void 0 && ((o = new Subject()), enterAreaStreams.set(t, o)),
      o.asObservable()
    );
  }
  onLeave(t) {
    let o = leaveAreaStreams.get(t);
    return (
      o === void 0 && ((o = new Subject()), leaveAreaStreams.set(t, o)),
      o.asObservable()
    );
  }
}
const area = new WorkadventureAreaCommands(),
  enterStreams = new Map(),
  leaveStreams = new Map(),
  enterLayerStreams = new Map(),
  leaveLayerStreams = new Map();
let roomId;
const setRoomId = (r) => {
  roomId = r;
};
let mapURL;
const setMapURL = (r) => {
  mapURL = r;
};
class WorkadventureRoomCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", [
      apiCallback({
        callback: (t) => {
          var o;
          (o = enterStreams.get(t.name)) == null || o.next();
        },
        type: "enterEvent",
      }),
      apiCallback({
        type: "leaveEvent",
        callback: (t) => {
          var o;
          (o = leaveStreams.get(t.name)) == null || o.next();
        },
      }),
      apiCallback({
        type: "enterLayerEvent",
        callback: (t) => {
          var o;
          (o = enterLayerStreams.get(t.name)) == null || o.next();
        },
      }),
      apiCallback({
        type: "leaveLayerEvent",
        callback: (t) => {
          var o;
          (o = leaveLayerStreams.get(t.name)) == null || o.next();
        },
      }),
    ]);
  }
  onEnterZone(t, o) {
    let n = enterStreams.get(t);
    n === void 0 && ((n = new Subject()), enterStreams.set(t, n)),
      n.subscribe(o);
  }
  onLeaveZone(t, o) {
    let n = leaveStreams.get(t);
    n === void 0 && ((n = new Subject()), leaveStreams.set(t, n)),
      n.subscribe(o);
  }
  onEnterLayer(t) {
    let o = enterLayerStreams.get(t);
    return (
      o === void 0 && ((o = new Subject()), enterLayerStreams.set(t, o)),
      o.asObservable()
    );
  }
  onLeaveLayer(t) {
    let o = leaveLayerStreams.get(t);
    return (
      o === void 0 && ((o = new Subject()), leaveLayerStreams.set(t, o)),
      o.asObservable()
    );
  }
  showLayer(t) {
    sendToWorkadventure({ type: "showLayer", data: { name: t } });
  }
  hideLayer(t) {
    sendToWorkadventure({ type: "hideLayer", data: { name: t } });
  }
  setProperty(t, o, n) {
    sendToWorkadventure({
      type: "setProperty",
      data: { layerName: t, propertyName: o, propertyValue: n },
    });
  }
  async getTiledMap() {
    return (await queryWorkadventure({ type: "getMapData", data: void 0 }))
      .data;
  }
  setTiles(t) {
    sendToWorkadventure({ type: "setTiles", data: t });
  }
  get id() {
    if (roomId === void 0)
      throw new Error(
        "Room id not initialized yet. You should call WA.room.id within a WA.onInit callback."
      );
    return roomId;
  }
  get mapURL() {
    if (mapURL === void 0)
      throw new Error(
        "mapURL is not initialized yet. You should call WA.room.mapURL within a WA.onInit callback."
      );
    return mapURL;
  }
  async loadTileset(t) {
    return await queryWorkadventure({ type: "loadTileset", data: { url: t } });
  }
  get website() {
    return website;
  }
  get area() {
    return area;
  }
}
const room = new WorkadventureRoomCommands();
class AbstractWorkadventureStateCommands {
  constructor() {
    c(this, "setVariableResolvers", new Subject());
    c(this, "variables", new Map());
    c(this, "variableSubscribers", new Map());
    this.setVariableResolvers.subscribe((e) => {
      this.variables.set(e.key, e.value);
      const t = this.variableSubscribers.get(e.key);
      t !== void 0 && t.next(e.value);
    });
  }
  initVariables(e) {
    for (const [t, o] of e.entries())
      this.variables.has(t) || this.variables.set(t, o);
  }
  loadVariable(e) {
    return this.variables.get(e);
  }
  hasVariable(e) {
    return this.variables.has(e);
  }
  onVariableChange(e) {
    let t = this.variableSubscribers.get(e);
    return (
      t === void 0 && ((t = new Subject()), this.variableSubscribers.set(e, t)),
      t.asObservable()
    );
  }
}
class WorkadventureStateCommands extends AbstractWorkadventureStateCommands {
  constructor() {
    super();
    c(this, "callbacks", [
      apiCallback({
        type: "setVariable",
        callback: (t) => {
          this.setVariableResolvers.next(t);
        },
      }),
    ]);
  }
  saveVariable(t, o) {
    return (
      this.variables.set(t, o),
      queryWorkadventure({ type: "setVariable", data: { key: t, value: o } })
    );
  }
}
function createState() {
  return new Proxy(new WorkadventureStateCommands(), {
    get(r, e, t) {
      return e in r ? Reflect.get(r, e, t) : r.loadVariable(e.toString());
    },
    set(r, e, t, o) {
      return r.saveVariable(e.toString(), t).catch((n) => console.error(n)), !0;
    },
    has(r, e) {
      return e in r ? !0 : r.hasVariable(e.toString());
    },
  });
}
class WorkadventurePlayerStateCommands extends AbstractWorkadventureStateCommands {
  constructor() {
    super();
    c(this, "callbacks", [
      apiCallback({
        type: "setPlayerVariable",
        callback: (t) => {
          this.setVariableResolvers.next(t);
        },
      }),
    ]);
  }
  saveVariable(t, o, n) {
    var s, a, d, l;
    if (n && n.ttl !== void 0 && !n.persist)
      throw new Error(
        "A variable that has a ttl set must be persisted with 'persist = true'"
      );
    if (n && n.scope === "world" && !n.persist)
      throw new Error(
        "A variable that has a 'world' scope must be persisted with 'persist = true'"
      );
    this.variables.set(t, o);
    const i = this.variableSubscribers.get(t);
    return (
      i && i.next(o),
      queryWorkadventure({
        type: "setPlayerVariable",
        data: {
          key: t,
          value: o,
          public: (s = n == null ? void 0 : n.public) != null ? s : !1,
          ttl: (a = n == null ? void 0 : n.ttl) != null ? a : void 0,
          persist: (d = n == null ? void 0 : n.persist) != null ? d : !0,
          scope: (l = n == null ? void 0 : n.scope) != null ? l : "world",
        },
      })
    );
  }
}
const playerState = new Proxy(new WorkadventurePlayerStateCommands(), {
  get(r, e, t) {
    return e in r ? Reflect.get(r, e, t) : r.loadVariable(e.toString());
  },
  set(r, e, t, o) {
    return r.saveVariable(e.toString(), t).catch((n) => console.error(n)), !0;
  },
  has(r, e) {
    return e in r ? !0 : r.hasVariable(e.toString());
  },
});
let joinStream, participantJoinStream, participantLeaveStream, leaveStream;
class WorkadventureProximityMeetingCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", [
      apiCallback({
        type: "joinProximityMeetingEvent",
        callback: (t) => {
          joinStream == null ||
            joinStream.next(t.users.map((o) => new RemotePlayer(o)));
        },
      }),
      apiCallback({
        type: "participantJoinProximityMeetingEvent",
        callback: (t) => {
          participantJoinStream == null ||
            participantJoinStream.next(new RemotePlayer(t.user));
        },
      }),
      apiCallback({
        type: "participantLeaveProximityMeetingEvent",
        callback: (t) => {
          participantLeaveStream == null ||
            participantLeaveStream.next(new RemotePlayer(t.user));
        },
      }),
      apiCallback({
        type: "leaveProximityMeetingEvent",
        callback: () => {
          leaveStream == null || leaveStream.next();
        },
      }),
    ]);
  }
  onJoin() {
    return joinStream === void 0 && (joinStream = new Subject()), joinStream;
  }
  onParticipantJoin() {
    return (
      participantJoinStream === void 0 &&
        (participantJoinStream = new Subject()),
      participantJoinStream
    );
  }
  onParticipantLeave() {
    return (
      participantLeaveStream === void 0 &&
        (participantLeaveStream = new Subject()),
      participantLeaveStream
    );
  }
  onLeave() {
    return leaveStream === void 0 && (leaveStream = new Subject()), leaveStream;
  }
}
const proximityMeeting = new WorkadventureProximityMeetingCommands(),
  moveStream$1 = new Subject();
let playerName;
const setPlayerName = (r) => {
  playerName = r;
};
let playerLanguage;
const setPlayerLanguage = (r) => {
  playerLanguage = r;
};
let tags;
const setTags = (r) => {
  tags = r;
};
let userRoomToken;
const setUserRoomToken = (r) => {
  userRoomToken = r;
};
let uuid;
const setUuid = (r) => {
  uuid = r;
};
let isLogged;
const setIsLogged = (r) => {
  isLogged = r === !0;
};
class WorkadventurePlayerCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "state", playerState);
    c(this, "callbacks", [
      apiCallback({
        type: "hasPlayerMoved",
        callback: (t) => {
          moveStream$1.next(t);
        },
      }),
    ]);
  }
  get name() {
    if (playerName === void 0)
      throw new Error(
        "Player name not initialized yet. You should call WA.player.name within a WA.onInit callback."
      );
    return playerName;
  }
  get id() {
    if (uuid === void 0)
      throw new Error(
        "Player id not initialized yet. You should call WA.player.id within a WA.onInit callback."
      );
    return uuid;
  }
  get playerId() {
    throw new Error(
      "Player id not initialized yet. You should call WA.player.playerId within a WA.onInit callback."
    );
  }
  get uuid() {
    if (uuid === void 0)
      throw new Error(
        "Player id not initialized yet. You should call WA.player.uuid within a WA.onInit callback."
      );
    return uuid;
  }
  get language() {
    if (playerLanguage === void 0)
      throw new Error(
        "Player language not initialized yet. You should call WA.player.language within a WA.onInit callback."
      );
    return playerLanguage;
  }
  get tags() {
    if (tags === void 0)
      throw new Error(
        "Tags not initialized yet. You should call WA.player.tags within a WA.onInit callback."
      );
    return tags;
  }
  async getPosition() {
    return await queryWorkadventure({
      type: "getPlayerPosition",
      data: void 0,
    });
  }
  onPlayerMove(t) {
    moveStream$1.subscribe(t),
      sendToWorkadventure({ type: "onPlayerMove", data: void 0 });
  }
  async moveTo(t, o, n) {
    return await queryWorkadventure({
      type: "movePlayerTo",
      data: { x: t, y: o, speed: n },
    });
  }
  get userRoomToken() {
    if (userRoomToken === void 0)
      throw new Error(
        "User-room token not initialized yet. You should call WA.player.userRoomToken within a WA.onInit callback."
      );
    return userRoomToken;
  }
  setOutlineColor(t, o, n) {
    return queryWorkadventure({
      type: "setPlayerOutline",
      data: { red: t, green: o, blue: n },
    });
  }
  removeOutlineColor() {
    return queryWorkadventure({ type: "removePlayerOutline", data: void 0 });
  }
  get proximityMeeting() {
    return proximityMeeting;
  }
  get isLogged() {
    if (isLogged === void 0)
      throw new Error(
        "IsLogged not initialized yet. You should call WA.player.isLogged within a WA.onInit callback."
      );
    return isLogged;
  }
  getWokaPicture() {
    return queryWorkadventure({ type: "getWoka", data: void 0 });
  }
}
const player = new WorkadventurePlayerCommands(),
  sharedPlayersVariableStream = new Map(),
  _newRemotePlayersStream = new Subject(),
  newRemotePlayersStream = _newRemotePlayersStream.asObservable(),
  _removeRemotePlayersStream = new Subject(),
  removeRemotePlayersStream = _removeRemotePlayersStream.asObservable(),
  _playersMovedStream = new Subject(),
  playersMovedStream = _playersMovedStream.asObservable();
class WorkadventurePlayersCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "trackingPlayers", !1);
    c(this, "trackingMovement", !1);
    c(this, "callbacks", [
      apiCallback({
        type: "setSharedPlayerVariable",
        callback: (t) => {
          const o = remotePlayers.get(t.playerId);
          if (o === void 0) {
            console.warn(
              "Received a variable message for a player that isn't connected. Ignoring.",
              t
            );
            return;
          }
          const n = sharedPlayersVariableStream.get(t.key);
          n && n.next({ player: o, value: t.value }),
            o.setVariable(t.key, t.value);
        },
      }),
      apiCallback({
        type: "addRemotePlayer",
        callback: (t) => {
          this.registerRemotePlayer(t);
        },
      }),
      apiCallback({
        type: "removeRemotePlayer",
        callback: (t) => {
          const o = remotePlayers.get(t);
          o === void 0
            ? console.warn("Could not find remote player to delete: ", t)
            : (remotePlayers.delete(t),
              _removeRemotePlayersStream.next(o),
              o.destroy());
        },
      }),
      apiCallback({
        type: "remotePlayerChanged",
        callback: (t) => {
          const o = remotePlayers.get(t.playerId);
          if (o === void 0) {
            console.warn("Could not find remote player with ID : ", t.playerId);
            return;
          }
          if (t.position) {
            const n = o.position;
            (o.position = t.position),
              _playersMovedStream.next({
                player: o,
                newPosition: t.position,
                oldPosition: n,
              });
          }
        },
      }),
    ]);
  }
  registerRemotePlayer(t) {
    const o = new RemotePlayer(t);
    remotePlayers.set(t.playerId, o), _newRemotePlayersStream.next(o);
  }
  async configureTracking(t) {
    var s, a;
    const o = (s = t == null ? void 0 : t.players) != null ? s : !0,
      n = (a = t == null ? void 0 : t.movement) != null ? a : !0;
    if (o === this.trackingPlayers && n === this.trackingMovement) return;
    (this.trackingPlayers = o), (this.trackingMovement = n);
    const i = await queryWorkadventure({
      type: "enablePlayersTracking",
      data: { players: this.trackingPlayers, movement: this.trackingMovement },
    });
    if (o) for (const d of i) this.registerRemotePlayer(d);
  }
  onVariableChange(t) {
    let o = sharedPlayersVariableStream.get(t);
    return (
      o || ((o = new Subject()), sharedPlayersVariableStream.set(t, o)),
      o.asObservable()
    );
  }
  get onPlayerEnters() {
    if (!this.trackingPlayers)
      throw new Error(
        "Cannot call WA.players.onPlayerEnters(). You forgot to call WA.players.configureTracking() first."
      );
    return newRemotePlayersStream;
  }
  get onPlayerLeaves() {
    if (!this.trackingPlayers)
      throw new Error(
        "Cannot call WA.players.onPlayerLeaves(). You forgot to call WA.players.configureTracking() first."
      );
    return removeRemotePlayersStream;
  }
  get onPlayerMoves() {
    if (!this.trackingMovement)
      throw new Error(
        "Cannot call WA.players.onPlayerMoves(). You forgot to call WA.players.configureTracking() first."
      );
    return playersMovedStream;
  }
  get(t) {
    return remotePlayers.get(t);
  }
  list() {
    return remotePlayers.values();
  }
}
const players = new WorkadventurePlayersCommands(),
  moveStream = new Subject();
class WorkAdventureCameraCommands extends IframeApiContribution {
  constructor() {
    super(...arguments);
    c(this, "callbacks", [
      apiCallback({
        type: "wasCameraUpdated",
        callback: (t) => {
          moveStream.next(t);
        },
      }),
    ]);
  }
  followPlayer(t = !1) {
    sendToWorkadventure({ type: "cameraFollowPlayer", data: { smooth: t } });
  }
  set(t, o, n, i, s = !1, a = !1) {
    sendToWorkadventure({
      type: "cameraSet",
      data: { x: t, y: o, width: n, height: i, lock: s, smooth: a },
    });
  }
  onCameraUpdate() {
    return (
      sendToWorkadventure({ type: "onCameraUpdate", data: void 0 }),
      moveStream.asObservable()
    );
  }
}
const camera = new WorkAdventureCameraCommands(),
  globalState = createState();
let _metadata, _iframeId;
const setMetadata = (r) => {
    _metadata = r;
  },
  setIframeId = (r) => {
    _iframeId = r;
  },
  initPromise = queryWorkadventure({ type: "getState", data: void 0 }).then(
    (r) => {
      console.log({ gameState: r }),
        setPlayerName(r.nickname),
        setPlayerLanguage(r.language),
        setRoomId(r.roomId),
        setMapURL(r.mapUrl),
        setTags(r.tags),
        setUuid(r.uuid),
        setUserRoomToken(r.userRoomToken),
        setMetadata(r.metadata),
        setIframeId(r.iframeId),
        globalState.initVariables(r.variables),
        player.state.initVariables(r.playerVariables),
        setIsLogged(r.isLogged);
    }
  ),
  wa = {
    ui,
    nav,
    controls,
    chat,
    sound,
    room,
    player,
    players,
    camera,
    state: globalState,
    onInit() {
      return initPromise;
    },
    get metadata() {
      return _metadata;
    },
    get iframeId() {
      return _iframeId;
    },
    sendChatMessage(r, e) {
      console.warn(
        "Method WA.sendChatMessage is deprecated. Please use WA.chat.sendChatMessage instead"
      ),
        chat.sendChatMessage(r, e);
    },
    disablePlayerControls() {
      console.warn(
        "Method WA.disablePlayerControls is deprecated. Please use WA.controls.disablePlayerControls instead"
      ),
        controls.disablePlayerControls();
    },
    restorePlayerControls() {
      console.warn(
        "Method WA.restorePlayerControls is deprecated. Please use WA.controls.restorePlayerControls instead"
      ),
        controls.restorePlayerControls();
    },
    displayBubble() {
      console.warn(
        "Method WA.displayBubble is deprecated. Please use WA.ui.displayBubble instead"
      ),
        ui.displayBubble();
    },
    removeBubble() {
      console.warn(
        "Method WA.removeBubble is deprecated. Please use WA.ui.removeBubble instead"
      ),
        ui.removeBubble();
    },
    openTab(r) {
      console.warn(
        "Method WA.openTab is deprecated. Please use WA.nav.openTab instead"
      ),
        nav.openTab(r);
    },
    loadSound(r) {
      return (
        console.warn(
          "Method WA.loadSound is deprecated. Please use WA.sound.loadSound instead"
        ),
        sound.loadSound(r)
      );
    },
    goToPage(r) {
      console.warn(
        "Method WA.goToPage is deprecated. Please use WA.nav.goToPage instead"
      ),
        nav.goToPage(r);
    },
    goToRoom(r) {
      console.warn(
        "Method WA.goToRoom is deprecated. Please use WA.nav.goToRoom instead"
      ),
        nav.goToRoom(r);
    },
    openCoWebSite(r, e = !1, t = "") {
      return (
        console.warn(
          "Method WA.openCoWebSite is deprecated. Please use WA.nav.openCoWebSite instead"
        ),
        nav.openCoWebSite(r, e, t)
      );
    },
    closeCoWebSite() {
      return (
        console.warn(
          "Method WA.closeCoWebSite is deprecated. Please use WA.nav.closeCoWebSite instead"
        ),
        nav.closeCoWebSite()
      );
    },
    openPopup(r, e, t) {
      return (
        console.warn(
          "Method WA.openPopup is deprecated. Please use WA.ui.openPopup instead"
        ),
        ui.openPopup(r, e, t)
      );
    },
    onChatMessage(r) {
      console.warn(
        "Method WA.onChatMessage is deprecated. Please use WA.chat.onChatMessage instead"
      ),
        chat.onChatMessage(r);
    },
    onEnterZone(r, e) {
      console.warn(
        "Method WA.onEnterZone is deprecated. Please use WA.room.onEnterZone instead"
      ),
        room.onEnterZone(r, e);
    },
    onLeaveZone(r, e) {
      console.warn(
        "Method WA.onLeaveZone is deprecated. Please use WA.room.onLeaveZone instead"
      ),
        room.onLeaveZone(r, e);
    },
  };
window.WA = wa;
window.addEventListener("message", (r) => {
  if (r.source !== window.parent) return;
  const e = r.data,
    t = isIframeErrorAnswerEvent.safeParse(e);
  if (t.success) {
    const o = t.data,
      n = o.id,
      i = o.error,
      s = answerPromises.get(n);
    if (s === void 0)
      throw new Error(
        "In Iframe API, got an error answer for a question that we have no track of."
      );
    s.reject(new Error(i)), answerPromises.delete(n);
  } else if (isIframeAnswerEvent(e)) {
    const o = e.id,
      n = e.data,
      i = answerPromises.get(o);
    if (i === void 0)
      throw new Error(
        "In Iframe API, got an answer for a question that we have no track of."
      );
    i.resolve(n), answerPromises.delete(o);
  } else {
    const o = isIframeResponseEvent.safeParse(e);
    if (o.success) {
      const n = o.data,
        i = registeredCallbacks[n.type];
      if (i === void 0)
        throw new Error(
          'Missing event handler for event of type "' + n.type + "'"
        );
      for (const s of i) s == null || s(n.data);
    } else if (isLookingLikeIframeEventWrapper.safeParse(e).success)
      throw new Error(
        "Could not parse message received from WorkAdventure. Message:" +
          JSON.stringify(e)
      );
  }
});
//# sourceMappingURL=iframe_api.js.map
