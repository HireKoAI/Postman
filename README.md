# 🚀 MCP Postman: User Guide

This guide will walk you through setting up the environment, starting the development server, and using the UI to manage your API namespaces.

## 🛠️ Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v18+ recommended).
2.  **AWS CLI**: You must have the AWS CLI installed and configured.
3.  **AWS Profile**: The app is pre-configured to use an AWS profile named `hireko`. Ensure this profile exists in your `~/.aws/credentials` file.

## ⚙️ Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory (based on `.env.example` if available). At a minimum, you need:
    ```env
    VITE_DYNAMODB_TABLE_NAME=your-table-name
    ```
    *Note: AWS credentials (Access Key, Secret Key, Session Token) are automatically fetched from your local `hireko` profile during startup.*

## 🏃 Starting the Server

Run the following command to start the Vite development server:

```bash
npm run dev
```

The app will fetch your active AWS credentials and inject them securely into the browser environment. Look for the message:
`🔌 Fetching AWS credentials for profile: hireko...`

## 🎨 Using the UI

### 1. Importing APIs
Click the **Import** button in the header or dashboard. You can import from:
*   **OpenAPI/Swagger**: Upload a JSON or YAML spec.
*   **Postman**: Upload a Collection v2.1 JSON.
*   **MCP Server**: Provide your MCP server configuration.

### 2. Managing Namespaces
*   **Navigation**: Use the sidebar to browse through imported namespaces and their endpoints.
*   **Deletion**: Hover over a namespace in the sidebar and click the Trash icon to "Delete Namespace".
*   **Editor**: Selecting an endpoint opens the **Request Editor**.

### 3. Request Editor
*   **Params/Body**: The editor intelligently defaults to the most relevant tab (Params for GET, Body for mutations).
*   **JSON Preview**: Bodies are rendered in a "Pretty" JSON format for easy reading.
*   **Response**: The right-hand panel displays the expected response schema and status codes.

### 4. DynamoDB Sync
*   **Save to DynamoDB**: Once you've imported or modified a namespace, use the "Save to DynamoDB" button (if available/configured) to persist it to your AWS table.
*   **Add from DynamoDB**: Import entire namespaces directly from your remote table.

---

**Happy Testing!** 🚀🛡️✨🏗️📊📂📁🎨
