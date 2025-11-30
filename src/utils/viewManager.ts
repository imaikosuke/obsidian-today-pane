import { Notice, Plugin } from "obsidian";
import { getTodayDailyNoteFile, getTodayDailyNotePath, isNonTodayDailyNote, getTemplateContent, replaceDateInTemplate } from "./dailyNotes";
import TodayPanePlugin from "../../main";

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
			let templateContent = await getTemplateContent(app);
			
			// テンプレート内のdateフィールドをYYYY-MM-DD形式で置換
			if (plugin instanceof TodayPanePlugin) {
				const today = new Date();
				const dateFormat = "YYYY-MM-DD";
				templateContent = replaceDateInTemplate(templateContent, today, dateFormat);
			}
			
			file = await app.vault.create(notePath, templateContent);
		}

		// 右サイドバー全体にファイルを開く
		// まず、右サイドバー内のリーフを取得して処理
		const workspaceAny = workspace as any;
		
		// 右サイドバーのコンテナを取得（複数の方法を試行）
		const rightSplit = workspaceAny.rightSplit;
		const rightSidebar = workspaceAny.rightSidebar || workspaceAny.rightDock || rightSplit;
		const hasRightSidebar = rightSidebar && rightSidebar.containerEl;
		
		// 右サイドバーが存在しない場合は、処理をスキップ
		if (!hasRightSidebar) {
			return;
		}
		
		// 右サイドバー内のリーフを取得して処理
		let rightLeafWithSameFile: any = null;
		let rightLeaves: any[] = [];
		const leavesToClose: any[] = [];
		
		try {
			// すべてのリーフを取得（複数の方法を試行）
			let allLeaves: any[] = [];
			if (workspaceAny.getLeaves) {
				allLeaves = workspaceAny.getLeaves();
			} else {
				// フォールバック: マークダウンビューのリーフを取得
				allLeaves = workspace.getLeavesOfType("markdown");
			}
			
			const container = rightSidebar.containerEl;
			
			if (container) {
				// 右サイドバー内のリーフをフィルタリング
				rightLeaves = allLeaves.filter((leaf: any) => {
					const leafEl = leaf.containerEl;
					if (!leafEl) return false;
					return container.contains(leafEl);
				});
				
				// 右サイドバー内のリーフを処理
				// 今日以外のデイリーノートが開いているリーフを特定
				for (const leaf of rightLeaves) {
					const currentView = leaf.view;
					if (!currentView) {
						continue;
					}
					
					// MarkdownViewの場合
					const currentFile = (currentView as any)?.file;
					if (!currentFile) {
						continue;
					}
					
					// 今日のデイリーノートが既に開かれているかチェック
					if (currentFile.path === file.path) {
						rightLeafWithSameFile = leaf;
						continue;
					}
					
					// 今日以外のデイリーノートが開かれている場合は閉じる
					const isNonToday = isNonTodayDailyNote(app, currentFile.path);
					
					if (isNonToday) {
						leavesToClose.push(leaf);
					}
				}
				
				// リーフを閉じる前に、再利用するリーフを決定
				// 閉じるリーフが1つだけの場合、そのリーフを再利用する
				let leafToReuse: any = null;
				if (leavesToClose.length === 1 && rightLeaves.length === 1) {
					// 閉じるリーフが1つだけで、右サイドバー内のリーフも1つだけの場合
					// そのリーフを再利用する（閉じずに直接ファイルを開く）
					leafToReuse = leavesToClose[0];
				} else {
					// 複数のリーフがある場合、閉じるリーフを閉じてから既存のリーフを使用
					for (const leaf of leavesToClose) {
						try {
							leaf.detach();
						} catch (error) {
							new Notice("エラーが発生しました。");
						}
					}
					
					// リーフを閉じた後、再度右サイドバー内のリーフを取得
					if (leavesToClose.length > 0) {
						// 少し待ってからリーフを再取得
						await new Promise(resolve => setTimeout(resolve, 100));
						
						// 再度リーフを取得
						let allLeavesAfter: any[] = [];
						if (workspaceAny.getLeaves) {
							allLeavesAfter = workspaceAny.getLeaves();
						} else {
							allLeavesAfter = workspace.getLeavesOfType("markdown");
						}
						
						rightLeaves = allLeavesAfter.filter((leaf: any) => {
							const leafEl = leaf.containerEl;
							if (!leafEl) return false;
							return container.contains(leafEl);
						});
					}
				}
				
				// 再利用するリーフがある場合は、それを使用
				if (leafToReuse) {
					rightLeaves = [leafToReuse];
				}
			}
		} catch (error) {
			new Notice("エラーが発生しました。");
		}
		
		// 既に同じファイルが開かれている場合は、そのリーフをアクティブにするだけ
		if (rightLeafWithSameFile) {
			workspace.revealLeaf(rightLeafWithSameFile);
			return;
		}
		
		// 右サイドバー内の既存のリーフを取得
		let rightLeaf: any = null;
		
		// 既存のリーフがある場合はそれを使用
		if (rightLeaves.length > 0) {
			// 最上部のリーフを取得
			try {
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
			} catch (error) {
				new Notice("エラーが発生しました。");
				if (rightLeaves.length > 0) {
					rightLeaf = rightLeaves[0];
				}
			}
		}
		
		// 既存のリーフがない場合、新規リーフを作成せずに処理をスキップ
		// （新規タブを作成しないようにする）
		if (!rightLeaf) {
			return;
		}
		
		// 既存のリーフに直接ファイルを開く（置き換え）
		await rightLeaf.openFile(file);
		workspace.revealLeaf(rightLeaf);
	} catch (error) {
		new Notice("エラーが発生しました。");
	}
}

