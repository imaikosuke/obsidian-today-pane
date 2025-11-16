# Obsidian公式API型定義について

## 結論

`node_modules/obsidian/obsidian.d.ts` に公式の型定義ファイルが含まれています。

## 主要な公式API一覧

### Workspace API

- `Workspace.leftSplit` - 左サイドバーのスプリットを取得
- `Workspace.rightSplit` - 右サイドバーのスプリットを取得
- `Workspace.rootSplit` - ルートスプリットを取得
- `Workspace.containerEl` - ワークスペースのコンテナ要素
- `Workspace.layoutReady` - レイアウトが準備完了かどうか
- `Workspace.activeEditor` - 現在アクティブなエディタ
- `Workspace.onLayoutReady()` - レイアウト準備完了時のコールバックを登録
- `Workspace.getLayout()` - 現在のワークスペースレイアウトを取得
- `Workspace.getLeaf()` - 新しいまたは既存のリーフを取得
- `Workspace.getLeftLeaf()` - 左サイドバーのリーフを取得
- `Workspace.getRightLeaf()` - 右サイドバーのリーフを取得
- `Workspace.getActiveViewOfType()` - 指定された型のアクティブなビューを取得
- `Workspace.getActiveFile()` - 現在アクティブなファイルを取得
- `Workspace.getLeavesOfType()` - 指定された型のすべてのリーフを取得
- `Workspace.iterateRootLeaves()` - メインエリアのすべてのリーフを反復処理
- `Workspace.iterateAllLeaves()` - すべてのリーフ（サイドバー含む）を反復処理
- `Workspace.revealLeaf()` - リーフを前面に表示
- `Workspace.setActiveLeaf()` - アクティブなリーフを設定
- `Workspace.getLeafById()` - IDでリーフを取得
- `Workspace.getGroupLeaves()` - グループに属するすべてのリーフを取得
- `Workspace.getMostRecentLeaf()` - 最も最近アクティブだったリーフを取得
- `Workspace.ensureSideLeaf()` - サイドバーのリーフを取得または作成
- `Workspace.moveLeafToPopout()` - リーフをポップアウトウィンドウに移動
- `Workspace.openPopoutLeaf()` - ポップアウトウィンドウで新しいリーフを開く
- `Workspace.openLinkText()` - リンクテキストからファイルを開く
- `Workspace.detachLeavesOfType()` - 指定された型のすべてのリーフを削除
- `Workspace.getLastOpenFiles()` - 最近開いたファイルのリストを取得

### WorkspaceLeaf API

- `WorkspaceLeaf.parent` - リーフの親要素（WorkspaceTabsまたはWorkspaceMobileDrawer）
- `WorkspaceLeaf.view` - リーフに関連付けられたビュー
- `WorkspaceLeaf.hoverPopover` - ホバーポップオーバー
- `WorkspaceLeaf.openFile()` - リーフでファイルを開く
- `WorkspaceLeaf.open()` - リーフでビューを開く
- `WorkspaceLeaf.getViewState()` - ビューの状態を取得
- `WorkspaceLeaf.setViewState()` - ビューの状態を設定
- `WorkspaceLeaf.isDeferred` - リーフが延期されているかどうか
- `WorkspaceLeaf.loadIfDeferred()` - 延期されているリーフを読み込む
- `WorkspaceLeaf.getEphemeralState()` - 一時的な状態を取得
- `WorkspaceLeaf.setEphemeralState()` - 一時的な状態を設定
- `WorkspaceLeaf.togglePinned()` - ピン留めを切り替え
- `WorkspaceLeaf.setPinned()` - ピン留めを設定
- `WorkspaceLeaf.setGroupMember()` - グループメンバーを設定
- `WorkspaceLeaf.setGroup()` - グループを設定
- `WorkspaceLeaf.detach()` - リーフを分離
- `WorkspaceLeaf.getIcon()` - アイコン名を取得
- `WorkspaceLeaf.getDisplayText()` - 表示テキストを取得
- `WorkspaceLeaf.onResize()` - リサイズ時の処理

### WorkspaceSidedock API

- `WorkspaceSidedock.collapsed` - サイドバーが折りたたまれているかどうか
- `WorkspaceSidedock.toggle()` - サイドバーの表示/非表示を切り替え
- `WorkspaceSidedock.collapse()` - サイドバーを折りたたむ
- `WorkspaceSidedock.expand()` - サイドバーを展開

