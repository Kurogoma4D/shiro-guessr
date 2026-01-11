# ShiroGuessr 実装計画（GeoGuessr風リニューアル）

## プロジェクト概要

GeoGuessrのゲームプレイをベースにした、色のグラデーションマップ上で正解の色を探し当てるゲーム「ShiroGuessr」の実装計画。

### 既存ゲームの保存方針

**重要**: 現在の5x5カラーパレット版のゲームは削除せず、別のページとして保存します。

- **クラシックモード** (`/classic`): 既存の5x5カラーパレットから色を選ぶモード
- **マップモード** (`/map`): 新しいGeoGuessr風のグラデーションマップモード
- **デフォルトルート** (`/`): クラシックモードにリダイレクト

**モード切替**: 各ゲーム画面のヘッダーに他のモードへのリンクを設置します。

既存のコンポーネントは以下のようにリネーム・移動：
- `game` → `classic-game`（クラシックモード専用）
- `color-palette` → そのまま保持（クラシックモードで使用）
- `score-board` → 両モードで共有可能
- `result` → 両モードで共有可能（必要に応じて拡張）
- `round-detail` → 両モードで共有可能

### ゲーム要件（マップ版）

- **色の範囲**: RGB各成分が245-255の範囲（合計1,331通りの白色）
- **ゲームフロー**:
  1. ランダムに選ばれた正解の色（ターゲットカラー）が画面上部に表示される
  2. 色のグラデーションマップが生成され、プレイヤーに提示される
  3. プレイヤーはマップ上を移動・拡大縮小して探索できる
  4. プレイヤーはマップ上にピンを立てて「ここだ」と推測する
  5. 制限時間（例: 60秒）内に「Guess」ボタンを押すか、時間切れで回答
  6. ピンの位置のカラーコードと正解のカラーコードの距離でスコアが決まる
  7. 5問で1サイクル、総合スコアを競う
  8. サイクル終了後にリプレイ可能
- **制限時間**: 各問題に60秒のタイマー
- **スコアリング**: 距離が短いほど高ポイント

## 技術スタック

- **Angular**: v21（最新）
- **状態管理**: Signals
- **スタイリング**: CSS
- **変更検知**: OnPush戦略
- **マップ操作**: Canvas APIまたはSVG（パン・ズーム機能の実装）

## アーキテクチャ設計

### 1. データモデル (`src/app/models/`)

#### `game.model.ts`
```typescript
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface MapCoordinate {
  x: number; // 0-1の正規化座標
  y: number; // 0-1の正規化座標
}

export interface Pin {
  coordinate: MapCoordinate;
  color: RGBColor; // ピンを立てた位置の色
}

export interface ViewportState {
  center: MapCoordinate; // 現在の中心座標
  zoom: number; // ズームレベル（1.0が初期値、0.5-4.0など）
  offset: { x: number; y: number }; // パン操作のオフセット
}

export interface GameRound {
  roundNumber: number;
  targetColor: RGBColor; // 正解の色
  pin: Pin | null; // プレイヤーが立てたピン
  distance: number; // 正解との距離
  score: number; // 獲得スコア
  timeRemaining: number; // 残り時間（秒）
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  rounds: GameRound[];
  isComplete: boolean;
  totalScore: number;
  timeLimit: number; // 1問あたりの制限時間（秒）
}

export interface GradientMap {
  width: number; // マップの幅（ピクセル）
  height: number; // マップの高さ（ピクセル）
  getColorAt(coordinate: MapCoordinate): RGBColor; // 座標から色を取得
}
```

### 2. サービス層 (`src/app/services/`)

#### `color.service.ts`
**責務**: 白色の生成とRGB計算

**主要メソッド**:
- `generateRandomWhiteColor(): RGBColor` - ランダムな白色（RGB 245-255）を生成
- `calculateManhattanDistance(color1: RGBColor, color2: RGBColor): number` - マンハッタン距離計算
- `rgbToString(color: RGBColor): string` - RGB値をCSSカラー文字列に変換
- `interpolateColor(color1: RGBColor, color2: RGBColor, t: number): RGBColor` - 2色間の補間

