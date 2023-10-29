import type { ExtensionContext } from "vscode";
import { commands, workspace, window, StatusBarAlignment } from "vscode";
const cp = require("child_process");
const os = require("os");
const path = require('path');

const execFork = (command: string) => {
  cp.exec(
      command,
      (err: any, stdout: any, stderr: any) => {
        if (err) {
          window.showErrorMessage("Fork error: " + err);
        }
      }
    );
  // window.showInformationMessage(command);
};

export function activate(context: ExtensionContext) {
  const myButton = window.createStatusBarItem(StatusBarAlignment.Left, 0);
  myButton.text = "Open in Fork";
  myButton.command = "open-in-fork-button.open";
  myButton.show();

  let disposable = commands.registerCommand("open-in-fork-button.open", () => {
    let rootPath: string = "";
    if (workspace.workspaceFolders !== undefined) {
      rootPath = workspace.workspaceFolders[0].uri.fsPath;
    } else {
      window.showErrorMessage(
        "Fork error: Working folder not found, open a folder an try again"
      );
      return;
    }
    let command: string;
    if (os.platform() === 'linux' && os.release().toLowerCase().includes('microsoft')) { 
      // WSL
      cp.exec('cmd.exe /c echo %USERNAME%', (err: any, stdout: any, stderr: any) => {
        if (err) {
          window.showErrorMessage(
            "WSL Error: " + err
          );
          return;
        }
        const user = stdout.trim();
        const forkPath = `C:/Users/${user}/AppData/Local/Fork/Fork.exe`;
        cp.exec('lsb_release -a', (err: any, stdout: string, stderr: any) => {
          if (err) {
            window.showErrorMessage(
              "WSL Error: " + err
            );
            return;
          }
          const distroLine = stdout.split('\n').find(line => line.startsWith('Distributor ID:'));
          if (distroLine) {
            const distroName = distroLine?.split(':')?.pop()?.trim();
            const winRootPath = `\\\\\\\\wsl.localhost\\\\${distroName}${rootPath.replace(/\//g, '\\\\')}`;
            command = `cmd.exe /c start ` + forkPath + ` ` + winRootPath;
            execFork(command);
          }
        });
      });
    } else if (os.platform() === 'darwin') {
      // MacOS
      command = "open -a fork "+ rootPath;
      execFork(command);
    } else {
      // Windows
      const userHome = process.env.USERPROFILE || process.env.HOME;
      const forkPath = path.join(userHome, 'AppData', 'Local', 'Fork', 'Fork');
      command = `start ${forkPath} ${rootPath}`;
      execFork(command);
    }
    
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
