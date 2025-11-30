import { App, Notice, TFile } from "obsidian";
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
		const internalPlugins = app.internalPlugins;
		
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
	} catch {
		new Notice("エラーが発生しました。");
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
		// より直接的なアクセス方法
		const extendedApp = app as ExtendedApp & {
			internalPlugins?: ExtendedApp["internalPlugins"] & {
				getPluginById?: (id: string) => {
					instance?: DailyNoteOptions;
					options?: DailyNoteOptions;
					settings?: DailyNoteOptions;
				} | null;
			};
		};
		if (extendedApp.internalPlugins?.getPluginById) {
			const dailyNotesPlugin = extendedApp.internalPlugins.getPluginById("daily-notes");
			if (dailyNotesPlugin) {
				// インスタンスから取得を試みる
				if (dailyNotesPlugin.instance) {
					const instance = dailyNotesPlugin.instance;
					const options = instance.options || instance.settings;
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
			// これは最後の手段で、通常は使用しない
			void vault;
		} catch {
			new Notice("エラーが発生しました。");
		}
	} catch {
		new Notice("エラーが発生しました。");
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

	// フォーマット文字列を文字ごとに処理（再帰関数を使用）
	const processFormat = (index: number, acc: string): string => {
		if (index >= format.length) {
			return acc;
		}
		
		// YYYY をチェック（4文字先読み）
		if (format.substr(index, 4) === "YYYY") {
			return processFormat(index + 4, acc + String(year));
		}
		// YY をチェック（2文字先読み、ただしYYYYの一部でないことを確認）
		else if (format.substr(index, 2) === "YY" && format.substr(index, 4) !== "YYYY") {
			return processFormat(index + 2, acc + yearShort);
		}
		// MM をチェック（2文字先読み）
		else if (format.substr(index, 2) === "MM") {
			return processFormat(index + 2, acc + month);
		}
		// DD をチェック（2文字先読み）
		else if (format.substr(index, 2) === "DD") {
			return processFormat(index + 2, acc + day);
		}
		// M をチェック（単独、MMの一部でないことを確認）
		else if (format[index] === "M" && format.substr(index, 2) !== "MM") {
			return processFormat(index + 1, acc + monthNoPad);
		}
		// D をチェック（単独、DDの一部でないことを確認）
		else if (format[index] === "D" && format.substr(index, 2) !== "DD") {
			return processFormat(index + 1, acc + dayNoPad);
		}
		// その他の文字はそのまま
		else {
			return processFormat(index + 1, acc + format[index]);
		}
	};

	return processFormat(0, "");
}

/**
 * 指定した日付のデイリーノートのファイルパスを取得
 * @param app - Obsidianアプリケーションインスタンス
 * @param date - 日付
 * @returns ファイルパス、またはnull（設定が見つからない場合）
 */
export function getDailyNotePathForDate(app: App, date: Date): string | null {
	const settings = getDailyNoteSettings(app);
	if (!settings) {
		return null;
	}

	const formattedDate = formatDateForDailyNote(date, settings.format);
	
	const folder = settings.folder || "";
	const path = folder ? `${folder}/${formattedDate}.md` : `${formattedDate}.md`;
	
	return path;
}

/**
 * 今日のデイリーノートのファイルパスを取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns ファイルパス、またはnull（設定が見つからない場合）
 */
export function getTodayDailyNotePath(app: App): string | null {
	const today = new Date();
	return getDailyNotePathForDate(app, today);
}

/**
 * 前日のデイリーノートのファイルパスを取得
 * @param app - Obsidianアプリケーションインスタンス
 * @returns ファイルパス、またはnull（設定が見つからない場合）
 */
export function getYesterdayDailyNotePath(app: App): string | null {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return getDailyNotePathForDate(app, yesterday);
}

/**
 * ファイルパスが今日以外のデイリーノートかどうかを判定
 * @param app - Obsidianアプリケーションインスタンス
 * @param filePath - チェックするファイルパス
 * @returns 今日以外のデイリーノートの場合true、それ以外はfalse
 */
export function isNonTodayDailyNote(app: App, filePath: string): boolean {
	const settings = getDailyNoteSettings(app);
	if (!settings) {
		return false;
	}

	const todayPath = getTodayDailyNotePath(app);
	if (!todayPath) {
		return false;
	}

	// 今日のデイリーノートの場合はfalse
	if (filePath === todayPath) {
		return false;
	}

	// デイリーノートのフォルダをチェック
	const folder = settings.folder || "";
	const format = settings.format || "YYYY-MM-DD";

	// ファイル名を取得（拡張子を除く）
	const nameWithoutExt: string = (() => {
		if (folder) {
			const folderPrefix = folder.endsWith("/") ? folder : `${folder}/`;
			// ファイルパスがデイリーノートのフォルダ内にあるかチェック
			if (!filePath.startsWith(folderPrefix)) {
				return "";
			}
			// フォルダ部分を除いたファイル名を取得
			const fileName = filePath.substring(folderPrefix.length);
			return fileName.replace(/\.md$/, "");
		} else {
			// フォルダが設定されていない場合、ファイル名を取得
			const fileName = filePath.split("/").pop() || "";
			return fileName.replace(/\.md$/, "");
		}
	})();

	// フォーマットに基づいて、デイリーノートのパターンを生成
	// フォーマット文字列を正規表現パターンに変換
	// YYYY -> \d{4}, YY -> \d{2}, MM -> \d{1,2}, M -> \d{1,2}, DD -> \d{1,2}, D -> \d{1,2}
	const pattern = format
		.replace(/YYYY/g, "\\d{4}")
		.replace(/YY(?![Y])/g, "\\d{2}")
		.replace(/MM(?![M])/g, "\\d{1,2}")
		.replace(/M(?![M])/g, "\\d{1,2}")
		.replace(/DD(?![D])/g, "\\d{1,2}")
		.replace(/D(?![D])/g, "\\d{1,2}")
		.replace(/([-/_.])/g, "\\$1"); // 区切り文字（-、/、_など）をエスケープ
	
	// パターンに一致するかチェック
	const regex = new RegExp(`^${pattern}$`);
	if (regex.test(nameWithoutExt)) {
		return true;
	}

	return false;
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
	} catch {
		new Notice("エラーが発生しました。");
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
		const initialTemplatePath = settings.template;
		
		// テンプレートファイルが存在するか確認（まず元のパスで検索）
		const initialTemplateFile = app.vault.getAbstractFileByPath(initialTemplatePath);
		
		// 見つからない場合、.md拡張子を追加して再検索
		const templateFile = (() => {
			if (initialTemplateFile instanceof TFile) {
				return initialTemplateFile;
			}
			
			const templatePathWithExt = initialTemplatePath.endsWith(".md") 
				? initialTemplatePath 
				: `${initialTemplatePath}.md`;
			const file = app.vault.getAbstractFileByPath(templatePathWithExt);
			
			if (file instanceof TFile) {
				return file;
			}
			
			return initialTemplateFile;
		})();
		
		if (!(templateFile instanceof TFile)) {
			return "";
		}

		// テンプレートファイルの内容を読み込む
		const content = await app.vault.read(templateFile);
		return content;
	} catch {
		new Notice("エラーが発生しました。");
		return "";
	}
}

/**
 * テンプレート内のフロントマターのdateフィールドを動的な日付で置換
 * @param templateContent - テンプレートの内容
 * @param date - 置換する日付
 * @param dateFormat - 日付の形式（例: "YYYY-MM-DD"）
 * @returns 置換後のテンプレート内容
 */
export function replaceDateInTemplate(
	templateContent: string,
	date: Date,
	dateFormat: string
): string {
	if (!templateContent) {
		return templateContent;
	}

	// フロントマターの開始と終了を検出
	const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = templateContent.match(frontMatterRegex);
	
	if (!match) {
		// フロントマターがない場合はそのまま返す
		return templateContent;
	}

	const frontMatter = match[1];
	const restOfContent = templateContent.substring(match[0].length);

	// 日付をフォーマット
	const formattedDate = formatDateForDailyNote(date, dateFormat);

	// dateフィールドを検出して置換
	// パターン: date: (任意の値) または date:(任意の値)
	// 行単位で処理する
	const lines = frontMatter.split('\n');
	
	const { newLines } = lines.reduce((acc, line, index) => {
		// date: で始まる行を検出（コロンの前後に空白があっても可）
		const dateLineMatch = line.match(/^(\s*)date\s*:\s*(.*)$/);
		if (dateLineMatch && !acc.dateReplaced) {
			// インデントを保持して置換
			const indent = dateLineMatch[1];
			return {
				newLines: [...acc.newLines, `${indent}date: ${formattedDate}`],
				dateReplaced: true
			};
		} else {
			return {
				newLines: [...acc.newLines, line],
				dateReplaced: acc.dateReplaced
			};
		}
	}, { newLines: [] as string[], dateReplaced: false });

	const newFrontMatter = newLines.join('\n');

	// フロントマターと残りのコンテンツを結合
	return `---\n${newFrontMatter}\n---\n${restOfContent}`;
}

