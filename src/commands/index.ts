import { Notice, Plugin } from "obsidian";
import { openTodayNote } from "../utils/viewManager";

/**
 * プラグインのコマンドを登録
 * @param plugin - プラグインインスタンス
 */
export function registerCommands(plugin: Plugin): void {
	// リボンアイコンを追加して今日のノートを開く
	plugin.addRibbonIcon("calendar-days", "Open Today's Note", async () => {
		try {
			await openTodayNote(plugin);
		} catch {
			new Notice("エラーが発生しました。");
		}
	});

	// コマンドを追加して今日のノートを開く
	plugin.addCommand({
		id: "open-today-pane",
		name: "Open Today's Note",
		callback: async () => {
			try {
				await openTodayNote(plugin);
			} catch {
				new Notice("エラーが発生しました。");
			}
		},
	});
}

