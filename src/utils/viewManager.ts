import { Plugin } from "obsidian";
import { getTodayDailyNoteFile, getTodayDailyNotePath } from "./dailyNotes";

/**
 * 今日のデイリーノートを開く
 * @param plugin - プラグインインスタンス
 * @returns Promise<void>
 */
export async function openTodayNote(plugin: Plugin): Promise<void> {
	const { app } = plugin;
	const { workspace } = app;

	try {
		// 今日のデイリーノートファイルを取得
		const notePath = getTodayDailyNotePath(app);

		if (!notePath) {
			return;
		}

		let file = await getTodayDailyNoteFile(app);

		if (!file) {
			// ファイルがまだ存在しない場合、作成する
			file = await app.vault.create(notePath, "");
		}

		// 右サイドバー全体にファイルを開く
		// まず、右サイドバー内に既に同じファイルが開かれているかチェック
		let rightLeafWithSameFile: any = null;
		try {
			const workspaceAny = workspace as any;
			const rightSplit = workspaceAny.rightSplit;
			
			if (rightSplit && rightSplit.containerEl) {
				// 全リーフを取得
				const allLeaves = (workspaceAny.getLeaves ? workspaceAny.getLeaves() : workspace.getLeavesOfType("markdown")) as any[];
				const container = rightSplit.containerEl;
				
				// 右サイドバー内のリーフをフィルタリング
				const rightLeaves = allLeaves.filter((leaf: any) => {
					const leafEl = leaf.containerEl;
					if (!leafEl) return false;
					return container.contains(leafEl);
				});
				
				// 右サイドバー内のリーフで、既に同じファイルが開かれているかチェック
				for (const leaf of rightLeaves) {
					const currentView = leaf.view;
					const currentFile = (currentView as any)?.file;
					if (currentFile && currentFile.path === file.path) {
						rightLeafWithSameFile = leaf;
						break;
					}
				}
			}
		} catch (error) {
			// エラーは無視して続行
		}
		
		// 既に同じファイルが開かれている場合は、処理をスキップ
		if (rightLeafWithSameFile) {
			return;
		}
		
		// 右サイドバーの最上部のリーフを取得
		let rightLeaf = workspace.getRightLeaf(false);
		
		// 右サイドバーが存在しない場合は作成
		if (!rightLeaf) {
			rightLeaf = workspace.getRightLeaf(true);
		} else {
			// 右サイドバーが存在する場合、最上部のリーフを取得
			// ワークスペースの内部構造から右サイドバーの最上部リーフを取得
			try {
				const workspaceAny = workspace as any;
				
				// 全リーフを取得（型定義にない可能性があるため、anyとして扱う）
				const allLeaves = (workspaceAny.getLeaves ? workspaceAny.getLeaves() : workspace.getLeavesOfType("markdown")) as any[];
				
				// 右サイドバーに関連する可能性のあるプロパティを確認
				const rightSidebar = workspaceAny.rightSidebar || workspaceAny.rightSplit || workspaceAny.rightDock || workspaceAny.rightContainer;
				
				if (rightSidebar && rightSidebar.containerEl) {
					// 右サイドバーのコンテナ内のすべてのリーフを取得
					const container = rightSidebar.containerEl;
					
					// 右サイドバー内のリーフをフィルタリング
					const rightLeaves = allLeaves.filter((leaf: any) => {
						const leafEl = leaf.containerEl;
						if (!leafEl) return false;
						// 右サイドバーのコンテナ内にあるか確認
						return container.contains(leafEl);
					});
					
					if (rightLeaves.length > 0) {
						// DOMの位置から最上部のリーフを特定
						// 各リーフのY座標を比較して、最も上にあるリーフを取得
						// ただし、実際に表示されているリーフ（幅と高さが0より大きい）のみを考慮
						let topLeaf: any = null;
						let topY = Infinity;
						
						for (let i = 0; i < rightLeaves.length; i++) {
							const leaf = rightLeaves[i];
							const leafEl = (leaf as any).containerEl;
							if (leafEl) {
								const rect = leafEl.getBoundingClientRect();
								
								// 実際に表示されているリーフのみを考慮（幅と高さが0より大きい）
								// Y座標が0の場合は、非表示または非アクティブなリーフの可能性がある
								const isVisible = rect.width > 0 && rect.height > 0;
								const isValidPosition = rect.top > 0 || (rect.top === 0 && rect.width > 0 && rect.height > 0);
								
								if (isVisible && isValidPosition && rect.top < topY) {
									topY = rect.top;
									topLeaf = leaf;
								}
							}
						}
						
						// 有効なリーフが見つからなかった場合、最初のリーフを使用
						if (!topLeaf && rightLeaves.length > 0) {
							topLeaf = rightLeaves[0];
						}
						
						if (topLeaf) {
							rightLeaf = topLeaf;
						}
					}
				}
			} catch (error) {
				// エラーが発生した場合は、既存のリーフを使用
			}
		}
		
		if (rightLeaf) {
			// 既に同じファイルが開かれているかチェック
			const currentView = rightLeaf.view;
			const currentFile = (currentView as any)?.file;
			const isSameFile = currentFile && currentFile.path === file.path;
			
			if (!isSameFile) {
				// 既存のリーフに直接ファイルを開く（置き換え）
				await rightLeaf.openFile(file);
				workspace.revealLeaf(rightLeaf);
			}
		} else {
			// フォールバック: 新しいリーフを作成
			const leaf = workspace.getLeaf(true);
			await leaf.openFile(file);
			workspace.revealLeaf(leaf);
		}
	} catch (error) {
		// エラーは無視
	}
}

