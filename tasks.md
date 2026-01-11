# ShiroGuessr マップモード実装タスク

このタスクリストは、plan.mdに基づいて現在のプロジェクトにマップモードを追加するための具体的な作業項目です。

## Phase 0: 既存ゲームの保存

### Task 0.1: 既存のgameコンポーネントをclassic-gameにリネーム
- [x] `src/app/components/game/` ディレクトリを `src/app/components/classic-game/` にリネーム
- [x] `game.component.ts` を `classic-game.component.ts` にリネーム
- [x] `game.component.html` を `classic-game.component.html` にリネーム
- [x] `game.component.css` を `classic-game.component.css` にリネーム
- [x] `game.component.spec.ts` を `classic-game.component.spec.ts` にリネーム
- [x] コンポーネント内のクラス名を `GameComponent` から `ClassicGameComponent` に変更
- [x] セレクタを `app-game` から `app-classic-game` に変更

### Task 0.2: ルーティングを更新
- [x] `src/app/app.routes.ts` を開く
- [x] `/game` ルートを `/classic` に変更
- [x] インポートパスを `./components/game/game.component` から `./components/classic-game/classic-game.component` に変更
- [x] コンポーネント名を `GameComponent` から `ClassicGameComponent` に変更
- [x] リダイレクトを `/game` から `/classic` に変更

### Task 0.3: ModeSwitcherコンポーネントの作成
- [x] `src/app/components/mode-switcher/` ディレクトリを作成
- [x] `mode-switcher.component.ts` を作成
  - Standaloneコンポーネントとして定義
  - RouterLink、RouterLinkActiveディレクティブをインポート
  - Input: `currentMode: input<'classic' | 'map'>()`
- [x] `mode-switcher.component.html` を作成
  - アプリタイトル（ShiroGuessr）を表示
  - クラシックモードへのリンク（`/classic`）
  - マップモードへのリンク（`/map`）
  - 現在のモードを視覚的に強調（routerLinkActiveを使用）
- [x] `mode-switcher.component.css` を作成
  - ヘッダースタイル
  - リンクのスタイル（アクティブ状態含む）
  - レスポンシブデザイン

### Task 0.4: Classic-gameにModeSwitcherを統合
- [x] `classic-game.component.ts` を開く
- [x] ModeSwitcherComponentをインポート
- [x] `classic-game.component.html` の先頭にModeSwitcherを追加
  ```html
  <app-mode-switcher [currentMode]="'classic'" />
  ```

### Task 0.5: ルーティングにMapルートを追加
- [x] `app.routes.ts` にマップルート（`/map`）を追加（仮実装）
  - 一時的に404ページまたはクラシックへのリダイレクトを設定

### Task 0.6: 既存ゲームの動作確認
- [x] `npm start` でアプリを起動
- [x] `/` がクラシックモードにリダイレクトされることを確認
- [x] `/classic` で既存のクラシックモードゲームが動作することを確認
- [x] ModeSwitcherが表示され、リンクが機能することを確認
- [x] ゲームフローが正常に動作することを確認
- [x] テストを実行して既存機能が壊れていないことを確認

---

## Phase 1: 基盤構築（マップ版）

### Task 1.1: データモデルの拡張
- [x] `src/app/models/game.model.ts` を開く
- [x] `MapCoordinate` インターフェースを追加

  ```typescript
  export interface MapCoordinate {
    x: number; // 0-1の正規化座標
    y: number; // 0-1の正規化座標
  }
  ```

- [x] `Pin` インターフェースを追加

  ```typescript
  export interface Pin {
    coordinate: MapCoordinate;
    color: RGBColor;
  }
  ```

- [x] `ViewportState` インターフェースを追加

  ```typescript
  export interface ViewportState {
    center: MapCoordinate;
    zoom: number;
    offset: { x: number; y: number };
  }
  ```

- [x] `GradientMap` インターフェースを追加

  ```typescript
  export interface GradientMap {
    width: number;
    height: number;
    cornerColors: [RGBColor, RGBColor, RGBColor, RGBColor]; // 4隅の色
    getColorAt(coordinate: MapCoordinate): RGBColor;
  }
  ```

- [x] 既存の `GameRound` インターフェースを拡張（`pin` と `timeRemaining` を追加）
- [x] 既存の `GameState` インターフェースを拡張（`timeLimit` を追加）

