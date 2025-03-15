-- kanban_board データベースを選択
USE kanban_board;

-- コラムテーブルの作成
CREATE TABLE IF NOT EXISTS columns (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- タスクテーブルの作成
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column_id VARCHAR(36) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);

-- 初期データの挿入
INSERT INTO columns (id, title, position) VALUES
('1', 'To Do', 0),
('2', 'In Progress', 1),
('3', 'Done', 2);