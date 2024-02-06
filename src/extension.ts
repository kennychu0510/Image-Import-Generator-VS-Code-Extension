// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { createImportIndex } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  const trackedFolders: Map<string, vscode.FileSystemWatcher> = new Map();

  context.subscriptions.push(
    vscode.commands.registerCommand('image-import-generator.untrackAll', async (selectedDir: vscode.Uri | undefined) => {
      trackedFolders.forEach((watcher) => {
        watcher.dispose();
      });
      trackedFolders.clear();
      vscode.window.showInformationMessage('Stopped tracking for all folders');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('image-import-generator.generateImportOnce', async (selectedDir: vscode.Uri | undefined) => {
      if (!selectedDir) {
        vscode.window.showErrorMessage('No directory selected');
        return;
      }
      try {
        createImportIndex(selectedDir.path);
        vscode.window.showInformationMessage('Updated import index successfully!');
      } catch (error) {
        if (error instanceof Error && error.message === 'No images found in directory') {
          vscode.window.showErrorMessage('No images found in directory');
        } else {
          vscode.window.showErrorMessage('Failed to update import index!');
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('image-import-generator.generateImportAutoTrack', async (selectedDir: vscode.Uri | undefined) => {
      if (!selectedDir) {
        vscode.window.showErrorMessage('No directory selected');
        return;
      }
      try {
        const folderPath = selectedDir.path;
        if (trackedFolders.has(folderPath)) {
          trackedFolders.get(folderPath)?.dispose();
          trackedFolders.delete(folderPath);
          vscode.window.showInformationMessage('Stopped tracking for folder');
          return;
        } else {
          try {
            createImportIndex(folderPath);
          } catch (error) {
            
          }
          vscode.window.showInformationMessage('Tracking folder to auto generate import index!');

          const watcher = vscode.workspace.createFileSystemWatcher(`${folderPath}/**/*`);

          // Dispose the watcher when the extension is deactivated
          watcher.onDidCreate(() => {
            createImportIndex(folderPath);
            vscode.window.showInformationMessage('Updated import index successfully!');
          });
          watcher.onDidDelete(() => {
            createImportIndex(folderPath);
            vscode.window.showInformationMessage('Updated import index successfully!');
          });
          context.subscriptions.push(watcher);
          trackedFolders.set(folderPath, watcher);
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          vscode.window.showErrorMessage(error.message);
        }
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
