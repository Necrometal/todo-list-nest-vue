// Thrown for any domain-rule violation (invalid value object, illegal
// aggregate state transition, etc). Kept distinct from a bare Error so
// application/interface layers can `catch (e) { if (e instanceof DomainError) }`
// and map it to a 400-class HTTP response, instead of parsing messages.
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    // Without this, `error.name` reads "Error" and `instanceof DomainError`
    // checks in logs/serializers lose the distinction.
    this.name = this.constructor.name;
  }
}
