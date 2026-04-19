import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hashPassword.js <password>");
  console.error("Example: node scripts/hashPassword.js mySecurePassword123");
  process.exit(1);
}

const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

console.log("\n✅ Password hashed successfully!\n");
console.log("Add this to your backend/.env file:");
console.log(`ADMIN_PASSWORD_HASH='${hash}'`);
console.log("\n⚠️  Remove the old ADMIN_PASSWORD line from .env\n");