### FileView API

- `FileView.file` - ビューに関連付けられたファイル
- `FileView.allowNoFile` - ファイルなしを許可するかどうか
- `FileView.navigation` - ナビゲーション可能かどうか
- `FileView.getDisplayText()` - 表示テキストを取得
- `FileView.onLoadFile()` - ファイル読み込み時の処理
- `FileView.onUnloadFile()` - ファイルアンロード時の処理
- `FileView.onRename()` - ファイル名変更時の処理
- `FileView.canAcceptExtension()` - 拡張子を受け入れることができるかどうか

### MarkdownView API

- `MarkdownView.editor` - エディタインスタンス
- `MarkdownView.previewMode` - プレビューモードのビュー
- `MarkdownView.currentMode` - 現在のモード（ソースまたはプレビュー）
- `MarkdownView.hoverPopover` - ホバーポップオーバー
- `MarkdownView.getViewType()` - ビュータイプを取得
- `MarkdownView.getMode()` - 現在のモードを取得
- `MarkdownView.getViewData()` - ビューデータを取得
- `MarkdownView.clear()` - ビューをクリア
- `MarkdownView.setViewData()` - ビューデータを設定
- `MarkdownView.showSearch()` - 検索を表示

### Vault API

- `Vault.adapter` - データアダプタ
- `Vault.configDir` - 設定フォルダのパス
- `Vault.getName()` - ボルトの名前を取得
- `Vault.getFileByPath()` - パスでファイルを取得
- `Vault.getFolderByPath()` - パスでフォルダを取得
- `Vault.getAbstractFileByPath()` - パスでファイルまたはフォルダを取得
- `Vault.getRoot()` - ルートフォルダを取得
- `Vault.create()` - 新しいテキストファイルを作成
- `Vault.createBinary()` - 新しいバイナリファイルを作成
- `Vault.createFolder()` - 新しいフォルダを作成
- `Vault.read()` - ファイルを読み込む（ディスクから直接）
- `Vault.cachedRead()` - ファイルを読み込む（キャッシュから）
- `Vault.readBinary()` - バイナリファイルを読み込む
- `Vault.getResourcePath()` - リソースのURIを取得
- `Vault.delete()` - ファイルまたはフォルダを削除
- `Vault.trash()` - ファイルまたはフォルダをゴミ箱に移動
- `Vault.rename()` - ファイルまたはフォルダの名前を変更
- `Vault.modify()` - テキストファイルの内容を変更
- `Vault.modifyBinary()` - バイナリファイルの内容を変更
- `Vault.append()` - ファイルにテキストを追加
- `Vault.process()` - ファイル処理を実行
- `Vault.copy()` - ファイルまたはフォルダをコピー

### App API

- `App.keymap` - キーマップ
- `App.scope` - スコープ
- `App.workspace` - ワークスペース
- `App.vault` - ボルト
- `App.metadataCache` - メタデータキャッシュ
- `App.fileManager` - ファイルマネージャー
- `App.lastEvent` - 最後のユーザーインタラクションイベント
- `App.renderContext` - レンダリングコンテキスト
- `App.isDarkMode()` - ダークモードかどうかを判定
- `App.loadLocalStorage()` - ローカルストレージから値を読み込む
- `App.saveLocalStorage()` - ローカルストレージに値を保存

### Plugin API

- `Plugin.manifest` - プラグインのマニフェスト
- `Plugin.app` - アプリケーションインスタンス
- `Plugin.addCommand()` - コマンドを追加
- `Plugin.addRibbonIcon()` - リボンアイコンを追加
- `Plugin.addStatusBarItem()` - ステータスバーアイテムを追加
- `Plugin.addSettingTab()` - 設定タブを追加
- `Plugin.registerView()` - カスタムビューを登録
- `Plugin.registerExtensions()` - ファイル拡張子を登録
- `Plugin.registerMarkdownPostProcessor()` - マークダウンポストプロセッサを登録
- `Plugin.registerEditorSuggest()` - エディタサジェストを登録
- `Plugin.registerEvent()` - イベントを登録
- `Plugin.registerDomEvent()` - DOMイベントを登録
- `Plugin.registerInterval()` - インターバルを登録
- `Plugin.loadData()` - データを読み込む
- `Plugin.saveData()` - データを保存

