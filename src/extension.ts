import type { ExtensionContext } from "vscode";
import { commands, workspace, window, StatusBarAlignment } from "vscode";
const cp = require("child_process");

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
    cp.exec(
      "open -a fork " + rootPath,
      (err: any, stdout: any, stderr: any) => {
        if (err) {
          window.showErrorMessage("Fork error: " + err);
        }
      }
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
