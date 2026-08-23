export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "Minimal 8 karakter",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "Mengandung huruf besar (A-Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "Mengandung huruf kecil (a-z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "Mengandung angka (0-9)",
    test: (password) => /[0-9]/.test(password),
  },
];

export const isPasswordValid = (password: string): boolean =>
  passwordRequirements.every((req) => req.test(password));
