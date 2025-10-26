import argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, { type: argon2.argon2id });
};

export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  return argon2.verify(hash, password);
};

export const hashToken = async (token: string): Promise<string> => {
  return argon2.hash(token, { type: argon2.argon2id });
};

export const verifyTokenHash = async (hash: string, token: string): Promise<boolean> => {
  return argon2.verify(hash, token);
};
