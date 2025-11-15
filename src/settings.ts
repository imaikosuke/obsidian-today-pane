/**
 * プラグインの設定インターフェース
 */
export interface TodayPaneSettings {
	/**
	 * Obsidian起動時に自動で今日のノートを開くかどうか
	 */
	autoOpenOnStartup: boolean;
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: TodayPaneSettings = {
	autoOpenOnStartup: true,
};

