import { App, Vault } from "obsidian";

/**
 * Obsidian内部プラグインの型定義
 */
export interface InternalPlugins {
	plugins?: {
		dailyNotes?: {
			instance?: DailyNotesInstance;
			enabled?: boolean;
			options?: DailyNoteOptions;
			settings?: DailyNoteOptions;
		};
	};
	getPluginById?: (id: string) => {
		instance?: DailyNotesInstance;
		enabled?: boolean;
		options?: DailyNoteOptions;
		settings?: DailyNoteOptions;
	} | null;
	dailyNotes?: {
		instance?: DailyNotesInstance;
		enabled?: boolean;
		options?: DailyNoteOptions;
		settings?: DailyNoteOptions;
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
 * Workspace の内部 API 型定義
 */
export interface WorkspaceInternal {
	rightSplit?: {
		containerEl?: HTMLElement;
	};
	rightSidebar?: {
		containerEl?: HTMLElement;
	};
	rightDock?: {
		containerEl?: HTMLElement;
	};
	getLeaves?: () => LeafInternal[];
}

/**
 * Leaf の内部 API 型定義
 */
export interface LeafInternal {
	containerEl?: HTMLElement;
	view?: {
		file?: {
			path: string;
		};
	};
	detach?: () => void;
}

/**
 * 拡張されたApp型（内部APIアクセス用）
 * 交差型を使用してAppの型を拡張
 */
export type ExtendedApp = App & {
	internalPlugins?: InternalPlugins;
	plugins?: PluginManager;
	vault?: ExtendedVault;
	workspace?: WorkspaceInternal;
};