### Task 1.2: ColorServiceの拡張
- [x] `src/app/services/color.service.ts` を開く
- [x] `interpolateColor` メソッドを追加

  ```typescript
  interpolateColor(color1: RGBColor, color2: RGBColor, t: number): RGBColor
  ```

  - `t` は 0-1 の範囲で、2色間の補間位置を表す
  - 各RGB成分を線形補間

### Task 1.3: TimerServiceの作成
- [x] `src/app/services/timer.service.ts` を作成
- [x] Signalsを使用した状態管理
  - `timeRemaining: WritableSignal<number>`
  - `isRunning: WritableSignal<boolean>`
- [x] `startTimer(duration: number): void` メソッドを実装
  - RxJSの `interval` を使用して1秒ごとにカウントダウン
- [x] `stopTimer(): void` メソッドを実装
- [x] `resetTimer(): void` メソッドを実装
- [x] `onTimeout: Observable<void>` を実装
  - タイムアウト時にイベントを発行
- [x] `timer.service.spec.ts` を作成してテストを追加

---

## Phase 2: グラデーションマップ

### Task 2.1: GradientMapServiceの作成
- [x] `src/app/services/gradient-map.service.ts` を作成
- [x] ColorServiceを注入
- [x] `generateGradientMap(width: number, height: number): GradientMap` メソッドを実装
  - 4隅にランダムな白色（RGB 245-255）を生成
  - バイリニア補間でグラデーションを計算する関数を返す
- [x] `getColorAt(map: GradientMap, coordinate: MapCoordinate): RGBColor` メソッドを実装
  - バイリニア補間アルゴリズム:
    1. 座標を正規化（0-1）
    2. 上辺と下辺をそれぞれ補間
    3. 上下の結果を縦方向に補間
- [x] `renderMapToCanvas(map: GradientMap, canvas: HTMLCanvasElement): void` メソッドを実装
  - Canvas 2D contextを取得
  - 全ピクセルをループして色を計算
  - ImageDataを使用して一括描画
- [x] `gradient-map.service.spec.ts` を作成
  - グラデーション生成のテスト
  - バイリニア補間の正確性テスト
  - 色の範囲（245-255）が守られているかテスト

---

## Phase 3: マップナビゲーション

### Task 3.1: MapNavigationServiceの作成
- [ ] `src/app/services/map-navigation.service.ts` を作成
- [ ] Signalsを使用した状態管理
  - `viewportState: WritableSignal<ViewportState>`
  - 初期値: `{ center: { x: 0.5, y: 0.5 }, zoom: 1.0, offset: { x: 0, y: 0 } }`
- [ ] `pan(deltaX: number, deltaY: number): void` メソッドを実装
  - offsetを更新
  - ズームレベルを考慮した移動量の調整
- [ ] `zoom(delta: number, center?: MapCoordinate): void` メソッドを実装
  - ズームレベルを更新（0.5 - 4.0の範囲に制限）
  - centerが指定されている場合、その点を中心にズーム
- [ ] `resetView(): void` メソッドを実装
  - 初期ビューポートに戻す
- [ ] `screenToMapCoordinate(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): MapCoordinate` メソッドを実装
  - 画面座標をマップ座標（0-1）に変換
  - ズームとオフセットを考慮
- [ ] `map-navigation.service.spec.ts` を作成
  - 座標変換のテスト
  - パン・ズーム操作のテスト

### Task 3.2: GradientMapComponentの作成
- [ ] `src/app/components/gradient-map/` ディレクトリを作成
- [ ] `gradient-map.component.ts` を作成
  - Standaloneコンポーネント
  - Inputs:
    - `gradientMap: input<GradientMap | null>()`
    - `pin: input<Pin | null>()`
    - `disabled: input<boolean>(false)`
  - Outputs:
    - `pinPlaced: output<MapCoordinate>()`
  - GradientMapServiceとMapNavigationServiceを注入
  - `@ViewChild('canvas')` でCanvas要素を参照
- [ ] Canvas要素の初期化とレンダリング
  - `ngAfterViewInit` でCanvasを初期化
  - `effect` を使用してgradientMapの変更を監視し、再描画
- [ ] マウス/タッチイベントの実装
  - `onPointerDown`: パン開始、またはピン配置
  - `onPointerMove`: パン中の処理
  - `onPointerUp`: パン終了、ピン配置確定
  - `onWheel`: ズーム操作
