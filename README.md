# Obsidian Today Pane

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/onikun94/obsidian-to-note/releases)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-7c3aed.svg)](https://obsidian.md)

A plugin that always displays today's daily note in the right sidebar. When you open Obsidian, today's note is automatically displayed, making it easy to keep daily records and manage tasks efficiently.

> **Note**: This plugin is currently planned for registration in the Obsidian Community Plugins. Currently, only manual installation is supported.

## Why This Plugin?

Without this plugin, displaying your daily note in the right sidebar requires manual work:

1. Open the daily note
2. Drag and drop the note to the right side panel
3. **Since the date is fixed, you need to repeat this operation every day**

With Today Pane, all this manual work is eliminated. Simply launch Obsidian, and today's note will automatically appear in the right sidebar, with the date automatically updated.

## Features

- **Auto-display**: Automatically displays today's daily note in the right sidebar when Obsidian starts
- **Manual open**: Open today's note anytime using the ribbon icon or command palette
- **Auto-create**: If today's note doesn't exist yet, it will be automatically created from your template
- **Duplicate prevention**: If the same note is already open, it won't be opened again

## Usage

### Basic Usage

1. **Daily Notes Plugin Setup**: To use this plugin, you need to have Obsidian's **Daily Notes** feature (core plugin) enabled
   - Enable it in **Settings → Core plugins → Daily notes**
   - Setting up the daily notes folder and date format will help this plugin work correctly

2. **Auto-display on Startup**: Once the plugin is enabled, today's note will automatically appear in the right sidebar when you launch Obsidian

3. **Manual Opening**:
   - **Ribbon Icon**: Click the calendar icon in the left sidebar
   - **Command Palette**: Press `Cmd/Ctrl + P` and type "Open Today's Note" to execute

### Settings

From **Settings → Community plugins → Today Pane**, you can change the following settings:

- **Auto-open on startup**: Whether to automatically open today's note when Obsidian starts (Default: Enabled)

## License

MIT
