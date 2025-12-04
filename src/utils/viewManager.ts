import { App, Notice, Plugin, Workspace, TFile } from "obsidian";
import { getTodayDailyNoteFile, getTodayDailyNotePath, isNonTodayDailyNote, getTemplateContent, replaceDateInTemplate } from "./dailyNotes";
import { WorkspaceInternal, LeafInternal } from "../types/obsidian-internal";

/**
 * 今日のデイリーノートを開く（エラーハンドリング付き）
 * @param plugin - プラグインインスタンス
 */
export async function openTodayNoteWithErrorHandling(plugin: Plugin): Promise<void> {
	try {
		await openTodayNote(plugin);
	} catch {
		new Notice("Error.");
	}
}

/**
 * 右サイドバー内のリーフを取得して処理
 * @param workspaceInternal - ワークスペースの内部オブジェクト
 * @param rightSidebar - 右サイドバーのコンテナ
 * @param file - 開くファイル
 * @param app - Obsidianアプリケーションインスタンス
 * @returns 右サイドバー内のリーフ情報
 */
async function getRightSidebarLeaves(
	workspaceInternal: Workspace & WorkspaceInternal,
	rightSidebar: { containerEl: HTMLElement },
	file: TFile,
	app: App
): Promise<{ rightLeafWithSameFile: LeafInternal | null; rightLeaves: LeafInternal[] }> {
	try {
		// すべてのリーフを取得（複数の方法を試行）
		const allLeaves: LeafInternal[] = workspaceInternal.getLeaves
			? workspaceInternal.getLeaves()
			: workspaceInternal.getLeavesOfType("markdown") as unknown as LeafInternal[];
		
		const container = rightSidebar.containerEl;
		
		if (!container) {
			return { rightLeafWithSameFile: null, rightLeaves: [] };
		}
		
		// 右サイドバー内のリーフをフィルタリング
		const initialRightLeaves = allLeaves.filter((leaf) => {
			const leafEl = leaf.containerEl;
			if (!leafEl) return false;
			return container.contains(leafEl);
		});
		
		// 今日のデイリーノートが既に開かれているリーフを特定
		const rightLeafWithSameFile = initialRightLeaves.find((leaf) => {
			const currentView = leaf.view;
			if (!currentView) return false;
			
			const currentFile = currentView.file;
			if (!currentFile) return false;
			
			return currentFile.path === file.path;
		}) || null;
		
		// 今日以外のデイリーノートが開かれているリーフを特定
		const leavesToClose: LeafInternal[] = [];
		for (const leaf of initialRightLeaves) {
			const currentView = leaf.view;
			if (!currentView) continue;
			
			const currentFile = currentView.file;
			if (!currentFile) continue;
			
			// 今日のデイリーノートが既に開かれている場合はスキップ
			if (currentFile.path === file.path) continue;
			
			// 今日以外のデイリーノートが開かれている場合は閉じる
			if (isNonTodayDailyNote(app, currentFile.path)) {
				leavesToClose.push(leaf);
			}
		}
		
		// リーフを閉じる前に、再利用するリーフを決定
		// 閉じるリーフが1つだけの場合、そのリーフを再利用する
		const leafToReuse = leavesToClose.length === 1 && initialRightLeaves.length === 1
			? leavesToClose[0]
			: null;
		
		if (leafToReuse) {
			return { rightLeafWithSameFile, rightLeaves: [leafToReuse] };
		}
		
		// 複数のリーフがある場合、閉じるリーフを閉じる
		for (const leaf of leavesToClose) {
			try {
				if (leaf.detach) {
					leaf.detach();
				}
			} catch {
				new Notice("Error.");
			}
		}
		
		// リーフを閉じた後、再度右サイドバー内のリーフを取得
		if (leavesToClose.length > 0) {
			// 再度リーフを取得
			const allLeavesAfter: LeafInternal[] = workspaceInternal.getLeaves
				? workspaceInternal.getLeaves()
				: workspaceInternal.getLeavesOfType("markdown") as unknown as LeafInternal[];
			
			const rightLeaves = allLeavesAfter.filter((leaf) => {
				const leafEl = leaf.containerEl;
				if (!leafEl) return false;
				return container.contains(leafEl);
			});
			
			return { rightLeafWithSameFile, rightLeaves };
		}
		
		return { rightLeafWithSameFile, rightLeaves: initialRightLeaves };
	} catch {
		new Notice("Error.");
		return { rightLeafWithSameFile: null, rightLeaves: [] };
	}
}

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
			const today = new Date();
			const dateFormat = "YYYY-MM-DD";
			const templateContent = replaceDateInTemplate(rawTemplateContent, today, dateFormat);
			
			return await app.vault.create(notePath, templateContent);
		})();

		// 右サイドバー全体にファイルを開く
		// まず、右サイドバー内のリーフを取得して処理
		const workspaceInternal = workspace as Workspace & WorkspaceInternal;
		
		// 右サイドバーのコンテナを取得（複数の方法を試行）
		const rightSplit = workspaceInternal.rightSplit;
		const rightSidebar = workspaceInternal.rightSidebar || workspaceInternal.rightDock || rightSplit;
		const hasRightSidebar = rightSidebar && rightSidebar.containerEl;
		
		// 右サイドバーが存在しない場合は、処理をスキップ
		if (!hasRightSidebar || !rightSidebar.containerEl) {
			return;
		}
		
		// 右サイドバー内のリーフを取得して処理
		// hasRightSidebarチェックにより、containerElが存在することが保証されている
		const { rightLeafWithSameFile, rightLeaves } = await getRightSidebarLeaves(
			workspaceInternal,
			{ containerEl: rightSidebar.containerEl },
			file,
			app
		);
		
		// 既に同じファイルが開かれている場合は、そのリーフをアクティブにするだけ
		if (rightLeafWithSameFile) {
			workspace.revealLeaf(rightLeafWithSameFile as unknown as Parameters<typeof workspace.revealLeaf>[0]);
			return;
		}
		
		// 右サイドバー内の既存のリーフを取得
		const rightLeaf: LeafInternal | null = rightLeaves.length > 0
			? (() => {
				try {
					const topLeaf = rightLeaves.reduce((best: { leaf: LeafInternal; top: number } | null, leaf) => {
						const leafEl = leaf.containerEl;
						if (!leafEl) return best;
						
						const rect = leafEl.getBoundingClientRect();
						const isVisible = rect.width > 0 && rect.height > 0;
						const isValidPosition = rect.top > 0 || (rect.top === 0 && rect.width > 0 && rect.height > 0);
						
						if (!isVisible || !isValidPosition) return best;
						
						if (!best || rect.top < best.top) {
							return { leaf, top: rect.top };
						}
						return best;
					}, null);
					
					return topLeaf ? topLeaf.leaf : rightLeaves[0];
				} catch {
					new Notice("Error.");
					return rightLeaves[0];
				}
			})()
			: null;
		
		// 既存のリーフがない場合、新しいリーフを作成する
		const targetLeaf: Parameters<typeof workspace.revealLeaf>[0] | null = rightLeaf
			? (rightLeaf as unknown as Parameters<typeof workspace.revealLeaf>[0])
			: (() => {
				try {
					// 右サイドバーに新しいリーフを作成
					// getRightLeaf(false) は既存のリーフを返すか、存在しない場合は新しいリーフを作成する
					return workspace.getRightLeaf(false);
				} catch {
					new Notice("Could not create a leaf in the right sidebar.");
					return null;
				}
			})();
		
		if (!targetLeaf) {
			return;
		}
		
		// リーフにファイルを開く
		await targetLeaf.openFile(file);
		workspace.revealLeaf(targetLeaf);
	} catch {
		new Notice("Error.");
	}
}

