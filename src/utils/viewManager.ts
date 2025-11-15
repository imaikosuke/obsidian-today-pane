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

		// 右サイドバーにファイルを開く
		const rightLeaf = workspace.getRightLeaf(false);
		if (rightLeaf) {
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

