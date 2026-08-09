import { UserIdentifier } from './user.identifier';

describe('UserIdentifier', () => {
  it('generates a UserIdentifier with a non-empty value', () => {
    const id = UserIdentifier.generate();

    expect(id).toBeInstanceOf(UserIdentifier);
    expect(id.toString().length).toBeGreaterThan(0);
  });

  it('generates unique values on each call', () => {
    const a = UserIdentifier.generate();
    const b = UserIdentifier.generate();

    expect(a.equals(b)).toBe(false);
  });

  it('rehydrates a UserIdentifier from an existing string', () => {
    const id = UserIdentifier.fromString(
      '019fe34b-0327-730f-b15b-07f6f76eb43e',
    );

    expect(id).toBeInstanceOf(UserIdentifier);
    expect(id.toString()).toBe('019fe34b-0327-730f-b15b-07f6f76eb43e');
  });
});
