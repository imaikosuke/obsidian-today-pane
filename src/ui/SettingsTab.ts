import { App, Notice, PluginSettingTab, Setting, TextComponent } from "obsidian";
import TodayPanePlugin from "../../main";
import { MarkdownFileSuggest } from "./MarkdownFileSuggest";

/**
 * プラグインの設定タブ
 */
export class TodayPaneSettingTab extends PluginSettingTab {
	plugin: TodayPanePlugin;

	constructor(app: App, plugin: TodayPanePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * 入力欄を横に長くする
	 */
	private widenInput(text: TextComponent): TextComponent {
		text.inputEl.addClass("today-pane-settings-input");
		return text;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Auto-open on startup")
			.setDesc("Automatically open today's note when Obsidian starts")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoOpenOnStartup)
					.onChange(async (value) => {
						try {
							this.plugin.settings.autoOpenOnStartup = value;
							await this.plugin.saveSettings();
						} catch {
							new Notice("Error.");
						}
					})
			);

		new Setting(containerEl)
			.setName("Daily note override (optional)")
			.setHeading();

		containerEl.createEl("p", {
			text: "If set, these will override the default Obsidian daily notes settings. Leave empty to use the defaults.",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Daily note folder")
			.setDesc("Folder where daily notes are stored")
			.addText((text) => {
				this.widenInput(text)
					.setPlaceholder("Example: daily")
					.setValue(this.plugin.settings.customDailyNoteFolder)
					.onChange(async (value) => {
						// フォルダパスの正規化
						const normalizedValue = value
							.trim()
							.replace(/\\/g, "/")
							.replace(/^\/+/, "")
							.replace(/\/+$/, "");
						this.plugin.settings.customDailyNoteFolder = normalizedValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Daily note format")
			.setDesc("Date format for daily notes")
			.addText((text) => {
				this.widenInput(text)
					.setPlaceholder("Example: yyyy-mm-dd")
					.setValue(this.plugin.settings.customDailyNoteFormat)
					.onChange(async (value) => {
						this.plugin.settings.customDailyNoteFormat = value.trim();
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Daily note template file")
			.setDesc("Vault relative path to the template file")
			.addText((text) => {
				this.widenInput(text)
					.setPlaceholder("Example: templates/daily.md")
					.setValue(this.plugin.settings.customDailyNoteTemplate)
					.onChange(async (value) => {
						// パスの正規化
						const normalizedValue = value
							.trim()
							.replace(/\\/g, "/")
							.replace(/^\/+/, "");
						this.plugin.settings.customDailyNoteTemplate = normalizedValue;
						await this.plugin.saveSettings();
					});
				
				// サジェスト機能を紐付け
				new MarkdownFileSuggest(this.app, text.inputEl);
			});
	}
}