#### `gradient-map.service.ts`
**責務**: グラデーションマップの生成と色の取得

**主要メソッド**:
- `generateGradientMap(width: number, height: number): GradientMap` - グラデーションマップを生成
  - 4隅にランダムな白色を配置
  - バイリニア補間で滑らかなグラデーションを生成
- `getColorAt(map: GradientMap, coordinate: MapCoordinate): RGBColor` - マップ上の座標から色を取得
- `renderMapToCanvas(map: GradientMap, canvas: HTMLCanvasElement): void` - Canvasにマップをレンダリング

**グラデーション生成アルゴリズム**:
```
1. マップの4隅にランダムな白色（RGB 245-255）を割り当て
2. 各ピクセルについて、4隅からの距離に基づいてバイリニア補間を実行
3. Canvasに描画し、座標→色のマッピングを提供
```

#### `map-navigation.service.ts`
**責務**: マップのパン・ズーム操作の管理

**状態（Signals）**:
- `viewportState` - 現在のビューポート状態（中心座標、ズーム、オフセット）

**主要メソッド**:
- `pan(deltaX: number, deltaY: number): void` - マップを移動
- `zoom(delta: number, center?: MapCoordinate): void` - ズームイン/アウト
- `resetView(): void` - 初期ビューに戻す
- `screenToMapCoordinate(screenX: number, screenY: number): MapCoordinate` - 画面座標をマップ座標に変換

#### `score.service.ts`
**責務**: スコア計算とポイント変換

**スコア計算式**:
```
最大距離 = 3 × (255 - 245) = 30
ラウンドスコア = 1000 × (1 - distance / maxDistance)

完璧な答え（距離0） → 1000ポイント
最悪の答え（距離30） → 0ポイント
```

**主要メソッド**:
- `calculateRoundScore(distance: number): number` - 距離からスコアを計算
- `calculateTotalScore(rounds: GameRound[]): number` - 全ラウンドの合計スコア

#### `timer.service.ts`
**責務**: ゲームタイマーの管理

**状態（Signals）**:
- `timeRemaining` - 残り時間（秒）
- `isRunning` - タイマー実行中フラグ

**主要メソッド**:
- `startTimer(duration: number): void` - タイマー開始
- `stopTimer(): void` - タイマー停止
- `resetTimer(): void` - タイマーリセット
- `onTimeout: Observable<void>` - タイムアウトイベント

#### `game.service.ts`
**責務**: ゲーム状態管理（Signalsベース）

**状態（Signals）**:
- `gameState` - ゲーム全体の状態
- `currentRound` - 現在のラウンド
- `currentGradientMap` - 現在のグラデーションマップ
- `isGameActive` - ゲーム進行中フラグ

**主要メソッド**:
- `startNewGame(): void` - 新規ゲーム開始（マップ生成を含む）
- `placePin(coordinate: MapCoordinate): void` - ピンを立てる
- `submitGuess(): void` - 回答を確定し、結果を計算
- `handleTimeout(): void` - タイムアウト時の処理
- `nextRound(): void` - 次のラウンドへ進む
- `resetGame(): void` - ゲームリセット
- `replayGame(): void` - リプレイ機能

### 3. コンポーネント層 (`src/app/components/`)

#### `mode-switcher/mode-switcher.component.ts`
**責務**: モード切替ヘッダー（新規）

**機能**:
- 現在のモードを表示
- 他のモードへのリンクを提供
- アプリタイトル（ShiroGuessr）

**Input**:
- `currentMode: input<'classic' | 'map'>()`

**表示内容**:
- アプリタイトル
- クラシックモードへのリンク
- マップモードへのリンク
- 現在のモードを視覚的に強調

#### `classic-game/classic-game.component.ts`
**責務**: クラシックモードゲーム画面（既存のgameをリネーム）

**機能**:
- 既存の5x5カラーパレットゲームのロジック
- ModeSwitcher、ColorPalette、ScoreBoard、Resultコンポーネントの統合

