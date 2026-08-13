export type PasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
};

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: "Minimal 8 karakter",
    test: (password) => password.length >= 8,
  },
  {
    label: "Mengandung huruf besar (A-Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Mengandung huruf kecil (a-z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "Mengandung angka (0-9)",
    test: (password) => /[0-9]/.test(password),
  },
];

export const isPasswordValid = (password: string): boolean =>
  passwordRequirements.every((req) => req.test(password));