### TFile / TFolder API

- `TFile.path` - ファイルのパス
- `TFile.name` - ファイル名
- `TFile.basename` - ベース名（拡張子なし）
- `TFile.extension` - 拡張子
- `TFile.stat` - ファイル統計情報
- `TFile.parent` - 親フォルダ
- `TFolder.path` - フォルダのパス
- `TFolder.name` - フォルダ名
- `TFolder.children` - 子ファイル/フォルダの配列
- `TFolder.isRoot()` - ルートフォルダかどうか

### MetadataCache API

- `MetadataCache.getFileCache()` - ファイルのキャッシュを取得
- `MetadataCache.getFirstLinkpathDest()` - リンクパスの最初の宛先を取得
- `MetadataCache.getLinkpathDestinations()` - リンクパスのすべての宛先を取得
- `MetadataCache.resolvedLinks` - 解決されたリンクのマップ
- `MetadataCache.unresolvedLinks` - 未解決のリンクのマップ

### Component API

- `Component.load()` - コンポーネントを読み込む
- `Component.unload()` - コンポーネントをアンロード
- `Component.addChild()` - 子コンポーネントを追加
- `Component.removeChild()` - 子コンポーネントを削除
- `Component.registerEvent()` - イベントを登録
- `Component.registerDomEvent()` - DOMイベントを登録
- `Component.registerInterval()` - インターバルを登録

### Modal API

- `Modal.titleEl` - タイトルの要素
- `Modal.contentEl` - コンテンツの要素
- `Modal.open()` - モーダルを開く
- `Modal.close()` - モーダルを閉じる
- `Modal.onOpen()` - モーダルが開かれたときの処理
- `Modal.onClose()` - モーダルが閉じられたときの処理

### Notice API

- `Notice.messageEl` - メッセージの要素
- `Notice.setMessage()` - メッセージを設定
- `Notice.hide()` - 通知を非表示

### Editor API

- `Editor.getValue()` - エディタの値を取得
- `Editor.setValue()` - エディタの値を設定
- `Editor.getSelection()` - 選択範囲を取得
- `Editor.setSelection()` - 選択範囲を設定
- `Editor.replaceSelection()` - 選択範囲を置換
- `Editor.replaceRange()` - 範囲を置換
- `Editor.getRange()` - 範囲のテキストを取得
- `Editor.getCursor()` - カーソル位置を取得
- `Editor.setCursor()` - カーソル位置を設定
- `Editor.getLine()` - 行のテキストを取得
- `Editor.getLineCount()` - 行数を取得
- `Editor.lineAt()` - 指定位置の行を取得
- `Editor.offsetToPos()` - オフセットを位置に変換
- `Editor.posToOffset()` - 位置をオフセットに変換

### ユーティリティ関数

- `normalizePath()` - パスを正規化
- `getLinkpath()` - リンクパスを取得
- `parseLinktext()` - リンクテキストを解析
- `htmlToMarkdown()` - HTMLをマークダウンに変換
- `getAllTags()` - すべてのタグを取得
- `getFrontMatterInfo()` - フロントマター情報を取得
- `parseFrontMatterTags()` - フロントマターのタグを解析
- `parseFrontMatterAliases()` - フロントマターのエイリアスを解析
- `arrayBufferToBase64()` - ArrayBufferをBase64に変換
- `base64ToArrayBuffer()` - Base64をArrayBufferに変換
- `arrayBufferToHex()` - ArrayBufferを16進数文字列に変換
- `hexToArrayBuffer()` - 16進数文字列をArrayBufferに変換
- `debounce()` - デバウンス関数を作成
- `getIcon()` - アイコンを取得
- `getIconIds()` - すべてのアイコンIDを取得
- `addIcon()` - カスタムアイコンを追加
- `loadMathJax()` - MathJaxを読み込む
- `loadMermaid()` - Mermaidを読み込む
- `loadPdfJs()` - PDF.jsを読み込む
- `loadPrism()` - Prismを読み込む
- `finishRenderMath()` - MathJaxのレンダリングを完了

## 注意事項

- 公式APIは`@public`マークが付いているもののみ使用すべき
- 内部API（`@public`マークがない）は変更される可能性がある
- `obsidian.d.ts`は自動生成されたファイルなので、直接編集しない
- 詳細は `node_modules/obsidian/obsidian.d.ts` を参照してください
