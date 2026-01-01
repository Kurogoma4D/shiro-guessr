# ShiroGuessr 実装計画

## プロジェクト概要

GeoGuessrをベースにした、白色のRGB値を当てるゲーム「ShiroGuessr」の実装計画。

### ゲーム要件

- **色の範囲**: RGB各成分が245-255の範囲（合計1,331通りの白色）
- **ゲームフロー**:
  - ランダムに選ばれた1色を5x5のカラーパレット（25色表示）から当てる
  - ユーザーの選択と正解のマンハッタン距離でスコア計算
  - 5問で1サイクル、総合距離を競う
  - サイクル終了後にリプレイ可能
- **スコアリング**: 距離が短いほど高ポイント

## 技術スタック

- **Angular**: v21（最新）
- **状態管理**: Signals
- **スタイリング**: CSS
- **変更検知**: OnPush戦略

## アーキテクチャ設計

### 1. データモデル (`src/app/models/`)

#### `game.model.ts`
```typescript
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface GameRound {
  roundNumber: number;
  targetColor: RGBColor;
  selectedColor: RGBColor | null;
  distance: number;
  score: number;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  rounds: GameRound[];
  isComplete: boolean;
  totalScore: number;
}

export interface PaletteColor {
  color: RGBColor;
  index: number;
}
```

### 2. サービス層 (`src/app/services/`)

#### `color.service.ts`
**責務**: 白色の生成とRGB計算

**主要メソッド**:
- `generateRandomWhiteColor(): RGBColor` - ランダムな白色（RGB 245-255）を生成
- `generateAllWhiteColors(): RGBColor[]` - 全1,331通りの白色を生成
- `getRandomPaletteColors(count: number): PaletteColor[]` - パレット用のランダムな色をサンプリング
- `calculateManhattanDistance(color1: RGBColor, color2: RGBColor): number` - マンハッタン距離計算
- `rgbToString(color: RGBColor): string` - RGB値をCSSカラー文字列に変換

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

#### `game.service.ts`
**責務**: ゲーム状態管理（Signalsベース）

**状態（Signals）**:
- `gameState` - ゲーム全体の状態
- `currentRound` - 現在のラウンド
- `isGameActive` - ゲーム進行中フラグ

**主要メソッド**:
- `startNewGame(): void` - 新規ゲーム開始
- `selectColor(color: RGBColor): void` - 色の選択と結果計算
- `nextRound(): void` - 次のラウンドへ進む
- `resetGame(): void` - ゲームリセット
- `replayGame(): void` - リプレイ機能

### 3. コンポーネント層 (`src/app/components/`)

#### `game/game.component.ts`
**責務**: メインゲーム画面のオーケストレーション

**機能**:
- GameServiceからゲーム状態を取得（computed）
- ColorPalette、ScoreBoard、Resultコンポーネントの統合
- ゲームフロー制御

**テンプレート構造**:
```
@if (gameState().isComplete) {
  <app-result />
} @else {
  <app-score-board />
  <app-color-palette />
}
```

#### `color-palette/color-palette.component.ts`
**責務**: 5x5カラーパレットの表示と選択処理

**Input**:
- `colors: input<PaletteColor[]>()` - 表示する25色
- `disabled: input<boolean>()` - 選択可否

**Output**:
- `colorSelected: output<RGBColor>()` - 色選択イベント

**機能**:
- 5x5グリッドレイアウト
- ホバー効果
- 選択後のフィードバック表示（正解との距離視覚化）
- アクセシビリティ対応（キーボード操作、ARIA属性）

**スタイリング**:
- CSS Grid (5列)
- 各セルにボーダーと影
- ホバー時の拡大アニメーション

#### `score-board/score-board.component.ts`
**責務**: 現在のラウンド情報とスコア表示

**Input**:
- `currentRound: input<number>()`
- `totalRounds: input<number>()`
- `currentScore: input<number>()`
- `totalScore: input<number>()`

**表示内容**:
- ラウンド進捗（例: "Round 3 / 5"）
- 現在のラウンドスコア
- 累計スコア
- プログレスバー

#### `result/result.component.ts`
**責務**: ゲーム結果表示とリプレイ機能

**Input**:
- `gameState: input<GameState>()`

**Output**:
- `replay: output<void>()` - リプレイボタンクリック

**表示内容**:
- 最終スコア（大きく表示）
- 各ラウンドの詳細（選択色、正解色、距離、スコア）
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

### 4. ルーティング設定 (`src/app/app.routes.ts`)

```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/game',
    pathMatch: 'full'
  },
  {
    path: 'game',
    loadComponent: () => import('./components/game/game.component')
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
│   ├── score.service.ts
│   └── game.service.ts
├── components/
│   ├── game/
│   │   ├── game.component.ts
│   │   └── game.component.css
│   ├── color-palette/
│   │   ├── color-palette.component.ts
│   │   └── color-palette.component.css
│   ├── score-board/
│   │   ├── score-board.component.ts
│   │   └── score-board.component.css
│   ├── result/
│   │   ├── result.component.ts
│   │   └── result.component.css
│   └── round-detail/
│       ├── round-detail.component.ts
│       └── round-detail.component.css
├── app.ts
├── app.config.ts
└── app.routes.ts
```

## 実装フェーズ

### Phase 1: 基盤構築
1. データモデル定義（`game.model.ts`）
2. ColorServiceの実装
3. ScoreServiceの実装

### Phase 2: ゲームロジック
1. GameServiceの実装
   - Signalsベースの状態管理
   - ゲームフロー制御
2. ユニットテストの作成

### Phase 3: UIコンポーネント
1. ColorPaletteComponentの実装
   - グリッドレイアウト
   - インタラクション
2. ScoreBoardComponentの実装
3. RoundDetailComponentの実装
4. ResultComponentの実装

### Phase 4: 統合とポリッシュ
1. GameComponentでの統合
2. ルーティング設定
3. スタイリングの調整
4. アクセシビリティチェック（AXE）
5. レスポンシブ対応

### Phase 5: 追加機能（オプション）
1. ローカルストレージでのハイスコア保存
2. 難易度設定（色の範囲変更）
3. 結果のシェア機能
4. アニメーション効果の追加

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

1. **色の事前生成**: 全1,331色は初回にメモリにキャッシュ
2. **OnPush戦略**: 不要な再描画を防ぐ
3. **Computed Signals**: 派生状態の効率的な管理
4. **遅延ロード**: ルートレベルでのコンポーネント遅延ロード

## アクセシビリティ要件

1. **キーボード操作**: 全てTabキーとEnterキーで操作可能
2. **スクリーンリーダー**: ARIA属性の適切な設定
3. **フォーカス管理**: 明確なフォーカスインジケーター
4. **色のコントラスト**: WCAG AA基準を満たす（テキストと背景）
5. **セマンティックHTML**: 適切なHTML要素の使用

## テスト戦略

1. **ユニットテスト**:
   - 全サービスのロジックテスト
   - コンポーネントの単体テスト
2. **E2Eテスト**:
   - ゲームフロー全体のテスト
   - スコア計算の正確性テスト

## 今後の拡張可能性

1. マルチプレイヤー対戦モード
2. タイムアタックモード
3. リーダーボード（バックエンド統合）
4. カスタマイズ可能な色範囲
5. 統計情報とプレイヤープロフィール
