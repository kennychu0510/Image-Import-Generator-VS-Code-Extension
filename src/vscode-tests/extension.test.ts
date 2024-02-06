import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';

const workspaceFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;

suite('Image Import Generator', () => {
  const showErrorMessageSpy = sinon.spy(vscode.window, 'showErrorMessage');

  test('Generate images once - Scenario 1: No selected directory', async () => {
    vscode.commands.executeCommand('image-import-generator.generateImportOnce');
    await sleep();
    assert.ok(showErrorMessageSpy.calledWith('No directory selected'));
  });

  test('Generate images once - Scenario 2: Selected directory with no images', async () => {
    const folderPath = path.join(workspaceFolder, 'no-images');
    const uri = vscode.Uri.file(folderPath);
    vscode.commands.executeCommand('image-import-generator.generateImportOnce', uri);
    await sleep();
    assert.ok(showErrorMessageSpy.calledWith('No images found in directory'));
  });

  test('Generate images once - Scenario 3: folder with images', async () => {
    const folderPath = path.join(workspaceFolder, 'with-images');
    const uri = vscode.Uri.file(folderPath);

    // delete index.ts inside folderPath if exists
    const indexFilePath = path.join(folderPath, 'index.ts');
    if (fs.existsSync(indexFilePath)) {
      fs.unlinkSync(indexFilePath);
    }

    const imageFolder = fs.readdirSync(folderPath);

    assert.equal(imageFolder.length, 3);

    vscode.commands.executeCommand('image-import-generator.generateImportOnce', uri);
    await sleep();
    assert.ok(showErrorMessageSpy.notCalled);
    assert.ok(fs.existsSync(indexFilePath));

    const indexContent = fs.readFileSync(indexFilePath, 'utf-8');
    const expectedContent = await getValidationFile('with-images');
    assert.equal(indexContent, expectedContent);
  });

  test('Generate images once - Scenario 4: folder with images containing spaces', async () => {
    const folderPath = path.join(workspaceFolder, 'with-images-spaces');
    const uri = vscode.Uri.file(folderPath);

    // delete index.ts inside folderPath if exists
    const indexFilePath = path.join(folderPath, 'index.ts');
    if (fs.existsSync(indexFilePath)) {
      fs.unlinkSync(indexFilePath);
    }

    const imageFolder = fs.readdirSync(folderPath);

    assert.equal(imageFolder.length, 3);

    vscode.commands.executeCommand('image-import-generator.generateImportOnce', uri);
    await sleep();
    assert.ok(showErrorMessageSpy.notCalled);
    assert.ok(fs.existsSync(indexFilePath));

    const indexContent = fs.readFileSync(indexFilePath, 'utf-8');
    const expectedContent = await getValidationFile('with-images-spaces');
    assert.equal(indexContent, expectedContent);
  });
});

// sleep function
function sleep(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getValidationFile(fileName: string) {
  const filePath = path.join(workspaceFolder, 'validation', fileName + '.index.ts');
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  return fileContent;
}
