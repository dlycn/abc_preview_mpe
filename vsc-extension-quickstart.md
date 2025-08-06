# 欢迎使用您的 VS Code 扩展

## 文件夹中的内容

* 此文件夹包含扩展所需的所有文件。
* 'package.json' - 这是您在其中声明扩展名和命令的清单文件。
* 示例插件注册一个命令并定义其标题和命令名称。有了这些信息，VS Code 可以在命令面板中显示命令。它还不需要加载插件。
* 'extension.js' - 这是您将在其中提供命令实现的主文件。
* 该文件导出一个函数“activate”，在第一次激活扩展时调用该函数（在本例中为执行命令）。在“activate”函数中，我们调用“registerCommand”。
* 我们将包含命令实现的函数作为第二个参数传递给 'registerCommand'。

## 立即启动并运行
* 按“F5”打开一个加载了扩展程序的新窗口。
* 按（Mac 上的“Ctrl Shift P”或“Cmd Shift P”）并键入“Hello World”，从命令面板运行命令。
* 在“extension.js”内的代码中设置断点以调试您的扩展。* 在调试控制台中查找扩展的输出。
## 进行更改 
* 更改 'extension.js' 中的代码后，您可以从调试工具栏重新启动扩展。
* 您还可以使用扩展程序重新加载（在 Mac 上为“Ctrl R”或“Cmd R”）VS Code 窗口以加载更改。
## 探索 API 
* 当您打开文件“node_modules/@types/vscode/index.d.ts”时，您可以打开我们的完整 API 集。
## 运行测试 
* 安装 [扩展测试运行程序]（https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner） 
* 从活动栏打开“测试”视图，然后单击“运行测试”按钮，或使用热键“Ctrl/Cmd ;A' 
* 在 Test Results 视图中查看测试结果的输出。
* 更改 'test/extension.test.js' 或在 'test' 文件夹中创建新的测试文件。
* 提供的测试运行程序将仅考虑与名称模式“**.test.js”匹配的文件。
* 您可以在 'test' 文件夹中创建文件夹，以您想要的任何方式构建您的测试。
## 更进一步 * [遵循 UX 指南]（https://code.visualstudio.com/api/ux-guidelines/overview） 创建与 VS Code 的原生界面和模式无缝集成的扩展。
* [发布扩展]（https://code.visualstudio.com/api/working-with-extensions/publishing-extension） 在 VS Code 扩展市场上。
* 通过设置 [持续集成]（https://code.visualstudio.com/api/working-with-extensions/continuous-integration） 来自动化构建。
* 集成到 [报告问题]（https://code.visualstudio.com/api/get-started/wrapping-up#issue-reporting） 流程中，以获取用户报告的问题和功能请求。
