-- Apply once to a database created before course categories and lesson progress
-- were added. Back up the database before applying migrations in production.
ALTER TABLE courses
  ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General' AFTER description;

CREATE TABLE lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lesson_progress_user_lesson (user_id, lesson_id),
  CONSTRAINT fk_lesson_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_progress_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;