- [ ] ピンの描画
  - ピンがある場合、Canvas上にマーカーを描画
  - SVGまたはCanvas APIで描画
- [ ] `gradient-map.component.html` を作成
  - Canvas要素
  - ズームコントロールUI（+/-ボタン）
  - リセットボタン
- [ ] `gradient-map.component.css` を作成
  - Canvasのスタイリング
  - コントロールUIの配置（右下に固定）
  - ピンマーカーのスタイル
- [ ] `gradient-map.component.spec.ts` を作成

---

## Phase 4: ゲームロジック（マップ版）

### Task 4.1: マップ版用のGameServiceの作成または拡張
**オプション1: 既存GameServiceを拡張**
- [ ] `src/app/services/game.service.ts` を開く
- [ ] マップ版用の状態を追加
  - `currentGradientMap: WritableSignal<GradientMap | null>`
  - `currentPin: WritableSignal<Pin | null>`
- [ ] TimerServiceを注入
- [ ] マップ版用メソッドを追加
  - `startNewMapGame(): void`
  - `placePin(coordinate: MapCoordinate): void`
  - `submitGuess(): void`
  - `handleTimeout(): void`

**オプション2: MapGameServiceを分離作成**
- [ ] `src/app/services/map-game.service.ts` を作成
- [ ] Signalsベースの状態管理
  - `gameState: WritableSignal<GameState>`
  - `currentGradientMap: WritableSignal<GradientMap | null>`
  - `currentPin: WritableSignal<Pin | null>`
- [ ] ColorService、ScoreService、TimerService、GradientMapServiceを注入
- [ ] `startNewGame(): void` メソッドを実装
  - 新しいラウンドを開始
  - グラデーションマップを生成
  - タイマーを開始
- [ ] `placePin(coordinate: MapCoordinate): void` メソッドを実装
  - ピンの座標を保存
  - その座標の色を取得して保存
- [ ] `submitGuess(): void` メソッドを実装
  - タイマーを停止
  - ピンの色と正解の色の距離を計算
  - スコアを計算
  - ラウンド結果を保存
- [ ] `handleTimeout(): void` メソッドを実装
  - タイムアウト時の処理（submitGuessと同様）
- [ ] `nextRound(): void` メソッドを実装
- [ ] `resetGame(): void` メソッドを実装
- [ ] `replayGame(): void` メソッドを実装
- [ ] `map-game.service.spec.ts` を作成

---

## Phase 5: UIコンポーネント（マップ版）

### Task 5.1: GameHeaderComponentの作成
- [ ] `src/app/components/game-header/` ディレクトリを作成
- [ ] `game-header.component.ts` を作成
  - Standaloneコンポーネント
  - Inputs:
    - `targetColor: input.required<RGBColor>()`
    - `currentRound: input.required<number>()`
    - `totalRounds: input.required<number>()`
    - `timeRemaining: input.required<number>()`
    - `currentScore: input<number>(0)`
- [ ] `game-header.component.html` を作成
  - 正解の色のサンプル（大きく表示）
  - RGB値の表示
  - タイマー（カウントダウン）
    - 時間切れ警告（残り10秒以下で赤色など）
  - ラウンド進捗（"Round 3 / 5"）
  - 現在のスコア
- [ ] `game-header.component.css` を作成
  - ヘッダーレイアウト
  - タイマーのスタイル（アニメーション）
  - レスポンシブ対応
- [ ] `game-header.component.spec.ts` を作成

### Task 5.2: GameControlsComponentの作成
- [ ] `src/app/components/game-controls/` ディレクトリを作成
- [ ] `game-controls.component.ts` を作成
  - Standaloneコンポーネント
  - Inputs:
    - `hasPin: input<boolean>(false)`
    - `disabled: input<boolean>(false)`
  - Outputs:
    - `guess: output<void>()`
- [ ] `game-controls.component.html` を作成
  - Guessボタン
    - `hasPin` が false の場合は無効化
    - `disabled` が true の場合も無効化
- [ ] `game-controls.component.css` を作成
  - ボタンのスタイリング
  - ホバー効果
  - 無効化時のスタイル
- [ ] `game-controls.component.spec.ts` を作成

