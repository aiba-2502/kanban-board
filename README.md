# Kanban Board - Docker 環境

このプロジェクトは Docker 環境で実行するカンバンボードアプリケーションです。React、TypeScript、Zustand、MySQL (MariaDB) を使用しています。

## 機能

- カンバンボードの表示
- カラムの追加、編集、削除
- タスクの追加、編集、削除
- ドラッグ＆ドロップでのタスク移動
- MariaDB によるデータ永続化

## Docker での実行方法

### 前提条件

- Docker
- Docker Compose

### 開始方法

1. リポジトリをクローンする

```bash
git clone <repository-url>
cd kanban-board
```

2. Docker コンテナを起動する

```bash
docker-compose up -d
```

3. ブラウザで以下のURLにアクセスする

```
http://localhost:5173
```

### 停止方法

```bash
docker-compose down
```

データベースのデータを保持したまま停止する場合:

```bash
docker-compose down
```

データベースのデータも削除する場合:

```bash
docker-compose down -v
```

## プロジェクト構造

```
kanban-app/
├── docker/
│   ├── nginx.conf            # Nginx設定ファイル（本番環境用）
│   └── mariadb/
│       └── init/
│           └── 01-schema.sql # データベース初期化スクリプト
├── src/
│   ├── components/           # Reactコンポーネント
│   ├── store/                # Zustandストア
│   ├── App.tsx               # メインアプリケーション
│   ├── main.tsx              # エントリーポイント
│   └── types.ts              # 型定義
├── Dockerfile                # Dockerビルド設定
├── docker-compose.yml        # Docker Compose設定
└── server.js                 # Express APIサーバー
```

## 技術スタック

- **フロントエンド**:
  - React
  - TypeScript
  - Zustand (状態管理)
  - TailwindCSS (スタイリング)
  - dnd-kit (ドラッグ＆ドロップ)
  - Vite (ビルドツール)

- **バックエンド**:
  - Express.js
  - MySQL (MariaDB)

- **インフラ**:
  - Docker
  - Docker Compose
  - Nginx (本番環境)

## データベースのメンテナンス

### MariaDBへの接続（コマンドライン）

```bash
docker exec -it kanban-board-db mysql -u kanban -pkanban_password kanban_board
```

### HeidiSQLでの接続方法

HeidiSQLを使用してDocker環境内のMariaDBに接続するには:

1. HeidiSQLを起動し「新規」をクリック
2. 以下の接続情報を入力:
   - **ネットワークタイプ**: MariaDB or MySQL (TCP/IP)
   - **ホスト名**: localhost または 127.0.0.1
   - **ユーザー**: kanban
   - **パスワード**: kanban_password
   - **ポート**: 3306
3. 「開く」をクリックして接続
4. 左側のツリーから `kanban_board` データベースを選択

### データベースのバックアップ

```bash
docker exec kanban-board-db sh -c 'mysqldump -u kanban -pkanban_password kanban_board' > backup.sql
```

### バックアップからのリストア

```bash
cat backup.sql | docker exec -i kanban-board-db mysql -u kanban -pkanban_password kanban_board
```

### カラムとタスクの確認

```sql
-- カラム一覧表示
SELECT id, title, position FROM columns ORDER BY position;

-- タスク一覧表示
SELECT id, title, description, column_id, position FROM tasks ORDER BY column_id, position;

-- 特定のカラムに属するタスク表示
SELECT * FROM tasks WHERE column_id = 'カラムID';
```

### データの削除

```sql
-- カラムの削除（関連するタスクも削除される）
DELETE FROM columns WHERE id = 'カラムID';

-- タスクの削除
DELETE FROM tasks WHERE id = 'タスクID';
```