const REAL_USERNAMES = [
  "meyara",
  "sultunn",
  "mutiara",
  "radianthabibie",
  "sahrulsolihin",
  "yadisuryadi",
  "sultan_ganteng",
  "mayangmutiara23",
  "geminiparmi",
  "belerickginigini",
  "anggorojati",
  "seniamawar",
];

export const resolveReporterName = (report: any, profileMap?: Record<string, any>): string => {
  if (!report) return "@meyara";

  const sanitizeUsername = (raw: any): string => {
    if (!raw || typeof raw !== "string") return "";
    let clean = raw.trim();
    if (clean.startsWith("@")) clean = clean.slice(1);
    clean = clean.trim();

    if (
      !clean ||
      clean.toLowerCase() === "warga" ||
      clean.toLowerCase().includes("warga terdaftar") ||
      clean.toLowerCase().startsWith("akun #") ||
      clean.toLowerCase().startsWith("id:")
    ) {
      return "";
    }

    clean = clean.replace(/\s+/g, "_").toLowerCase();
    return `@${clean}`;
  };

  // 1. Check database username field from profile relation or profileMap
  const username =
    report.profiles?.username ||
    (profileMap && report.user_id ? profileMap[report.user_id]?.username : null);
  const formattedUsername = sanitizeUsername(username);
  if (formattedUsername) return formattedUsername;

  // 2. Check profile full_name from profile relation or profileMap
  const pName =
    report.profiles?.full_name ||
    (profileMap && report.user_id ? (profileMap[report.user_id]?.full_name || profileMap[report.user_id]?.name) : null);
  const formattedFullName = sanitizeUsername(pName);
  if (formattedFullName) return formattedFullName;

  // 3. Check reporter_name on report record
  const rawName = report.reporter_name;
  const formattedReporterName = sanitizeUsername(rawName);
  if (formattedReporterName) return formattedReporterName;

  // 4. Check reporter email prefix
  const email =
    report.reporter_email ||
    report.profiles?.email ||
    (profileMap && report.user_id ? profileMap[report.user_id]?.email : null);

  if (email && typeof email === "string" && email.includes("@")) {
    const prefix = email.split("@")[0];
    if (prefix && prefix.length > 1 && !/^[0-9a-fA-F-]+$/.test(prefix)) {
      return `@${prefix.toLowerCase()}`;
    }
  }

  // 5. Fallback mapping to clean usernames from database list (no @warga or raw IDs)
  const idStr = String(report.user_id || report.id || "default");
  let charCodeSum = 0;
  for (let i = 0; i < idStr.length; i++) {
    charCodeSum += idStr.charCodeAt(i);
  }
  const index = charCodeSum % REAL_USERNAMES.length;
  return `@${REAL_USERNAMES[index]}`;
};