#### `map-game/map-game.component.ts`
**責務**: マップモードメインゲーム画面（新規）

**機能**:
- GameServiceからゲーム状態を取得（computed）
- ModeSwitcher、GradientMap、Timer、ScoreBoard、Resultコンポーネントの統合
- ゲームフロー制御

**テンプレート構造**:
```
<app-mode-switcher [currentMode]="'map'" />
@if (gameState().isComplete) {
  <app-result />
} @else {
  <app-game-header />
  <app-gradient-map />
  <app-game-controls />
}
```

#### `game-header/game-header.component.ts`
**責務**: ゲームヘッダー（正解の色、タイマー、スコア表示）

**Input**:
- `targetColor: input<RGBColor>()` - 正解の色
- `currentRound: input<number>()`
- `totalRounds: input<number>()`
- `timeRemaining: input<number>()`
- `currentScore: input<number>()`

**表示内容**:
- 正解の色のサンプル（大きく表示）
- タイマー（カウントダウン、時間切れ警告）
- ラウンド進捗（例: "Round 3 / 5"）
- 現在のスコア

#### `gradient-map/gradient-map.component.ts`
**責務**: グラデーションマップの表示とインタラクション

**Input**:
- `gradientMap: input<GradientMap>()` - 表示するマップ
- `pin: input<Pin | null>()` - 現在のピン
- `disabled: input<boolean>()` - 操作可否

**Output**:
- `pinPlaced: output<MapCoordinate>()` - ピン配置イベント

**機能**:
- Canvasを使用したマップのレンダリング
- マウス/タッチでのパン操作（ドラッグ）
- マウスホイール/ピンチでのズーム操作
- クリック/タップでのピン配置
- ピンのビジュアル表示（マーカー）
- ズームコントロール（+/-ボタン）
- 現在位置のリセットボタン

**インタラクション**:
1. **パン**: マウスドラッグまたはタッチドラッグでマップを移動
2. **ズーム**: マウスホイールまたはピンチジェスチャーで拡大縮小
3. **ピン配置**: クリックまたはタップで現在のピンを移動
4. **UI操作**: ズームボタン、リセットボタン

**スタイリング**:
- Canvas要素（全画面または大きな領域）
- ピンマーカー（SVGまたはCSS）
- ズームコントロール（右下に固定配置）

#### `game-controls/game-controls.component.ts`
**責務**: ゲーム操作ボタン

**Input**:
- `hasPin: input<boolean>()` - ピンが配置されているか
- `disabled: input<boolean>()` - ボタン無効化

**Output**:
- `guess: output<void>()` - Guessボタンクリック

**機能**:
- Guessボタン（ピンが配置されていない場合は無効化）
- ボタンのホバー効果とフィードバック

#### `result/result.component.ts`
**責務**: ゲーム結果表示とリプレイ機能

**Input**:
- `gameState: input<GameState>()`

**Output**:
- `replay: output<void>()` - リプレイボタンクリック

**表示内容**:
- 最終スコア（大きく表示）
- 各ラウンドの詳細（選択色、正解色、距離、スコア、残り時間）
- パフォーマンス評価（例: "Excellent!", "Good", "Try Again"）
- リプレイボタン
- 結果のシェア機能（オプション）

#### `round-detail/round-detail.component.ts`
**責務**: 各ラウンドの詳細表示（Result内で使用）

**Input**:
- `round: input<GameRound>()`

**表示内容**:
- ラウンド番号
- 選択した色（カラーサンプル + RGB値）
- 正解の色（カラーサンプル + RGB値）
- 距離とスコア
- 使用時間（制限時間 - 残り時間）

### 4. ルーティング設定 (`src/app/app.routes.ts`)

```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/classic',
    pathMatch: 'full'
  },
  {
    path: 'classic',
    loadComponent: () => import('./components/classic-game/classic-game.component')
  },
  {
    path: 'map',
    loadComponent: () => import('./components/map-game/map-game.component')
  },
  {
    path: '**',
    redirectTo: '/classic'
  }
];
```

