-- Migration 003: Add media, avatar, video_type, and lesson_attachments
USE lms_db;

-- 1. Add avatar to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(2048) NULL AFTER email;

-- 2. Add video_type to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_type ENUM('embed', 'upload') NOT NULL DEFAULT 'embed' AFTER description;

-- 3. Create lesson_attachments table
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
