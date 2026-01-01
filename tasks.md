# ShiroGuessr 実装タスク一覧

## Phase 1: 基盤構築

### 1.1 データモデル定義
- [x] `src/app/models/` ディレクトリを作成
- [x] `game.model.ts` を作成
  - [x] `RGBColor` インターフェースを定義
  - [x] `GameRound` インターフェースを定義
  - [x] `GameState` インターフェースを定義
  - [x] `PaletteColor` インターフェースを定義

### 1.2 ColorService実装
- [x] `src/app/services/` ディレクトリを作成
- [x] `color.service.ts` を作成
  - [x] `generateRandomWhiteColor()` メソッドを実装（RGB 245-255のランダム生成）
  - [x] `generateAllWhiteColors()` メソッドを実装（全1,331通りの白色を生成）
  - [x] `getRandomPaletteColors(count: number)` メソッドを実装（25色のランダムサンプリング）
  - [x] `calculateManhattanDistance(color1, color2)` メソッドを実装
  - [x] `rgbToString(color)` メソッドを実装（CSS color文字列への変換）
- [x] `color.service.spec.ts` でユニットテストを作成
  - [x] `generateRandomWhiteColor` のテスト（範囲チェック）
  - [x] `calculateManhattanDistance` のテスト（計算ロジック）
  - [x] `rgbToString` のテスト（フォーマット確認）

### 1.3 ScoreService実装
- [x] `score.service.ts` を作成
  - [x] `calculateRoundScore(distance)` メソッドを実装
    - [x] スコア計算式: `1000 × (1 - distance / 30)`
  - [x] `calculateTotalScore(rounds)` メソッドを実装
- [x] `score.service.spec.ts` でユニットテストを作成
  - [x] 距離0の場合のテスト（1000ポイント）
  - [x] 距離30の場合のテスト（0ポイント）
  - [x] 複数ラウンドの合計スコアテスト

## Phase 2: ゲームロジック

### 2.1 GameService実装
- [x] `game.service.ts` を作成
  - [x] Signalsの定義
    - [x] `gameState` signal（WritableSignal<GameState>）
    - [x] `currentRound` computed signal
    - [x] `isGameActive` computed signal
  - [x] `startNewGame()` メソッドを実装
    - [x] 初期状態の設定
    - [x] 最初のラウンドの開始
  - [x] `selectColor(color)` メソッドを実装
    - [x] マンハッタン距離の計算
    - [x] スコアの計算
    - [x] GameRoundの更新
  - [x] `nextRound()` メソッドを実装
    - [x] 次のラウンドへの移行
    - [x] ゲーム完了判定
  - [x] `resetGame()` メソッドを実装
  - [x] `replayGame()` メソッドを実装
- [x] ColorServiceとScoreServiceを依存性注入（`inject()`使用）
- [x] `game.service.spec.ts` でユニットテストを作成
  - [x] ゲーム開始のテスト
  - [x] 色選択のテスト
  - [x] ラウンド進行のテスト
  - [x] ゲーム完了のテスト

## Phase 3: UIコンポーネント

### 3.1 ColorPaletteComponent実装
- [x] `src/app/components/color-palette/` ディレクトリを作成
- [x] `ng generate component` でコンポーネント生成
- [x] `color-palette.component.ts` を実装
  - [x] `input()` 定義
    - [x] `colors: input<PaletteColor[]>()`
    - [x] `disabled: input<boolean>()`
  - [x] `output()` 定義
    - [x] `colorSelected: output<RGBColor>()`
  - [x] `ChangeDetectionStrategy.OnPush` を設定
  - [x] テンプレートの実装
    - [x] `@for` で25色を5x5グリッドで表示
    - [x] `button` 要素で各色を表示（アクセシビリティ）
    - [x] ARIA属性の設定（`role`, `aria-label`）
    - [x] キーボード操作対応（`tabindex`, `@keydown.enter`）
- [x] `color-palette.component.css` を実装
  - [x] CSS Gridレイアウト（`grid-template-columns: repeat(5, 1fr)`）
  - [x] 各セルのスタイリング（ボーダー、影）
  - [x] ホバー効果（拡大アニメーション）
  - [x] フォーカスインジケーター