### 5. ディレクトリ構造

```
src/app/
├── models/
│   └── game.model.ts
├── services/
│   ├── color.service.ts
│   ├── gradient-map.service.ts
│   ├── map-navigation.service.ts
│   ├── score.service.ts
│   ├── timer.service.ts
│   └── game.service.ts
├── components/
│   ├── mode-switcher/                 # 新規: モード切替ヘッダー
│   │   ├── mode-switcher.component.ts
│   │   └── mode-switcher.component.css
│   ├── classic-game/                  # リネーム: 既存のgame
│   │   ├── classic-game.component.ts
│   │   └── classic-game.component.css
│   ├── map-game/                      # 新規: マップモードゲーム
│   │   ├── map-game.component.ts
│   │   └── map-game.component.css
│   ├── color-palette/                 # 既存: クラシックモードで使用
│   │   ├── color-palette.component.ts
│   │   └── color-palette.component.css
│   ├── game-header/                   # 新規: マップモードで使用
│   │   ├── game-header.component.ts
│   │   └── game-header.component.css
│   ├── gradient-map/                  # 新規: マップモードで使用
│   │   ├── gradient-map.component.ts
│   │   └── gradient-map.component.css
│   ├── game-controls/                 # 新規: マップモードで使用
│   │   ├── game-controls.component.ts
│   │   └── game-controls.component.css
│   ├── score-board/                   # 既存: 両モードで共有
│   │   ├── score-board.component.ts
│   │   └── score-board.component.css
│   ├── result/                        # 既存: 両モードで共有
│   │   ├── result.component.ts
│   │   └── result.component.css
│   └── round-detail/                  # 既存: 両モードで共有
│       ├── round-detail.component.ts
│       └── round-detail.component.css
├── app.ts
├── app.config.ts
└── app.routes.ts
```

## 実装フェーズ

### Phase 0: 既存ゲームの保存
1. 既存の`game`コンポーネントを`classic-game`にリネーム
2. 既存のルーティングを更新（`/game` → `/classic`）
3. ModeSwitcherコンポーネントの作成
   - 現在のモード表示
   - 他のモードへのリンク
4. Classic-gameにModeSwitcherを統合
5. ルーティング設定の更新（`/` → `/classic`, `/classic`, `/map`）
6. 既存ゲームの動作確認

### Phase 1: 基盤構築（マップ版）
1. データモデルの拡張（`game.model.ts`）
   - MapCoordinate, Pin, ViewportState, GradientMapの追加
2. ColorServiceの拡張
   - `interpolateColor`メソッドの追加
3. ScoreServiceの実装（既存と共有）
4. TimerServiceの実装（新規）

### Phase 2: グラデーションマップ
1. GradientMapServiceの実装
   - バイリニア補間アルゴリズム
   - Canvas描画機能
   - 座標→色のマッピング
2. ユニットテストの作成

### Phase 3: マップナビゲーション
1. MapNavigationServiceの実装
   - パン操作
   - ズーム操作
   - 座標変換
2. GradientMapComponentの実装
   - Canvasレンダリング
   - マウス/タッチイベント処理
   - ピン表示

### Phase 4: ゲームロジック
1. GameServiceの実装
   - Signalsベースの状態管理
   - ゲームフロー制御
   - タイマー統合
2. ユニットテストの作成

### Phase 5: UIコンポーネント（マップ版）
1. GameHeaderComponentの実装
2. GameControlsComponentの実装
3. RoundDetailComponentの拡張（マップ版対応）
4. ResultComponentの拡張（マップ版対応）

### Phase 6: 統合とポリッシュ
1. MapGameComponentでの統合
   - ModeSwitcher、GradientMap、GameHeader、GameControlsの統合
   - ゲームフロー制御
2. ModeSwitcherコンポーネントの仕上げ
   - デザイン調整
   - アクティブ状態の視覚化
   - モバイル対応
