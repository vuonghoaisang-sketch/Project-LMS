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

    // Migration 004: Phase 3 - Quiz, Comments, Notifications, Reviews, Certificates
    await db.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        time_limit_minutes INT NOT NULL DEFAULT 10,
        passing_score TINYINT NOT NULL DEFAULT 80,
        is_required TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_quizzes_lesson (lesson_id),
        CONSTRAINT fk_quizzes_lesson
          FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: quizzes table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question TEXT NOT NULL,
        type ENUM('multiple_choice', 'true_false') NOT NULL DEFAULT 'multiple_choice',
        explanation TEXT NULL,
        position INT NOT NULL DEFAULT 1,
        INDEX idx_quiz_questions_quiz (quiz_id),
        CONSTRAINT fk_quiz_questions_quiz
          FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: quiz_questions table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        option_text VARCHAR(1000) NOT NULL,
        is_correct TINYINT(1) NOT NULL DEFAULT 0,
        position INT NOT NULL DEFAULT 1,
        INDEX idx_quiz_options_question (question_id),
        CONSTRAINT fk_quiz_options_question
          FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: quiz_options table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        user_id INT NOT NULL,
        score DECIMAL(5,2) NOT NULL DEFAULT 0,
        passed TINYINT(1) NOT NULL DEFAULT 0,
        total_questions INT NOT NULL DEFAULT 0,
        correct_answers INT NOT NULL DEFAULT 0,
        time_taken_seconds INT NOT NULL DEFAULT 0,
        submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_quiz_attempts_quiz (quiz_id),
        INDEX idx_quiz_attempts_user (user_id),
        CONSTRAINT fk_quiz_attempts_quiz
          FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        CONSTRAINT fk_quiz_attempts_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: quiz_attempts table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option_id INT NULL,
        is_correct TINYINT(1) NOT NULL DEFAULT 0,
        INDEX idx_attempt_answers_attempt (attempt_id),
        CONSTRAINT fk_attempt_answers_attempt
          FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: quiz_attempt_answers table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS lesson_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        user_id INT NOT NULL,
        parent_id INT NULL,
        content TEXT NOT NULL,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lesson_comments_lesson (lesson_id),
        INDEX idx_lesson_comments_parent (parent_id),
        INDEX idx_lesson_comments_user (user_id),
        CONSTRAINT fk_lesson_comments_lesson
          FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        CONSTRAINT fk_lesson_comments_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: lesson_comments table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(60) NOT NULL,
        message VARCHAR(500) NOT NULL,
        reference_id INT NULL,
        reference_type VARCHAR(60) NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_user (user_id),
        INDEX idx_notifications_unread (user_id, is_read),
        CONSTRAINT fk_notifications_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: notifications table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS course_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        user_id INT NOT NULL,
        rating TINYINT NOT NULL,
        content TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_course_reviews_user_course (course_id, user_id),
        INDEX idx_course_reviews_course (course_id),
        CONSTRAINT fk_course_reviews_course
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT fk_course_reviews_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: course_reviews table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        certificate_code VARCHAR(64) NOT NULL UNIQUE,
        issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_certificates_user (user_id),
        INDEX idx_certificates_course (course_id),
        UNIQUE KEY uq_certificate_user_course (user_id, course_id),
        CONSTRAINT fk_certificates_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_certificates_course
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 004: certificates table ensured.");

    // Migration 005: Phase 4 - Coupons, Orders, Order Items, Payments
    await db.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        max_discount_amount DECIMAL(10,2) NULL,
        usage_limit INT NOT NULL DEFAULT 100,
        used_count INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMP NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_coupons_code (code)
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 005: coupons table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_code VARCHAR(64) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        coupon_id INT NULL,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orders_user (user_id),
        INDEX idx_orders_code (order_code),
        INDEX idx_orders_status (status),
        CONSTRAINT fk_orders_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_orders_coupon
          FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 005: orders table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        course_id INT NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_items_order (order_id),
        INDEX idx_order_items_course (course_id),
        CONSTRAINT fk_order_items_order
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_order_items_course
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 005: order_items table ensured.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('mock', 'vnpay', 'momo', 'vietqr', 'sepay') NOT NULL DEFAULT 'mock',
        transaction_id VARCHAR(255) NULL,
        status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
        metadata TEXT NULL,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payments_order (order_id),
        INDEX idx_payments_user (user_id),
        INDEX idx_payments_status (status),
        CONSTRAINT fk_payments_order
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_payments_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("Migration 005: payments table ensured.");

    // Sample coupons
    await db.query(`
      INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, is_active)
      VALUES 
        ('WELCOME50', 'percent', 50.00, 0.00, 100.00, 500, 1),
        ('SALE10', 'fixed', 10.00, 20.00, NULL, 200, 1),
        ('VIPFREE', 'percent', 100.00, 0.00, NULL, 50, 1);
    `);
    console.log("Migration 005: sample coupons ensured.");

    console.log("✅ All migrations executed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

void runMigration();
