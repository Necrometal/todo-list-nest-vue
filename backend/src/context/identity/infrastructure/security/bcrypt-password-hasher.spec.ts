import { PlainPassword } from '../../domain/user/plain-password.vo';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hashes a password into a value different from the plain text', async () => {
    const hashed = await hasher.hash(PlainPassword.fromString('abcd1234'));

    expect(hashed.toString()).not.toBe('abcd1234');
    expect(hashed.toString().length).toBeGreaterThan(0);
  });

  it('compares a matching plain password against its hash as true', async () => {
    const plain = PlainPassword.fromString('abcd1234');
    const hashed = await hasher.hash(plain);

    await expect(hasher.compare(plain, hashed)).resolves.toBe(true);
  });

  it('compares a non-matching plain password against a hash as false', async () => {
    const hashed = await hasher.hash(PlainPassword.fromString('abcd1234'));

    await expect(
      hasher.compare(PlainPassword.fromString('other1234'), hashed),
    ).resolves.toBe(false);
  });

  it('produces a different hash each time (random salt)', async () => {
    const plain = PlainPassword.fromString('abcd1234');

    const first = await hasher.hash(plain);
    const second = await hasher.hash(plain);

    expect(first.toString()).not.toBe(second.toString());
  });
});
