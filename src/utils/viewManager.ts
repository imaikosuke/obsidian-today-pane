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
		let file = await getTodayDailyNoteFile(app);
		const notePath = getTodayDailyNotePath(app);

		if (!notePath) {
			console.error("[TodayPane] notePath is null");
			return;
		}

		if (!file) {
			// ファイルがまだ存在しない場合、作成する
			file = await app.vault.create(notePath, "");
		}

		// 右サイドバー全体にファイルを開く
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
				const rightSidebar = workspaceAny.rightSidebar;
				
				if (rightSidebar && rightSidebar.containerEl) {
					// 右サイドバーのコンテナ内のすべてのリーフを取得
					const container = rightSidebar.containerEl;
					// ワークスペースのすべてのリーフを取得するために、内部APIを使用
					const allWorkspaceLeaves = workspaceAny.getLeaves ? workspaceAny.getLeaves() : workspace.getLeavesOfType("markdown");
					
					// 右サイドバー内のリーフをフィルタリング
					const rightLeaves = allWorkspaceLeaves.filter((leaf: any) => {
						const leafEl = leaf.containerEl;
						if (!leafEl) return false;
						// 右サイドバーのコンテナ内にあるか確認
						return container.contains(leafEl);
					});
					
					if (rightLeaves.length > 0) {
						// DOMの位置から最上部のリーフを特定
						// 各リーフのY座標を比較して、最も上にあるリーフを取得
						let topLeaf = rightLeaves[0];
						let topY = Infinity;
						
						for (const leaf of rightLeaves) {
							const leafEl = (leaf as any).containerEl;
							if (leafEl) {
								const rect = leafEl.getBoundingClientRect();
								if (rect.top < topY) {
									topY = rect.top;
									topLeaf = leaf;
								}
							}
						}
						
						rightLeaf = topLeaf;
					}
				}
			} catch (error) {
				// エラーが発生した場合は、既存のリーフを使用
				console.warn("[TodayPane] Failed to get top leaf, using existing leaf:", error);
			}
		}
		
		if (rightLeaf) {
			// 既存のリーフに直接ファイルを開く（置き換え）
			await rightLeaf.openFile(file);
			workspace.revealLeaf(rightLeaf);
		} else {
			// フォールバック: 新しいリーフを作成
			const leaf = workspace.getLeaf(true);
			await leaf.openFile(file);
			workspace.revealLeaf(leaf);
		}
	} catch (error) {
		console.error("[TodayPane] error opening today note:", error);
	}
}

