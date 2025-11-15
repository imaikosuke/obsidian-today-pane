import { Plugin } from "obsidian";
import { registerCommands } from "./src/commands";
import { openTodayNote } from "./src/utils/viewManager";

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
		
		// ワークスペースのレイアウトが準備できてから今日のノートを開く
		// これにより、Obsidian再起動時にも確実に開くことができる
		this.app.workspace.onLayoutReady(async () => {
			await openTodayNote(this);
		});
	}

	/**
	 * プラグインがアンロードされたときに呼ばれる
	 */
	onunload(): void {
		// 特にクリーンアップは不要
	}
}
