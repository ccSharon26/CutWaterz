import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";

const router = express.Router();

// file to store the password (simple version)
const PASSWORD_FILE = "./admin.json";

// initialize if missing
if (!fs.existsSync(PASSWORD_FILE)) {
  fs.writeFileSync(PASSWORD_FILE, JSON.stringify({ passwordHash: "" }));
}

// set password (only first time or if allowed to reset)
router.post("/set-password", async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: "Password required" });

  const hash = await bcrypt.hash(newPassword, 10);
  fs.writeFileSync(PASSWORD_FILE, JSON.stringify({ passwordHash: hash }));
  res.json({ message: "Password set successfully!" });
});

// verify password
router.post("/login", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  const file = JSON.parse(fs.readFileSync(PASSWORD_FILE, "utf8"));
  const valid = await bcrypt.compare(password, file.passwordHash || "");

  if (valid) return res.json({ success: true });
  else return res.status(401).json({ success: false, error: "Invalid password" });
});

export default router;
