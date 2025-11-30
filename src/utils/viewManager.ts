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

		const existingFile = await getTodayDailyNoteFile(app);

		const file = existingFile ?? await (async () => {
			// ファイルがまだ存在しない場合、テンプレートから作成する
			const rawTemplateContent = await getTemplateContent(app);
			
			// テンプレート内のdateフィールドをYYYY-MM-DD形式で置換
			const templateContent = plugin instanceof TodayPanePlugin
				? (() => {
					const today = new Date();
					const dateFormat = "YYYY-MM-DD";
					return replaceDateInTemplate(rawTemplateContent, today, dateFormat);
				})()
				: rawTemplateContent;
			
			return await app.vault.create(notePath, templateContent);
		})();

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
		const { rightLeafWithSameFile, rightLeaves } = await (async () => {
			try {
				// すべてのリーフを取得（複数の方法を試行）
				const allLeaves: any[] = workspaceAny.getLeaves
					? workspaceAny.getLeaves()
					: workspace.getLeavesOfType("markdown");
				
				const container = rightSidebar.containerEl;
				
				if (!container) {
					return { rightLeafWithSameFile: null, rightLeaves: [] };
				}
				
				// 右サイドバー内のリーフをフィルタリング
				const initialRightLeaves = allLeaves.filter((leaf: any) => {
					const leafEl = leaf.containerEl;
					if (!leafEl) return false;
					return container.contains(leafEl);
				});
				
				// 右サイドバー内のリーフを処理
				// 今日以外のデイリーノートが開いているリーフを特定
				const rightLeafWithSameFile = initialRightLeaves.find((leaf: any) => {
					const currentView = leaf.view;
					if (!currentView) return false;
					
					// MarkdownViewの場合
					const currentFile = (currentView as any)?.file;
					if (!currentFile) return false;
					
					// 今日のデイリーノートが既に開かれているかチェック
					return currentFile.path === file.path;
				}) || null;
				
				// 今日以外のデイリーノートが開かれているリーフを特定
				const leavesToClose: any[] = [];
				for (const leaf of initialRightLeaves) {
					const currentView = leaf.view;
					if (!currentView) {
						continue;
					}
					
					// MarkdownViewの場合
					const currentFile = (currentView as any)?.file;
					if (!currentFile) {
						continue;
					}
					
					// 今日のデイリーノートが既に開かれている場合はスキップ
					if (currentFile.path === file.path) {
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
				const leafToReuse = leavesToClose.length === 1 && initialRightLeaves.length === 1
					? leavesToClose[0]
					: null;
				
				if (leafToReuse) {
					// 再利用するリーフがある場合は、それを使用
					return { rightLeafWithSameFile, rightLeaves: [leafToReuse] };
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
						const allLeavesAfter: any[] = workspaceAny.getLeaves
							? workspaceAny.getLeaves()
							: workspace.getLeavesOfType("markdown");
						
						const rightLeaves = allLeavesAfter.filter((leaf: any) => {
							const leafEl = leaf.containerEl;
							if (!leafEl) return false;
							return container.contains(leafEl);
						});
						
						return { rightLeafWithSameFile, rightLeaves };
					} else {
						return { rightLeafWithSameFile, rightLeaves: initialRightLeaves };
					}
				}
			} catch (error) {
				new Notice("エラーが発生しました。");
				return { rightLeafWithSameFile: null, rightLeaves: [] };
			}
		})();
		
		// 既に同じファイルが開かれている場合は、そのリーフをアクティブにするだけ
		if (rightLeafWithSameFile) {
			workspace.revealLeaf(rightLeafWithSameFile);
			return;
		}
		
		// 右サイドバー内の既存のリーフを取得
		const rightLeaf: any = (() => {
			// 既存のリーフがある場合はそれを使用
			if (rightLeaves.length === 0) {
				return null;
			}
			
			// 最上部のリーフを取得
			try {
				const topLeaf = rightLeaves.reduce((best: any, leaf: any) => {
					const leafEl = (leaf as any).containerEl;
					if (!leafEl) return best;
					
					const rect = leafEl.getBoundingClientRect();
					const isVisible = rect.width > 0 && rect.height > 0;
					const isValidPosition = rect.top > 0 || (rect.top === 0 && rect.width > 0 && rect.height > 0);
					
					if (!isVisible || !isValidPosition) return best;
					
					if (!best || rect.top < best.top) {
						return { leaf, top: rect.top };
					}
					return best;
				}, null as { leaf: any; top: number } | null);
				
				return topLeaf ? topLeaf.leaf : rightLeaves[0];
			} catch (error) {
				new Notice("エラーが発生しました。");
				return rightLeaves[0];
			}
		})();
		
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

