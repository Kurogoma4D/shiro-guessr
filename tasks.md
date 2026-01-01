# ShiroGuessr 実装タスク一覧

## Phase 1: 基盤構築

### 1.1 データモデル定義
- [ ] `src/app/models/` ディレクトリを作成
- [ ] `game.model.ts` を作成
  - [ ] `RGBColor` インターフェースを定義
  - [ ] `GameRound` インターフェースを定義
  - [ ] `GameState` インターフェースを定義
  - [ ] `PaletteColor` インターフェースを定義

### 1.2 ColorService実装
- [ ] `src/app/services/` ディレクトリを作成
- [ ] `color.service.ts` を作成
  - [ ] `generateRandomWhiteColor()` メソッドを実装（RGB 245-255のランダム生成）
  - [ ] `generateAllWhiteColors()` メソッドを実装（全1,331通りの白色を生成）
  - [ ] `getRandomPaletteColors(count: number)` メソッドを実装（25色のランダムサンプリング）
  - [ ] `calculateManhattanDistance(color1, color2)` メソッドを実装
  - [ ] `rgbToString(color)` メソッドを実装（CSS color文字列への変換）
- [ ] `color.service.spec.ts` でユニットテストを作成
  - [ ] `generateRandomWhiteColor` のテスト（範囲チェック）
  - [ ] `calculateManhattanDistance` のテスト（計算ロジック）
  - [ ] `rgbToString` のテスト（フォーマット確認）

### 1.3 ScoreService実装
- [ ] `score.service.ts` を作成
  - [ ] `calculateRoundScore(distance)` メソッドを実装
    - [ ] スコア計算式: `1000 × (1 - distance / 30)`
  - [ ] `calculateTotalScore(rounds)` メソッドを実装
- [ ] `score.service.spec.ts` でユニットテストを作成
  - [ ] 距離0の場合のテスト（1000ポイント）
  - [ ] 距離30の場合のテスト（0ポイント）
  - [ ] 複数ラウンドの合計スコアテスト

## Phase 2: ゲームロジック

### 2.1 GameService実装
- [ ] `game.service.ts` を作成
  - [ ] Signalsの定義
    - [ ] `gameState` signal（WritableSignal<GameState>）
    - [ ] `currentRound` computed signal
    - [ ] `isGameActive` computed signal
  - [ ] `startNewGame()` メソッドを実装
    - [ ] 初期状態の設定
    - [ ] 最初のラウンドの開始
  - [ ] `selectColor(color)` メソッドを実装
    - [ ] マンハッタン距離の計算
    - [ ] スコアの計算
    - [ ] GameRoundの更新
  - [ ] `nextRound()` メソッドを実装
    - [ ] 次のラウンドへの移行
    - [ ] ゲーム完了判定
  - [ ] `resetGame()` メソッドを実装
  - [ ] `replayGame()` メソッドを実装
- [ ] ColorServiceとScoreServiceを依存性注入（`inject()`使用）
- [ ] `game.service.spec.ts` でユニットテストを作成
  - [ ] ゲーム開始のテスト
  - [ ] 色選択のテスト
  - [ ] ラウンド進行のテスト
  - [ ] ゲーム完了のテスト

## Phase 3: UIコンポーネント

### 3.1 ColorPaletteComponent実装
- [ ] `src/app/components/color-palette/` ディレクトリを作成
- [ ] `ng generate component` でコンポーネント生成
- [ ] `color-palette.component.ts` を実装
  - [ ] `input()` 定義
    - [ ] `colors: input<PaletteColor[]>()`
    - [ ] `disabled: input<boolean>()`
  - [ ] `output()` 定義
    - [ ] `colorSelected: output<RGBColor>()`
  - [ ] `ChangeDetectionStrategy.OnPush` を設定
  - [ ] テンプレートの実装
    - [ ] `@for` で25色を5x5グリッドで表示
    - [ ] `button` 要素で各色を表示（アクセシビリティ）
    - [ ] ARIA属性の設定（`role`, `aria-label`）
    - [ ] キーボード操作対応（`tabindex`, `@keydown.enter`）
- [ ] `color-palette.component.css` を実装
  - [ ] CSS Gridレイアウト（`grid-template-columns: repeat(5, 1fr)`）
  - [ ] 各セルのスタイリング（ボーダー、影）
  - [ ] ホバー効果（拡大アニメーション）
  - [ ] フォーカスインジケーター
- [ ] `color-palette.component.spec.ts` でテスト作成
  - [ ] 25色の表示テスト
  - [ ] クリックイベントのテスト
  - [ ] disabled状態のテスト

