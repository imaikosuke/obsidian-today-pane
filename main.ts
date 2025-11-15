import { Plugin } from "obsidian";
import { registerCommands } from "./src/commands";

/**
 * 今日のノートを表示するプラグイン
 */
export default class TodayPanePlugin extends Plugin {
	/**
	 * プラグインが読み込まれたときに呼ばれる
	 */
	async onload(): Promise<void> {
		// コマンドを登録
		registerCommands(this);
	}

	/**
	 * プラグインがアンロードされたときに呼ばれる
	 */
	onunload(): void {
		// 特にクリーンアップは不要
	}
}
