import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class CompNodeProvider implements vscode.TreeDataProvider<Component> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Component | undefined
  > = new vscode.EventEmitter<Component | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Component | undefined> = this
    ._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Component): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Component): Thenable<Component[]> {
    return new Promise(resolve => {
      const compPath = path.join(
        __filename,
        "..",
        "..",
        "public",
        "components.json"
      );
      if (this.pathExists(compPath)) {
        resolve(this.getComponentsList(compPath));
      } else {
        vscode.window.showInformationMessage("组件加载失败");
        resolve([]);
      }
    });
  }

  /**
   * 获取组件列表
   */
  private getComponentsList(compPath: string): Component[] {
    if (this.pathExists(compPath)) {
      const packageJson = JSON.parse(fs.readFileSync(compPath, "utf-8"));

      const toComp = (item: any): Component => {
        return new Component(
          `${item.name} - ${item.latest}`,
          item.description,
          vscode.TreeItemCollapsibleState.None,
          {
            command: "extension.importComponent",
            title: "",
            arguments: [item]
          }
        );
      };

      const comps = packageJson.content
        ? packageJson.content.map((comp: any) => toComp(comp))
        : [];
      return comps;
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      console.error(err);
      return false;
    }

    return true;
  }
}

class Component extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.description}`;
  }

  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "images",
      "light",
      "dependency.svg"
    ),
    dark: path.join(__filename, "..", "..", "images", "dark", "dependency.svg")
  };

  contextValue = "component";
}
