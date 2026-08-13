import { createClient } from "./supabase/client";

/**
 * Mengunggah berkas foto ke Supabase Storage
 * dan mengembalikan URL akses publiknya.
 */
export const uploadReportImage = async (file: File): Promise<string> => {
  const supabaseClient = createClient();

  try {
    console.info("[INFO] Memulai proses unggah foto pelaporan ke server.");

    // Membangun nama berkas unik untuk mencegah duplikasi
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `report_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `public/${uniqueFileName}`;

    // Eksekusi unggah berkas ke bucket 'report_images'
    const { error } = await supabaseClient.storage
      .from("report_images")
      .upload(filePath, file);

    if (error) {
      console.error(
        `[ERROR] Gagal mengunggah foto ke Supabase Storage: ${error.message}`,
      );
      throw new Error("[ERROR] Failed to upload the image to the server.");
    }

    // Mengambil URL publik untuk dikirim ke FastAPI
    const { data: publicUrlData } = supabaseClient.storage
      .from("report_images")
      .getPublicUrl(filePath);

    console.log(
      `[SUCCESS] Foto berhasil diunggah. Tautan akses: ${publicUrlData.publicUrl}`,
    );
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error(
      "[ERROR] An unexpected error occurred during the image upload process.",
      err,
    );
    throw err;
  }
};
