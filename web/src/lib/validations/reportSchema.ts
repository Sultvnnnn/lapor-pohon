import { z } from "zod";

export const reportSchema = z.object({
  image: z.any().refine(
    (val) => {
      if (!val) return false;
      if (typeof window !== "undefined" && val instanceof FileList) {
        return val.length > 0;
      }
      if (typeof window !== "undefined" && (val instanceof File || val instanceof Blob)) {
        return true;
      }
      if (Array.isArray(val)) return val.length > 0;
      return true;
    },
    {
      message: "Foto kondisi pohon wajib dipotret sebelum mengirim laporan.",
    }
  ),
  latitude: z.coerce.number({
    message: "Format koordinat Lintang (latitude) tidak valid atau belum terisi.",
  }),
  longitude: z.coerce.number({
    message: "Format koordinat Bujur (longitude) tidak valid atau belum terisi.",
  }),
  description: z
    .string()
    .max(500, {
      message: "Deskripsi laporan maksimal 500 karakter.",
    })
    .optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
