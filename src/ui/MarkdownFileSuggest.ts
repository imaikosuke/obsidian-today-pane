import { AbstractInputSuggest, App, TFile } from "obsidian";

/**
 * Markdownファイルのサジェストクラス
 */
export class MarkdownFileSuggest extends AbstractInputSuggest<TFile> {
	private inputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	/**
	 * クエリに基づいて候補を取得する
	 * @param query - 入力されたクエリ
	 * @returns 候補のリスト（最大5件）
	 */
	getSuggestions(query: string): TFile[] {
		if (!query) {
			return [];
		}

		const lowerCaseQuery = query.toLowerCase().replace(/\\/g, "/");
		const files = this.app.vault.getMarkdownFiles();
		
		return files
			.filter((file) => {
				const path = file.path.toLowerCase();
				const basename = file.basename.toLowerCase();
				return path.includes(lowerCaseQuery) || basename.includes(lowerCaseQuery);
			})
			.sort((a, b) => {
				const aPath = a.path.toLowerCase();
				const bPath = b.path.toLowerCase();
				const aBase = a.basename.toLowerCase();
				const bBase = b.basename.toLowerCase();

				// 優先順位 1: basename がクエリで始まる
				const aBaseStarts = aBase.startsWith(lowerCaseQuery);
				const bBaseStarts = bBase.startsWith(lowerCaseQuery);
				if (aBaseStarts && !bBaseStarts) return -1;
				if (!aBaseStarts && bBaseStarts) return 1;

				// 優先順位 2: path がクエリで始まる
				const aPathStarts = aPath.startsWith(lowerCaseQuery);
				const bPathStarts = bPath.startsWith(lowerCaseQuery);
				if (aPathStarts && !bPathStarts) return -1;
				if (!aPathStarts && bPathStarts) return 1;

				// 優先順位 3: パスの長さが短い順
				return aPath.length - bPath.length;
			})
			.slice(0, 5);
	}

	/**
	 * 候補をレンダリングする
	 * @param file - 候補のファイル
	 * @param el - レンダリング先の要素
	 */
	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.createEl("div", { text: file.basename, cls: "suggestion-title" });
		el.createEl("small", { text: file.path, cls: "suggestion-content" });
	}

	/**
	 * 候補が選択されたときの処理
	 * @param file - 選択されたファイル
	 */
	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.path;
		// Obsidianが HTMLElement に拡張している trigger メソッドを呼び出す
		// これにより Setting の onChange が発火する
		const el = this.inputEl as HTMLElement & { trigger: (name: string) => void };
		if (typeof el.trigger === "function") {
			el.trigger("input");
		}
		this.close();
	}
}
