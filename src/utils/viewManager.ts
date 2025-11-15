import { Plugin } from "obsidian";
import { getTodayDailyNoteFile, getTodayDailyNotePath, getTemplateContent } from "./dailyNotes";

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
			// ファイルがまだ存在しない場合、テンプレートから作成する
			const templateContent = await getTemplateContent(app);
			file = await app.vault.create(notePath, templateContent);
		}

		// 右サイドバー全体にファイルを開く
		// まず、右サイドバー内に既に同じファイルが開かれているかチェック
		let rightLeafWithSameFile: any = null;
		try {
			const workspaceAny = workspace as any;
			
			// すべてのリーフを取得（複数の方法を試行）
			let allLeaves: any[] = [];
			if (workspaceAny.getLeaves) {
				allLeaves = workspaceAny.getLeaves();
			} else {
				// フォールバック: マークダウンビューのリーフを取得
				allLeaves = workspace.getLeavesOfType("markdown");
			}
			
			// 右サイドバーのコンテナを取得（複数の方法を試行）
			const rightSplit = workspaceAny.rightSplit;
			const rightSidebar = workspaceAny.rightSidebar || workspaceAny.rightDock || rightSplit;
			const container = rightSidebar?.containerEl;
			
			if (container) {
				// 右サイドバー内のリーフをフィルタリング
				const rightLeaves = allLeaves.filter((leaf: any) => {
					const leafEl = leaf.containerEl;
					if (!leafEl) return false;
					return container.contains(leafEl);
				});
				
				// 右サイドバー内のリーフで、既に同じファイルが開かれているかチェック
				for (const leaf of rightLeaves) {
					const currentView = leaf.view;
					if (!currentView) continue;
					
					// MarkdownViewの場合
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
		// まず、右サイドバーが存在するかどうかを確認
		const workspaceAny = workspace as any;
		const rightSidebar = workspaceAny.rightSidebar || workspaceAny.rightSplit || workspaceAny.rightDock;
		const hasRightSidebar = rightSidebar && rightSidebar.containerEl;
		
		// 右サイドバーが存在しない場合は、処理をスキップ（新規タブを開かない）
		if (!hasRightSidebar) {
			return;
		}
		
		// 右サイドバーが存在する場合、既存のリーフを取得
		let rightLeaf = workspace.getRightLeaf(false);
		
		// 右サイドバーが存在するが、リーフが取得できない場合は処理をスキップ
		if (!rightLeaf) {
			return;
		}
		
		// 右サイドバー内のすべてのリーフを再度チェック（念のため）
		try {
			let allLeaves: any[] = [];
			if (workspaceAny.getLeaves) {
				allLeaves = workspaceAny.getLeaves();
			} else {
				allLeaves = workspace.getLeavesOfType("markdown");
			}
			
			const container = rightSidebar.containerEl;
			const rightLeaves = allLeaves.filter((leaf: any) => {
				const leafEl = leaf.containerEl;
				if (!leafEl) return false;
				return container.contains(leafEl);
			});
			
			// 右サイドバー内のリーフで、既に同じファイルが開かれているかチェック
			for (const leaf of rightLeaves) {
				const currentView = leaf.view;
				if (!currentView) continue;
				
				const currentFile = (currentView as any)?.file;
				if (currentFile && currentFile.path === file.path) {
					// 既に同じファイルが開かれている場合は、処理をスキップ
					return;
				}
			}
			
			// 最上部のリーフを取得
			if (rightLeaves.length > 0) {
				let topLeaf: any = null;
				let topY = Infinity;
				
				for (const leaf of rightLeaves) {
					const leafEl = (leaf as any).containerEl;
					if (leafEl) {
						const rect = leafEl.getBoundingClientRect();
						const isVisible = rect.width > 0 && rect.height > 0;
						const isValidPosition = rect.top > 0 || (rect.top === 0 && rect.width > 0 && rect.height > 0);
						
						if (isVisible && isValidPosition && rect.top < topY) {
							topY = rect.top;
							topLeaf = leaf;
						}
					}
				}
				
				if (topLeaf) {
					rightLeaf = topLeaf;
				} else if (rightLeaves.length > 0) {
					rightLeaf = rightLeaves[0];
				}
			}
		} catch (error) {
			// エラーが発生した場合は、既存のリーフを使用
		}
		
		if (rightLeaf) {
			// 既に同じファイルが開かれているかチェック（念のため）
			const currentView = rightLeaf.view;
			const currentFile = (currentView as any)?.file;
			const isSameFile = currentFile && currentFile.path === file.path;
			
			if (!isSameFile) {
				// 既存のリーフに直接ファイルを開く（置き換え）
				await rightLeaf.openFile(file);
				workspace.revealLeaf(rightLeaf);
			}
		}
		// 右サイドバーが存在しない場合は、新規タブを開かずに処理をスキップ
		// これにより、ワークスペース初期化時に新規タブが開かれることを防ぐ
	} catch (error) {
		// エラーは無視
	}
}

