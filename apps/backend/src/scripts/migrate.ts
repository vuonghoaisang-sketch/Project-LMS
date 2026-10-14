import "dotenv/config";
import db from "../config/database";

async function runMigration() {
  try {
    // Migration 002: refresh_tokens
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_refresh_tokens_user (user_id),
        INDEX idx_refresh_tokens_token (token),
        CONSTRAINT fk_refresh_tokens_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 002: refresh_tokens table ensured.");

    // Migration 003: users avatar, lessons video_type, lesson_attachments
    try {
      await db.query(`ALTER TABLE users ADD COLUMN avatar VARCHAR(2048) NULL AFTER email;`);
      console.log("Migration 003: added avatar to users.");
    } catch (err: any) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("Migration 003: avatar already exists on users.");
      } else {
        throw err;
      }
    }

    try {
      await db.query(
        `ALTER TABLE lessons ADD COLUMN video_type ENUM('embed', 'upload') NOT NULL DEFAULT 'embed' AFTER description;`,
      );
      console.log("Migration 003: added video_type to lessons.");
    } catch (err: any) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("Migration 003: video_type already exists on lessons.");
      } else {
        throw err;
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS lesson_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        file_url VARCHAR(2048) NOT NULL,
        file_size BIGINT NOT NULL DEFAULT 0,
        file_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lesson_attachments_lesson (lesson_id),
        CONSTRAINT fk_lesson_attachments_lesson
          FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 003: lesson_attachments table ensured.");

    console.log("All migrations executed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

void runMigration();
