import { App, TFile } from "obsidian";
import { ExtendedApp, DailyNoteOptions } from "../types/obsidian-internal";

/**
 * デイリーノートの設定情報
 */
export interface DailyNoteSettings {
	folder: string;
	template: string;
	format: string;
}

/**
 * デイリーノートのオプションから設定を取得
 * @param options - デイリーノートのオプション
 * @returns 設定情報、またはnull
 */
function extractSettingsFromOptions(options: DailyNoteOptions | undefined): DailyNoteSettings | null {
	if (!options) {
		return null;
	}

	return {
		folder: options.folder || "",
		template: options.template || "",
		format: options.format || "YYYY-MM-DD",
	};
}

/**
 * Obsidianの内部プラグインからデイリーノート設定を取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns 設定情報、またはnull
 */
function getSettingsFromInternalPlugins(app: ExtendedApp): DailyNoteSettings | null {
	try {
		const appAny = app as any;
		const internalPlugins = appAny.internalPlugins;
		
		if (!internalPlugins) {
			return null;
		}

		// 方法1: plugins.dailyNotes から取得
		const plugins = internalPlugins.plugins;
		if (plugins && plugins.dailyNotes) {
			const dailyNotesPlugin = plugins.dailyNotes;
			
			// インスタンスから取得を試みる
			if (dailyNotesPlugin.instance) {
				const instance = dailyNotesPlugin.instance;
				const options = instance.options || instance.settings;
				if (options) {
					const settings = extractSettingsFromOptions(options);
					if (settings && (settings.folder !== undefined || settings.format)) {
						return settings;
					}
				}
			}
			
			// プラグインオブジェクト自体から取得を試みる
			if (dailyNotesPlugin.options || dailyNotesPlugin.settings) {
				const settings = extractSettingsFromOptions(
					dailyNotesPlugin.options || dailyNotesPlugin.settings
				);
				if (settings && (settings.folder !== undefined || settings.format)) {
					return settings;
				}
			}
		}

		// 方法2: getPluginById を使用
		if (internalPlugins.getPluginById) {
			const dailyNotesPlugin = internalPlugins.getPluginById("daily-notes");
			if (dailyNotesPlugin) {
				if (dailyNotesPlugin.instance) {
					const instance = dailyNotesPlugin.instance;
					const options = instance.options || instance.settings;
					if (options) {
						const settings = extractSettingsFromOptions(options);
						if (settings && (settings.folder !== undefined || settings.format)) {
							return settings;
						}
					}
				}
				
				if (dailyNotesPlugin.options || dailyNotesPlugin.settings) {
					const settings = extractSettingsFromOptions(
						dailyNotesPlugin.options || dailyNotesPlugin.settings
					);
					if (settings && (settings.folder !== undefined || settings.format)) {
						return settings;
					}
				}
			}
		}

		// 方法3: 直接アクセス
		if (internalPlugins.dailyNotes) {
			const dailyNotesPlugin = internalPlugins.dailyNotes;
			if (dailyNotesPlugin.instance) {
				const instance = dailyNotesPlugin.instance;
				const options = instance.options || instance.settings;
				if (options) {
					const settings = extractSettingsFromOptions(options);
					if (settings && (settings.folder !== undefined || settings.format)) {
						return settings;
					}
				}
			}
		}

		return null;
	} catch (error) {
		return null;
	}
}

/**
 * コミュニティプラグインからデイリーノート設定を取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns 設定情報、またはnull
 */
function getSettingsFromCommunityPlugins(app: ExtendedApp): DailyNoteSettings | null {
	const plugins = app.plugins;
	if (!plugins?.plugins) {
		return null;
	}

	const dailyNotes = plugins.plugins["daily-notes"];
	if (!dailyNotes) {
		return null;
	}

	return extractSettingsFromOptions(dailyNotes.settings || dailyNotes.options);
}

/**
 * Vault設定からデイリーノート設定を取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns 設定情報、またはnull
 */
function getSettingsFromVaultConfig(app: ExtendedApp): DailyNoteSettings | null {
	const vault = app.vault;
	if (!vault?.config) {
		return null;
	}

	const config = vault.config;
	if (!config.dailyNoteFolder && !config.dailyNoteFormat) {
		return null;
	}

	return {
		folder: config.dailyNoteFolder || "",
		template: config.dailyNoteTemplate || "",
		format: config.dailyNoteFormat || "YYYY-MM-DD",
	};
}

/**
 * Obsidianからデイリーノート設定を取得
 * 複数の方法を順番に試行して設定を取得します。
 * @param app - Obsidianアプリケーションインスタンス
 * @returns 設定情報、またはnull（設定が見つからない場合）
 */