- [x] `color-palette.component.spec.ts` でテスト作成
  - [x] 25色の表示テスト
  - [x] クリックイベントのテスト
  - [x] disabled状態のテスト

### 3.2 ScoreBoardComponent実装
- [x] `src/app/components/score-board/` ディレクトリを作成
- [x] `ng generate component` でコンポーネント生成
- [x] `score-board.component.ts` を実装
  - [x] `input()` 定義
    - [x] `currentRound: input<number>()`
    - [x] `totalRounds: input<number>()`
    - [x] `currentScore: input<number>()`
    - [x] `totalScore: input<number>()`
  - [x] `ChangeDetectionStrategy.OnPush` を設定
  - [x] テンプレートの実装
    - [x] ラウンド進捗表示
    - [x] 現在のスコア表示
    - [x] 累計スコア表示
    - [x] プログレスバー
- [x] `score-board.component.css` を実装
  - [x] レイアウト設計
  - [x] プログレスバーのスタイリング
- [x] `score-board.component.spec.ts` でテスト作成

### 3.3 RoundDetailComponent実装
- [x] `src/app/components/round-detail/` ディレクトリを作成
- [x] `ng generate component` でコンポーネント生成
- [x] `round-detail.component.ts` を実装
  - [x] `input()` 定義
    - [x] `round: input<GameRound>()`
  - [x] `ChangeDetectionStrategy.OnPush` を設定
  - [x] テンプレートの実装
    - [x] ラウンド番号表示
    - [x] 選択した色（カラーサンプル + RGB値）
    - [x] 正解の色（カラーサンプル + RGB値）
    - [x] 距離とスコア表示
- [x] `round-detail.component.css` を実装
- [x] `round-detail.component.spec.ts` でテスト作成

### 3.4 ResultComponent実装
- [x] `src/app/components/result/` ディレクトリを作成
- [x] `ng generate component` でコンポーネント生成
- [x] `result.component.ts` を実装
  - [x] `input()` 定義
    - [x] `gameState: input<GameState>()`
  - [x] `output()` 定義
    - [x] `replay: output<void>()`
  - [x] `ChangeDetectionStrategy.OnPush` を設定
  - [x] パフォーマンス評価ロジック実装
    - [x] スコアに応じた評価メッセージ（"Excellent!", "Good", "Try Again"）
  - [x] テンプレートの実装
    - [x] 最終スコア表示（大きく）
    - [x] `@for` で各ラウンドの詳細表示（RoundDetailComponent使用）
    - [x] パフォーマンス評価表示
    - [x] リプレイボタン
- [x] `result.component.css` を実装
  - [x] 最終スコアの強調スタイル
  - [x] リプレイボタンのスタイリング
- [x] `result.component.spec.ts` でテスト作成

### 3.5 GameComponent実装
- [x] `src/app/components/game/` ディレクトリを作成
- [x] `ng generate component` でコンポーネント生成
- [x] `game.component.ts` を実装
  - [x] GameServiceを依存性注入（`inject()`使用）
  - [x] `computed()` でゲーム状態取得
  - [x] `ChangeDetectionStrategy.OnPush` を設定
  - [x] イベントハンドラ実装
    - [x] `onColorSelected(color: RGBColor)` - 色選択時の処理
    - [x] `onNextRound()` - 次のラウンドへ
    - [x] `onReplay()` - リプレイ処理
  - [x] テンプレートの実装
    - [x] `@if` でゲーム完了状態を判定
    - [x] ゲーム中: ScoreBoard + ColorPalette表示
    - [x] 完了後: Result表示
- [x] `game.component.css` を実装
  - [x] メインレイアウト設計
- [x] `game.component.spec.ts` でテスト作成

## Phase 4: 統合とポリッシュ

### 4.1 ルーティング設定
- [x] `app.routes.ts` を更新
  - [x] ルートパス（`''`）から `/game` へのリダイレクト設定
  - [x] `/game` ルートでGameComponentを遅延ロード