### Task 5.3: RoundDetailComponentの拡張
- [ ] `src/app/components/round-detail/round-detail.component.ts` を開く
- [ ] マップ版の情報を表示できるように拡張
  - `pin` プロパティがある場合は、ピンの座標も表示
  - `timeRemaining` を表示（使用時間を計算）
- [ ] `round-detail.component.html` を更新
  - 選択した色のカラーサンプルとRGB値
  - 正解の色のカラーサンプルとRGB値
  - 距離とスコア
  - 使用時間（マップ版の場合）

### Task 5.4: ResultComponentの拡張
- [ ] `src/app/components/result/result.component.ts` を開く
- [ ] マップ版の結果表示に対応
  - 現状の実装で両バージョンに対応できているか確認
  - 必要に応じて調整
- [ ] `result.component.html` を確認
  - RoundDetailコンポーネントで拡張した情報が表示されることを確認

---

## Phase 6: 統合とポリッシュ

### Task 6.1: MapGameComponentの作成
- [ ] `src/app/components/map-game/` ディレクトリを作成
- [ ] `map-game.component.ts` を作成
  - Standaloneコンポーネント
  - 必要なコンポーネントをインポート:
    - ModeSwitcherComponent
    - GameHeaderComponent
    - GradientMapComponent
    - GameControlsComponent
    - ResultComponent
  - MapGameService（またはGameService）を注入
  - TimerServiceを注入
  - ゲーム状態をSignalsで管理
  - タイマーのonTimeoutイベントを購読
- [ ] `map-game.component.html` を作成
  - テンプレート構造:

    ```html
    <app-mode-switcher [currentMode]="'map'" />
    @if (gameState().isComplete) {
      <app-result
        [gameState]="gameState()"
        (replay)="onReplay()" />
    } @else {
      <app-game-header
        [targetColor]="currentRound().targetColor"
        [currentRound]="gameState().currentRound"
        [totalRounds]="gameState().totalRounds"
        [timeRemaining]="timeRemaining()"
        [currentScore]="currentScore()" />
      <app-gradient-map
        [gradientMap]="currentGradientMap()"
        [pin]="currentPin()"
        [disabled]="isProcessing()"
        (pinPlaced)="onPinPlaced($event)" />
      <app-game-controls
        [hasPin]="currentPin() !== null"
        [disabled]="isProcessing()"
        (guess)="onGuess()" />
    }
    ```

- [ ] `map-game.component.css` を作成
  - レイアウト（ヘッダー、マップ、コントロール）
  - レスポンシブ対応
- [ ] イベントハンドラの実装
  - `onPinPlaced(coordinate: MapCoordinate): void`
  - `onGuess(): void`
  - `onReplay(): void`
  - `onTimeout(): void`
- [ ] `map-game.component.spec.ts` を作成

### Task 6.2: ルーティングの最終調整
- [ ] `app.routes.ts` を開く
- [ ] `/map` ルートのインポートパスを正しく設定
  - `./components/map-game/map-game.component` から `MapGameComponent` をインポート

### Task 6.3: ModeSwitcherコンポーネントの仕上げ
- [ ] `mode-switcher.component.css` を開く
- [ ] デザインを洗練
  - ヘッダーのスタイリング
  - リンクのホバー効果
  - アクティブ状態の視覚化（ボーダー、背景色など）
- [ ] モバイル対応
  - 小さな画面でのレイアウト調整
  - タッチ操作に適したタップ領域

### Task 6.4: スタイリングの調整
- [ ] 全体のカラーテーマを統一
- [ ] タイポグラフィの調整
- [ ] 余白とレイアウトの微調整
- [ ] モバイル、タブレット、デスクトップでの表示確認

### Task 6.5: アクセシビリティチェック
- [ ] キーボード操作の確認
  - Tabキーでフォーカス移動
  - Enterキーでボタン操作
  - 矢印キーでマップ移動（可能であれば）
- [ ] ARIA属性の追加
  - ボタンのaria-label
  - タイマーのaria-live
  - マップのaria-describedby
- [ ] スクリーンリーダーでのテスト
- [ ] 色のコントラスト比チェック（WCAG AA基準）

### Task 6.6: レスポンシブ対応の確認
- [ ] モバイル（320px-767px）での表示確認
  - マップのタッチ操作
  - UIの配置
- [ ] タブレット（768px-1023px）での表示確認
- [ ] デスクトップ（1024px以上）での表示確認
- [ ] 横向き・縦向きでの表示確認

