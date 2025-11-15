import { App, Vault } from "obsidian";

/**
 * Obsidian内部プラグインの型定義
 */
export interface InternalPlugins {
	plugins?: {
		dailyNotes?: {
			instance?: DailyNotesInstance;
			enabled?: boolean;
		};
	};
}

/**
 * デイリーノートプラグインのインスタンス型定義
 */
export interface DailyNotesInstance {
	options?: DailyNoteOptions;
	settings?: DailyNoteOptions;
}

/**
 * デイリーノートのオプション設定
 */
export interface DailyNoteOptions {
	folder?: string;
	template?: string;
	format?: string;
}

/**
 * Obsidianプラグインマネージャーの型定義
 */
export interface PluginManager {
	plugins?: {
		[key: string]: {
			settings?: DailyNoteOptions;
			options?: DailyNoteOptions;
		};
	};
}

/**
 * Vault設定の型定義
 */
export interface VaultConfig {
	dailyNoteFolder?: string;
	dailyNoteFormat?: string;
	dailyNoteTemplate?: string;
}

/**
 * 拡張されたVault型（内部APIアクセス用）
 */
export interface ExtendedVault extends Vault {
	config?: VaultConfig;
}

/**
 * 拡張されたApp型（内部APIアクセス用）
 * 交差型を使用してAppの型を拡張
 */
export type ExtendedApp = App & {
	internalPlugins?: InternalPlugins;
	plugins?: PluginManager;
	vault?: ExtendedVault;
};

