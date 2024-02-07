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
    showErrorMessageSpy.resetHistory();
    // create a directory called no-images
    if (!fs.existsSync(path.join(workspaceFolder, 'no-images'))) {
      fs.mkdirSync(path.join(workspaceFolder, 'no-images'));
    }

    const folderPath = path.join(workspaceFolder, 'no-images');
    const uri = vscode.Uri.file(folderPath);
    vscode.commands.executeCommand('image-import-generator.generateImportOnce', uri);
    await sleep();
    const indexFilePath = path.join(folderPath, 'index.ts');
    const content = fs.readFileSync(indexFilePath, 'utf-8');
    const validationContent = await getValidationFile('no-images');
    assert.equal(content, validationContent);
  });

  test('Generate images once - Scenario 3: folder with images', async () => {
    showErrorMessageSpy.resetHistory();
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
    showErrorMessageSpy.resetHistory();
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

  test('Track folder - Scenario 1: Track folder', async () => {
    showErrorMessageSpy.resetHistory();
    const folderPath = path.join(workspaceFolder, 'tracking');
    const uri = vscode.Uri.file(folderPath);

    const indexFilePath = path.join(folderPath, 'index.ts');

    // remove all files in folderPath
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      fs.unlinkSync(path.join(folderPath, file));
    }

    const imageFolderPath = path.join(workspaceFolder, 'images');

    assert.equal(fs.readdirSync(imageFolderPath).length, 3);

    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uri);
    await sleep();
    assert.ok(fs.existsSync(indexFilePath));
    assert.equal(fs.readFileSync(indexFilePath, 'utf-8'), await getValidationFile('no-images'));

    fs.copyFileSync(path.join(imageFolderPath, 'imageA.png'), path.join(folderPath, 'imageA.png'));

    await sleep();

    assert.equal(fs.readdirSync(folderPath).length, 2);

    const indexContent = fs.readFileSync(indexFilePath, 'utf-8');
    const expectedContent = await getValidationFile('tracking-imageA');
    assert.equal(indexContent, expectedContent);

    fs.unlinkSync(path.join(folderPath, 'imageA.png'));
    await sleep();

    assert.equal(fs.readdirSync(folderPath).length, 1);
    assert.equal(fs.readFileSync(indexFilePath, 'utf-8'), await getValidationFile('no-images'));

    fs.copyFileSync(path.join(imageFolderPath, 'imageB.png'), path.join(folderPath, 'imageB.png'));
    fs.copyFileSync(path.join(imageFolderPath, 'imageC.gif'), path.join(folderPath, 'imageC.gif'));
    await sleep();

    assert.equal(fs.readdirSync(folderPath).length, 3);
    assert.equal(fs.readFileSync(indexFilePath, 'utf-8'), await getValidationFile('tracking-imageBC'));

    fs.unlinkSync(path.join(folderPath, 'imageB.png'));
    await sleep();

    assert.equal(fs.readdirSync(folderPath).length, 2);
    assert.equal(fs.readFileSync(indexFilePath, 'utf-8'), await getValidationFile('tracking-imageC'));
  });

  test('Track folder - Scenario 2: Track same folder again to stop tracking', async () => {
    showErrorMessageSpy.resetHistory();
    const folderPath = path.join(workspaceFolder, 'tracking2');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    // remove all files in folderPath
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      fs.unlinkSync(path.join(folderPath, file));
    }
    const uri = vscode.Uri.file(folderPath);

    const indexFilePath = path.join(folderPath, 'index.ts');
    const imageFolderPath = path.join(workspaceFolder, 'images');


    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uri);
    await sleep();
    assert.ok(fs.existsSync(indexFilePath));
    assert.equal(fs.readFileSync(indexFilePath, 'utf-8'), await getValidationFile('no-images'));

    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uri);

    fs.copyFileSync(path.join(imageFolderPath, 'imageA.png'), path.join(folderPath, 'imageA.png'));

    await sleep();

    assert.equal(fs.readdirSync(folderPath).length, 2);
    assert.equal(fs.readFileSync(indexFilePath, 'utf-8'), await getValidationFile('no-images'));
  });

  test('Track folder - Scenario 3: Tracking multiple folders', async () => {
    showErrorMessageSpy.resetHistory();
    const folderPath = path.join(workspaceFolder, 'tracking-multiple');

    // remove all files in folderPath
    const files = fs.readdirSync(folderPath);
    // recursively delete all files in folderPath
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.readdirSync(filePath).forEach((subFile) => {
          fs.unlinkSync(path.join(filePath, subFile));
        });
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    const imageFolderPath = path.join(workspaceFolder, 'images');

    fs.mkdirSync(path.join(folderPath, 'folderA'));
    fs.mkdirSync(path.join(folderPath, 'folderB'));

    const folderAPath = path.join(folderPath, 'folderA');
    const folderBPath = path.join(folderPath, 'folderB');

    const uriA = vscode.Uri.file(folderAPath);
    const uriB = vscode.Uri.file(folderBPath);

    const indexAPath = path.join(folderAPath, 'index.ts');
    const indexBPath = path.join(folderBPath, 'index.ts');

    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uriA);
    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uriB);
    await sleep();
    assert.ok(fs.existsSync(indexAPath));
    assert.equal(fs.readFileSync(indexAPath, 'utf-8'), await getValidationFile('no-images'));
    assert.equal(fs.readdirSync(folderAPath).length, 1);
    assert.ok(fs.existsSync(indexBPath));
    assert.equal(fs.readFileSync(indexBPath, 'utf-8'), await getValidationFile('no-images'));
    assert.equal(fs.readdirSync(folderBPath).length, 1);

    fs.copyFileSync(path.join(imageFolderPath, 'imageA.png'), path.join(folderAPath, 'imageA.png'));
    fs.copyFileSync(path.join(imageFolderPath, 'imageB.png'), path.join(folderBPath, 'imageB.png'));

    await sleep();
    assert.equal(fs.readdirSync(folderAPath).length, 2);
    assert.equal(fs.readdirSync(folderBPath).length, 2);

    assert.equal(fs.readFileSync(indexAPath, 'utf-8'), await getValidationFile('tracking-imageA'));
    assert.equal(fs.readFileSync(indexBPath, 'utf-8'), await getValidationFile('tracking-imageB'));

    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uriA);
    fs.copyFileSync(path.join(imageFolderPath, 'imageC.gif'), path.join(folderAPath, 'imageC.gif'));
    fs.copyFileSync(path.join(imageFolderPath, 'imageC.gif'), path.join(folderBPath, 'imageC.gif'));
    await sleep();

    assert.equal(fs.readFileSync(indexAPath, 'utf-8'), await getValidationFile('tracking-imageA'));
    assert.equal(fs.readFileSync(indexBPath, 'utf-8'), await getValidationFile('tracking-imageBC'));

    vscode.commands.executeCommand('image-import-generator.generateImportAutoTrack', uriA);
    await sleep();

    assert.equal(fs.readFileSync(indexAPath, 'utf-8'), await getValidationFile('tracking-imageAC'));

    vscode.commands.executeCommand('image-import-generator.untrackAll');
    await sleep();

    fs.readdirSync(folderAPath).forEach((file) => {
      if (file !== 'index.ts') {
        fs.unlinkSync(path.join(folderAPath, file))
      }
    });
    fs.readdirSync(folderBPath).forEach((file) => {
      if (file !== 'index.ts') {
        fs.unlinkSync(path.join(folderBPath, file))
      }
    });

    assert.equal(fs.readdirSync(folderAPath).length, 1);
    assert.equal(fs.readdirSync(folderBPath).length, 1);

    assert.equal(fs.readFileSync(indexAPath, 'utf-8'), await getValidationFile('tracking-imageAC'));
    assert.equal(fs.readFileSync(indexBPath, 'utf-8'), await getValidationFile('tracking-imageBC'));
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