export function getDailyNoteSettings(app: App): DailyNoteSettings | null {
	const extendedApp = app as ExtendedApp;

	// Method 1: 内部プラグインから取得
	const internalSettings = getSettingsFromInternalPlugins(extendedApp);
	if (internalSettings) {
		return internalSettings;
	}

	// Method 2: コミュニティプラグインから取得
	const communitySettings = getSettingsFromCommunityPlugins(extendedApp);
	if (communitySettings) {
		return communitySettings;
	}

	// Method 3: Vault設定から取得（フォールバック）
	const vaultSettings = getSettingsFromVaultConfig(extendedApp);
	if (vaultSettings) {
		return vaultSettings;
	}

	// Method 4: 直接的なアクセス方法を試す
	try {
		const appAny = app as any;
		
		// より直接的なアクセス方法
		if (appAny.internalPlugins?.getPluginById) {
			const dailyNotesPlugin = appAny.internalPlugins.getPluginById("daily-notes");
			if (dailyNotesPlugin) {
				// インスタンスから取得を試みる
				if (dailyNotesPlugin.instance) {
					const instance = dailyNotesPlugin.instance;
					const options = instance.options || instance.settings || instance;
					const settings = extractSettingsFromOptions(options);
					if (settings) {
						return settings;
					}
				}
				// プラグインオブジェクト自体から取得を試みる
				if (dailyNotesPlugin.options || dailyNotesPlugin.settings) {
					const settings = extractSettingsFromOptions(
						dailyNotesPlugin.options || dailyNotesPlugin.settings
					);
					if (settings) {
						return settings;
					}
				}
			}
		}

		// Method 5: グローバル設定から取得を試みる
		try {
			const vault = app.vault;
			const adapter = (vault as any).adapter;
			if (adapter && adapter.basePath) {
				// これは最後の手段で、通常は使用しない
			}
		} catch (error) {
			// 無視
		}
	} catch (error) {
		// 無視
	}

	return null;
}

/**
 * 日付をデイリーノート形式にフォーマット
 * @param date - フォーマットする日付
 * @param format - フォーマット文字列（例: "YYYY-MM-DD", "YYYY/MM/DD", "YYYY/MM/YYYY-MM-DD"）
 * @returns フォーマットされた日付文字列
 */
export function formatDateForDailyNote(date: Date, format: string): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const yearShort = String(year).slice(-2);
	const monthNoPad = String(date.getMonth() + 1);
	const dayNoPad = String(date.getDate());

	// フォーマット文字列を文字ごとに処理
	let result = "";
	let i = 0;
	
	while (i < format.length) {
		// YYYY をチェック（4文字先読み）
		if (format.substr(i, 4) === "YYYY") {
			result += String(year);
			i += 4;
		}
		// YY をチェック（2文字先読み、ただしYYYYの一部でないことを確認）
		else if (format.substr(i, 2) === "YY" && format.substr(i, 4) !== "YYYY") {
			result += yearShort;
			i += 2;
		}
		// MM をチェック（2文字先読み）
		else if (format.substr(i, 2) === "MM") {
			result += month;
			i += 2;
		}
		// DD をチェック（2文字先読み）
		else if (format.substr(i, 2) === "DD") {
			result += day;
			i += 2;
		}
		// M をチェック（単独、MMの一部でないことを確認）
		else if (format[i] === "M" && format.substr(i, 2) !== "MM") {
			result += monthNoPad;
			i += 1;
		}
		// D をチェック（単独、DDの一部でないことを確認）
		else if (format[i] === "D" && format.substr(i, 2) !== "DD") {
			result += dayNoPad;
			i += 1;
		}
		// その他の文字はそのまま
		else {
			result += format[i];
			i += 1;
		}
	}

	return result;
}

/**
 * 今日のデイリーノートのファイルパスを取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns ファイルパス、またはnull（設定が見つからない場合）
 */
export function getTodayDailyNotePath(app: App): string | null {
	const settings = getDailyNoteSettings(app);
	if (!settings) {
		return null;
	}

	const today = new Date();
	const formattedDate = formatDateForDailyNote(today, settings.format);
	
	const folder = settings.folder || "";
	let path: string;
	
	if (folder) {
		path = `${folder}/${formattedDate}.md`;
	} else {
		path = `${formattedDate}.md`;
	}
	
	return path;
}

/**
 * 今日のデイリーノートファイルを取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns ファイルオブジェクト、またはnull（ファイルが存在しない場合）
 */
export async function getTodayDailyNoteFile(app: App): Promise<TFile | null> {
	const path = getTodayDailyNotePath(app);
	if (!path) {
		return null;
	}

	try {
		const file = app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			return file;
		}
	} catch (error) {
		// ファイル取得エラーは無視し、nullを返す
	}

	return null;
}

/**
 * テンプレートファイルの内容を取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns テンプレートファイルの内容、または空文字列（テンプレートが存在しない場合）
 */
export async function getTemplateContent(app: App): Promise<string> {
	const settings = getDailyNoteSettings(app);
	if (!settings || !settings.template) {
		return "";
	}

	try {
		// テンプレートファイルのパスを取得
		let templatePath = settings.template;
		
		// テンプレートファイルが存在するか確認（まず元のパスで検索）
		let templateFile = app.vault.getAbstractFileByPath(templatePath);
		
		// 見つからない場合、.md拡張子を追加して再検索
		if (!(templateFile instanceof TFile)) {
			const templatePathWithExt = templatePath.endsWith(".md") ? templatePath : `${templatePath}.md`;
			templateFile = app.vault.getAbstractFileByPath(templatePathWithExt);
			if (templateFile instanceof TFile) {
				templatePath = templatePathWithExt;
			}
		}
		
		if (!(templateFile instanceof TFile)) {
			return "";
		}

		// テンプレートファイルの内容を読み込む
		const content = await app.vault.read(templateFile);
		return content;
	} catch (error) {
		// エラーが発生した場合は空文字列を返す
		return "";
	}
}

