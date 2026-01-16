# 🚀 Extreme Networks MCP Postman: User Guide

Welcome to the Extreme Networks MCP Postman application. This tool allows you to manage, test, and deploy API collections and MCP (Model Context Protocol) tools with seamless DynamoDB integration.

---

## 🛠️ Prerequisites

1.  **Node.js**: Version 18.x or higher.
2.  **AWS CLI**: Installed and configured on your machine.
3.  **AWS Profile**: The application expects an AWS profile named `hireko`. Ensure this is set up in `~/.aws/credentials`.

---

## ⚙️ Configuration & Environment

The application uses Vite and requires specific environment variables to interact with AWS services.

### 1. AWS Credentials
Credentials (Access Key, Secret Key, and Session Token) are **automatically handled**. When you run the development server, a script fetches temporary credentials from your `hireko` profile and injects them into the app.

### 2. Environment Variables
Create a `.env.local` file in the root directory and configure the following:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_AWS_REGION` | The AWS region where your DynamoDB table resides. | `ca-central-1` |
| `VITE_DYNAMODB_TABLE_NAME` | The name of the DynamoDB table for storage. | `PostmanCollections` |

---

## 🏃 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start development server**:
    ```bash
    npm run dev
    ```
    You should see: `🔌 Fetching AWS credentials for profile: hireko...` followed by the Vite start message.

---

## 🎨 UI & Features Guide

### 1. Namespace Hub (Home)
The landing page displays your **Top Namespaces** (categories). 
- **Add Top Namespace**: Create new categories to organize your collections.
- **DYNAMO SYNC**: Upon loading, the app automatically scans DynamoDB and restores all previously saved collections to their respective namespaces.

### 2. Importing Collections
Use the **Import** button on the dashboard to add APIs:
- **OpenAPI/Swagger**: Drag and drop JSON/YAML files.
- **Postman**: Import v2.1 collection files.
- **MCP Server**: Import tool definitions from an MCP server configuration.
- **AUTO-SAVE**: Any successful import is **automatically persisted** to DynamoDB.

### 3. Deploy to MCP 🚀
Located in the center of the top navigation bar is the **Deploy to MCP** button.
- **Action**: Click to package and "deploy" your current collections/tools to the MCP environment.
- **Visual Feedback**: The button reflects real-time status:
    - `Deploy to MCP` (Ready)
    - `Deploying...` (Processing - takes ~3 seconds)
    - `Live on MCP` (Success - stays for 10 seconds before resetting)

### 4. Side-by-Side Request Editor
- **Sidebar**: Navigate through folders and endpoints.
- **Request Tabs**: Edit parameters, headers, and request bodies. The app supports complex JSON bodies for mutations.
- **Real-time Sync**: Deleting a collection in the UI also removes it from your local view (though it remains in DynamoDB unless explicitly deleted via the CLI/Console).

---

## 🛡️ Persistence Logic

- **Local Storage**: Stores your UI preferences (active tabs, active namespace selections).
- **DynamoDB**: Serves as the source of truth for all collection data.
    - **Fetch**: Happens automatically on app start.
    - **Save**: Happens automatically on every successful file import.
    - **Manual Save**: You can manually trigger a save for any collection using the Database icon on the collection card.

---

**Built for Visual Excellence and Extreme Speed.** 🌐🛡️🏗️