### 4.2 アプリケーション設定
- [x] `app.ts` を確認・更新
  - [x] ルーティング設定の確認
- [x] アプリケーション起動確認
  - [x] `ng serve` でローカルサーバー起動
  - [x] 基本動作確認

### 4.3 スタイリングの調整
- [x] グローバルスタイル設定（`styles.css`）
  - [x] リセットCSS/ノーマライズ
  - [x] カスタムカラー変数定義
  - [x] フォント設定
- [x] 全コンポーネントのスタイル統一
  - [x] 色の一貫性
  - [x] スペーシングの統一
  - [x] タイポグラフィの統一

### 4.4 アクセシビリティチェック
- [x] AXEツールでチェック実行
- [x] WCAG AA基準の確認
  - [x] キーボード操作テスト
  - [x] スクリーンリーダーテスト
  - [x] 色のコントラスト比チェック（4.5:1以上）
  - [x] フォーカス管理の確認
- [x] 問題点の修正

### 4.5 レスポンシブ対応
- [x] モバイル（375px〜）のスタイル調整
- [x] タブレット（768px〜）のスタイル調整
- [x] デスクトップ（1024px〜）のスタイル調整
- [x] タッチデバイスでの操作確認

## Phase 5: テストとQA

### 5.1 ユニットテスト
- [ ] 全サービスのテスト実行（`ng test`）
  - [ ] ColorService: カバレッジ80%以上
  - [ ] ScoreService: カバレッジ80%以上
  - [ ] GameService: カバレッジ80%以上
- [ ] 全コンポーネントのテスト実行
  - [ ] 各コンポーネント: カバレッジ70%以上

### 5.2 E2Eテスト
- [ ] ゲームフロー全体のテスト作成
  - [ ] ゲーム開始
  - [ ] 5ラウンドの色選択
  - [ ] 結果表示
  - [ ] リプレイ
- [ ] スコア計算の正確性テスト
- [ ] エラーケースのテスト

### 5.3 手動QA
- [ ] ゲームの完全プレイテスト（複数回）
- [ ] UI/UXの確認
  - [ ] アニメーションのスムーズさ
  - [ ] フィードバックの適切性
  - [ ] エラーメッセージの表示
- [ ] パフォーマンステスト
  - [ ] 初回ロード時間
  - [ ] インタラクション応答速度
- [ ] クロスブラウザテスト
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## Phase 6: 追加機能（オプション）

### 6.1 ローカルストレージでのハイスコア保存
- [ ] `storage.service.ts` を作成
- [ ] ハイスコア保存機能実装
- [ ] ハイスコア表示UIの追加

### 6.2 難易度設定
- [ ] 難易度選択UIの追加
- [ ] 色の範囲を可変にする機能
  - [ ] Easy: RGB 240-255
  - [ ] Normal: RGB 245-255
  - [ ] Hard: RGB 250-255

### 6.3 結果のシェア機能
- [ ] シェアボタンの追加
- [ ] Web Share API の実装
- [ ] スコアのテキスト化

### 6.4 アニメーション効果
- [ ] ページ遷移アニメーション
- [ ] スコア表示のカウントアップアニメーション
- [ ] カラーパレットの表示アニメーション

## デプロイメント

### 7.1 本番ビルド
- [ ] `ng build` で本番ビルド実行
- [ ] ビルドサイズの確認と最適化
- [ ] 各種最適化の確認
  - [ ] コード分割
  - [ ] Tree shaking
  - [ ] ミニフィケーション

### 7.2 デプロイ
- [ ] デプロイ先の選定（Firebase Hosting, Vercel, Netlifyなど）
- [ ] デプロイ設定
- [ ] 本番環境でのテスト

## 完了条件

- [ ] 全ユニットテストがパス
- [ ] E2Eテストがパス
- [ ] AXEチェックで問題なし
- [ ] 主要ブラウザで動作確認完了
- [ ] レスポンシブ対応完了
- [ ] ゲームが正しく動作（5ラウンド完走、リプレイ可能）