### Task 6.7: パフォーマンス最適化
- [ ] グラデーションマップの生成を最適化
  - キャッシュの活用
  - オフスクリーンCanvasの検討
- [ ] イベントハンドラのスロットリング
  - パン操作
  - ズーム操作
- [ ] OnPush変更検知戦略の確認
- [ ] 不要な再描画の削減

### Task 6.8: 動作確認とテスト
- [ ] クラシックモードの動作確認（既存機能が壊れていないか）
  - ゲーム開始
  - 色の選択
  - スコア計算
  - ラウンド遷移
  - 結果表示
  - リプレイ
  - ModeSwitcherからマップモードへの遷移
- [ ] マップモードの動作確認
  - ゲーム開始
  - グラデーションマップの表示
  - パン・ズーム操作
  - ピン配置
  - タイマーのカウントダウン
  - タイムアウト処理
  - Guessボタンでの回答
  - スコア計算
  - ラウンド遷移
  - 結果表示
  - リプレイ
  - ModeSwitcherからクラシックモードへの遷移
- [ ] モード切替の動作確認
  - クラシック → マップの遷移
  - マップ → クラシックの遷移
  - URLの直接入力での遷移
  - ブラウザの戻る・進むボタン
- [ ] エッジケースのテスト
  - ピンを配置せずにタイムアウト
  - 素早く連続でGuessボタンを押す
  - マップの境界での操作
  - ゲーム中にモードを切り替える
- [ ] 既存のユニットテストを実行
  - `npm test`
  - すべてのテストがパスすることを確認
- [ ] 新規テストを実行
  - 新しいサービス・コンポーネントのテスト

---

## Phase 7: 追加機能（オプション）

### Task 7.1: ローカルストレージでのハイスコア保存
- [ ] StorageServiceの作成
  - パレット版とマップ版のハイスコアを個別に保存
- [ ] ゲーム終了時にハイスコアを保存
- [ ] ハイスコア表示UIの作成

### Task 7.2: 難易度設定
- [ ] 設定画面コンポーネントの作成
- [ ] クラシックモード: パレットサイズ変更（3x3, 5x5, 7x7）
- [ ] マップモード: 制限時間調整（30秒、60秒、90秒、無制限）
- [ ] マップモード: 色の範囲変更（難易度による）

### Task 7.3: 結果のシェア機能
- [ ] シェアボタンの追加
- [ ] Web Share APIの活用
- [ ] スコアをテキストとして生成
- [ ] SNSシェア用のテキストフォーマット

### Task 7.4: アニメーション効果
- [ ] ピン配置時のアニメーション
- [ ] スコア表示時のアニメーション
- [ ] ラウンド遷移のアニメーション
- [ ] タイマー警告のアニメーション

### Task 7.5: サウンドエフェクト
- [ ] AudioServiceの作成
- [ ] ピン配置音
- [ ] 正解・不正解の効果音
- [ ] タイマー警告音
- [ ] ゲーム終了音

### Task 7.6: モード間のハイスコア比較
- [ ] 統計画面コンポーネントの作成
- [ ] パレット版とマップ版のベストスコアを比較表示
- [ ] プレイ回数や平均スコアの表示

---

## 完了基準

各フェーズの完了基準：

- **Phase 0**: 既存ゲームが `/classic` で動作し、ModeSwitcherが表示される
- **Phase 1**: 新しいモデルとサービスが作成され、ユニットテストがパスする
- **Phase 2**: グラデーションマップが正しく生成され、Canvasに描画される
- **Phase 3**: マップのパン・ズーム・ピン配置が動作する
- **Phase 4**: マップモードのゲームロジックが完成し、タイマーと連携する
- **Phase 5**: すべてのUIコンポーネントが作成され、単体で動作する
- **Phase 6**: マップモードゲームが完全に動作し、両モードが正常に機能する
- **Phase 7**: オプション機能が実装され、ユーザー体験が向上する

---

## 注意事項

- 各タスクは独立して実行可能にする
- 既存のクラシックモードゲームを壊さないように注意
- コミットは小さく、頻繁に行う
- テストを書いてから実装する（TDD推奨）
- Angular Best Practicesに従う（Signals、OnPush、Standalone、inject()など）
- アクセシビリティを常に考慮する
