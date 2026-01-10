/**
 * プラグインの設定インターフェース
 */
export interface TodayPaneSettings {
	/**
	 * Obsidian起動時に自動で今日のノートを開くかどうか
	 */
	autoOpenOnStartup: boolean;

	/**
	 * デイリーノートを保存するフォルダ（空の場合は自動取得）
	 */
	customDailyNoteFolder: string;

	/**
	 * デイリーノートの日付フォーマット（空の場合は自動取得）
	 */
	customDailyNoteFormat: string;

	/**
	 * デイリーノートのテンプレートファイル（空の場合は自動取得）
	 */
	customDailyNoteTemplate: string;
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: TodayPaneSettings = {
	autoOpenOnStartup: true,
	customDailyNoteFolder: "",
	customDailyNoteFormat: "",
	customDailyNoteTemplate: "",
};

