import { z } from "zod";

export const reportSchema = z.object({
  image: z.custom<FileList>().refine((files) => files && files.length === 1, {
    message: "[ERROR] An image file is required to submit a report.",
  }),
  latitude: z.coerce.number({
    message: "[ERROR] Format koordinat Lintang tidak valid atau belum diisi.",
  }),
  longitude: z.coerce.number({
    message: "[ERROR] Format koordinat Bujur tidak valid atau belum diisi.",
  }),
  description: z
    .string()
    .max(500, {
      message: "[ERROR] Deskripsi laporan maksimal 500 karakter.",
    })
    .optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
