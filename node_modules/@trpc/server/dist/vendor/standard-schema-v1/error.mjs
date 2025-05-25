function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/** A schema error with useful information. */ class StandardSchemaV1Error extends Error {
    /**
   * Creates a schema error with useful information.
   *
   * @param issues The schema issues.
   */ constructor(issues){
        super(issues[0]?.message), /** The schema issues. */ _define_property(this, "issues", void 0);
        this.name = 'SchemaError';
        this.issues = issues;
    }
}

export { StandardSchemaV1Error };
