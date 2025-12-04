import { Plugin } from "obsidian";
import { openTodayNoteWithErrorHandling } from "../utils/viewManager";

/**
 * プラグインのコマンドを登録
 * @param plugin - プラグインインスタンス
 */
export function registerCommands(plugin: Plugin): void {
	// リボンアイコンを追加して今日のノートを開く
	plugin.addRibbonIcon("calendar-days", "Open today's note", () => {
		void openTodayNoteWithErrorHandling(plugin);
	});

	// コマンドを追加して今日のノートを開く
	plugin.addCommand({
		id: "open",
		name: "Open today's note",
		callback: () => {
			void openTodayNoteWithErrorHandling(plugin);
		},
	});
}

