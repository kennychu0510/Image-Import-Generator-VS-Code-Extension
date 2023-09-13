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
  console.log('Image import generator is active');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(
    vscode.commands.registerCommand('image-import-generator.generateImport', async (selectedDir: vscode.Uri | undefined) => {
			if (!selectedDir) {return;}
			try {
				createImportIndex(selectedDir.path);
				vscode.window.showInformationMessage('Created Import Index Successfully!');
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