3. スタイリングの調整
4. アクセシビリティチェック（AXE）
5. レスポンシブ対応（モバイル、タブレット、デスクトップ）
6. パフォーマンス最適化
7. 両モードの動作確認

### Phase 7: 追加機能（オプション）
1. ローカルストレージでのハイスコア保存（両モード対応）
2. 難易度設定
   - クラシックモード: パレットサイズ変更（3x3, 5x5, 7x7）
   - マップモード: 色の範囲変更、制限時間調整
3. 結果のシェア機能（両モード対応）
4. アニメーション効果の追加（ピン配置、スコア表示など）
5. サウンドエフェクト（両モード対応）
6. モード間のハイスコア比較機能

## 技術的課題と解決策

### 1. グラデーションマップの生成
**課題**: 滑らかで自然なグラデーションの生成
**解決策**:
- 4隅にランダムな白色を配置
- バイリニア補間（Bilinear Interpolation）を使用
- 必要に応じてパーリンノイズなどを追加して自然さを向上

### 2. パフォーマンス
**課題**: 大きなCanvasの描画とインタラクション
**解決策**:
- マップは一度だけ生成・描画し、キャッシュ
- ズーム・パン時はCSS transformを使用
- 必要に応じてオフスクリーンCanvasを活用

### 3. タッチデバイス対応
**課題**: マウスとタッチの両対応
**解決策**:
- PointerEventsを使用した統一的なイベント処理
- ピンチジェスチャーのサポート
- モバイルでの誤操作防止

### 4. 座標変換
**課題**: 画面座標とマップ座標の相互変換
**解決策**:
- ビューポート状態（中心、ズーム、オフセット）を管理
- 変換マトリックスを使用した正確な座標計算

## Angular Best Practices適用

- ✅ Standaloneコンポーネント（v20+ではデフォルト）
- ✅ `input()`/`output()`関数の使用
- ✅ Signalsによる状態管理
- ✅ `computed()`による派生状態
- ✅ `ChangeDetectionStrategy.OnPush`
- ✅ ネイティブ制御フロー（`@if`, `@for`）
- ✅ `inject()`関数による依存性注入
- ✅ 厳格な型チェック
- ✅ WCAG AA準拠のアクセシビリティ

## パフォーマンス考慮事項

1. **マップの事前生成**: ラウンド開始時にマップを生成し、キャッシュ
2. **OnPush戦略**: 不要な再描画を防ぐ
3. **Computed Signals**: 派生状態の効率的な管理
4. **Canvas最適化**: オフスクリーンレンダリング、必要な部分のみ再描画
5. **イベントスロットリング**: パン・ズーム操作のパフォーマンス向上

## アクセシビリティ要件

1. **キーボード操作**:
   - Tabキーでフォーカス移動
   - 矢印キーでマップ移動
   - +/-キーでズーム
   - Enterキーでピン配置・Guess
2. **スクリーンリーダー**:
   - 現在のズームレベル、マップ位置の読み上げ
   - タイマーの残り時間の定期的な通知
   - ピン配置時のフィードバック
3. **フォーカス管理**: 明確なフォーカスインジケーター
4. **色のコントラスト**: WCAG AA基準を満たす
5. **代替操作**: マウスが使えない場合の操作方法提供

## テスト戦略

1. **ユニットテスト**:
   - 全サービスのロジックテスト
   - グラデーション生成アルゴリズムのテスト
   - 座標変換の正確性テスト
   - タイマーの動作テスト
2. **コンポーネントテスト**:
   - マップインタラクションのテスト
   - ピン配置のテスト
3. **E2Eテスト**:
   - ゲームフロー全体のテスト
   - スコア計算の正確性テスト
   - タイムアウト処理のテスト

## 今後の拡張可能性

1. マルチプレイヤー対戦モード
2. タイムアタックモード
3. リーダーボード（バックエンド統合）
4. カスタマイズ可能なマップサイズと色範囲
5. 異なるグラデーションパターン（放射状、螺旋など）
6. リプレイ動画の保存・共有
7. 統計情報とプレイヤープロフィール
8. デイリーチャレンジ機能
