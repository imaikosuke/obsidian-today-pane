import { Notice, Plugin } from "obsidian";
import { registerCommands } from "./src/commands";
import { openTodayNote } from "./src/utils/viewManager";
import { TodayPaneSettings, DEFAULT_SETTINGS } from "./src/settings";
import { TodayPaneSettingTab } from "./src/ui/SettingsTab";

/**
 * 今日のノートを表示するプラグイン
 */
export default class TodayPanePlugin extends Plugin {
	settings: TodayPaneSettings;

	/**
	 * 設定を保存する
	 */
	async saveSettings(): Promise<void> {
		try {
			await this.saveData(this.settings);
		} catch {
			new Notice("エラーが発生しました。");
		}
	}

	/**
	 * プラグインが読み込まれたときに呼ばれる
	 */
	async onload(): Promise<void> {
		try {
			// 設定を読み込む
			this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

			// 設定タブを追加
			this.addSettingTab(new TodayPaneSettingTab(this.app, this));

			// コマンドを登録
			registerCommands(this);
			
			// 設定が有効な場合のみ、ワークスペースのレイアウトが準備できてから今日のノートを開く
			// これにより、Obsidian再起動時にも確実に開くことができる
			if (this.settings.autoOpenOnStartup) {
				this.app.workspace.onLayoutReady(async () => {
					try {
						await openTodayNote(this);
					} catch {
						new Notice("エラーが発生しました。");
					}
				});
			}
		} catch {
			new Notice("エラーが発生しました。");
		}
	}

	/**
	 * プラグインがアンロードされたときに呼ばれる
	 */
	onunload(): void {
		// 特にクリーンアップは不要
	}
}
