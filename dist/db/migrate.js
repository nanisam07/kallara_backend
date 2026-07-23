"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("./db"));
async function migrate() {
    console.log("Starting database initialization...");
    const sqlPath = path_1.default.join(__dirname, "init.sql");
    if (!fs_1.default.existsSync(sqlPath)) {
        console.error(`Schema SQL file not found at ${sqlPath}`);
        process.exit(1);
    }
    const sql = fs_1.default.readFileSync(sqlPath, "utf8");
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        console.log("Executing schema tables definition...");
        await client.query(sql);
        // Check if an admin already exists
        const adminCheck = await client.query("SELECT * FROM admins LIMIT 1;");
        if (adminCheck.rows.length === 0) {
            console.log("No admins found. Seeding default admin user...");
            const hashedPassword = await bcryptjs_1.default.hash("admin123", 10);
            await client.query("INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4);", ["System Administrator", "admin@kallara.com", hashedPassword, "ADMIN"]);
            console.log("Default admin seeded: admin@kallara.com / admin123");
        }
        else {
            console.log("Admin table already seeded.");
        }
        await client.query("COMMIT");
        console.log("Database initialized successfully!");
    }
    catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", err);
        process.exit(1);
    }
    finally {
        client.release();
        await db_1.default.end();
    }
}
migrate();