### 3.2 ScoreBoardComponent実装
- [ ] `src/app/components/score-board/` ディレクトリを作成
- [ ] `ng generate component` でコンポーネント生成
- [ ] `score-board.component.ts` を実装
  - [ ] `input()` 定義
    - [ ] `currentRound: input<number>()`
    - [ ] `totalRounds: input<number>()`
    - [ ] `currentScore: input<number>()`
    - [ ] `totalScore: input<number>()`
  - [ ] `ChangeDetectionStrategy.OnPush` を設定
  - [ ] テンプレートの実装
    - [ ] ラウンド進捗表示
    - [ ] 現在のスコア表示
    - [ ] 累計スコア表示
    - [ ] プログレスバー
- [ ] `score-board.component.css` を実装
  - [ ] レイアウト設計
  - [ ] プログレスバーのスタイリング
- [ ] `score-board.component.spec.ts` でテスト作成

### 3.3 RoundDetailComponent実装
- [ ] `src/app/components/round-detail/` ディレクトリを作成
- [ ] `ng generate component` でコンポーネント生成
- [ ] `round-detail.component.ts` を実装
  - [ ] `input()` 定義
    - [ ] `round: input<GameRound>()`
  - [ ] `ChangeDetectionStrategy.OnPush` を設定
  - [ ] テンプレートの実装
    - [ ] ラウンド番号表示
    - [ ] 選択した色（カラーサンプル + RGB値）
    - [ ] 正解の色（カラーサンプル + RGB値）
    - [ ] 距離とスコア表示
- [ ] `round-detail.component.css` を実装
- [ ] `round-detail.component.spec.ts` でテスト作成

### 3.4 ResultComponent実装
- [ ] `src/app/components/result/` ディレクトリを作成
- [ ] `ng generate component` でコンポーネント生成
- [ ] `result.component.ts` を実装
  - [ ] `input()` 定義
    - [ ] `gameState: input<GameState>()`
  - [ ] `output()` 定義
    - [ ] `replay: output<void>()`
  - [ ] `ChangeDetectionStrategy.OnPush` を設定
  - [ ] パフォーマンス評価ロジック実装
    - [ ] スコアに応じた評価メッセージ（"Excellent!", "Good", "Try Again"）
  - [ ] テンプレートの実装
    - [ ] 最終スコア表示（大きく）
    - [ ] `@for` で各ラウンドの詳細表示（RoundDetailComponent使用）
    - [ ] パフォーマンス評価表示
    - [ ] リプレイボタン
- [ ] `result.component.css` を実装
  - [ ] 最終スコアの強調スタイル
  - [ ] リプレイボタンのスタイリング
- [ ] `result.component.spec.ts` でテスト作成

### 3.5 GameComponent実装
- [ ] `src/app/components/game/` ディレクトリを作成
- [ ] `ng generate component` でコンポーネント生成
- [ ] `game.component.ts` を実装
  - [ ] GameServiceを依存性注入（`inject()`使用）
  - [ ] `computed()` でゲーム状態取得
  - [ ] `ChangeDetectionStrategy.OnPush` を設定
  - [ ] イベントハンドラ実装
    - [ ] `onColorSelected(color: RGBColor)` - 色選択時の処理
    - [ ] `onNextRound()` - 次のラウンドへ
    - [ ] `onReplay()` - リプレイ処理
  - [ ] テンプレートの実装
    - [ ] `@if` でゲーム完了状態を判定
    - [ ] ゲーム中: ScoreBoard + ColorPalette表示
    - [ ] 完了後: Result表示
- [ ] `game.component.css` を実装
  - [ ] メインレイアウト設計
- [ ] `game.component.spec.ts` でテスト作成

## Phase 4: 統合とポリッシュ

### 4.1 ルーティング設定
- [ ] `app.routes.ts` を更新
  - [ ] ルートパス（`''`）から `/game` へのリダイレクト設定
  - [ ] `/game` ルートでGameComponentを遅延ロード

### 4.2 アプリケーション設定
- [ ] `app.ts` を確認・更新
  - [ ] ルーティング設定の確認
- [ ] アプリケーション起動確認
  - [ ] `ng serve` でローカルサーバー起動
  - [ ] 基本動作確認

### 4.3 スタイリングの調整
- [ ] グローバルスタイル設定（`styles.css`）
  - [ ] リセットCSS/ノーマライズ
  - [ ] カスタムカラー変数定義
  - [ ] フォント設定
- [ ] 全コンポーネントのスタイル統一
  - [ ] 色の一貫性
  - [ ] スペーシングの統一
  - [ ] タイポグラフィの統一

### 4.4 アクセシビリティチェック
- [ ] AXEツールでチェック実行
- [ ] WCAG AA基準の確認
  - [ ] キーボード操作テスト
  - [ ] スクリーンリーダーテスト
  - [ ] 色のコントラスト比チェック（4.5:1以上）
  - [ ] フォーカス管理の確認
- [ ] 問題点の修正

### 4.5 レスポンシブ対応
- [ ] モバイル（375px〜）のスタイル調整
- [ ] タブレット（768px〜）のスタイル調整
- [ ] デスクトップ（1024px〜）のスタイル調整
- [ ] タッチデバイスでの操作確認

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
