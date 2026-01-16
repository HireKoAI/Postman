import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// In Vite, we use import.meta.env instead of process.env for browser compatibility
// These values are injected by vite.config.js from your local AWS profile
const REGION = import.meta.env.VITE_AWS_REGION || "ca-central-1";

const client = new DynamoDBClient({
    region: REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN
    }
});

const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
});

export async function saveToDynamoDB(namespace) {
    const tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME;
    if (!tableName) throw new Error("VITE_DYNAMODB_TABLE_NAME is missing");

    const endpoints = namespace.endpoints || [];

    const writes = endpoints.map(endpoint => {
        const item = {
            name: namespace.name,
            api_id: endpoint.name,
            type: namespace.type,
            method: endpoint.method,
            path: endpoint.path,
            requestSchema: endpoint.requestSchema
                ? JSON.stringify(endpoint.requestSchema)
                : null,
            responses: endpoint.responses
                ? JSON.stringify(endpoint.responses)
                : null,
            body: endpoint.body
                ? JSON.stringify(endpoint.body)
                : null,
            parameters: endpoint.parameters
                ? JSON.stringify(endpoint.parameters)
                : null,
            namespaceId: namespace.id,
            topNamespaceId: namespace.topNamespaceId, // NEW
            timestamp: new Date().toISOString(),
        };

        return docClient.send(
            new PutCommand({
                TableName: tableName,
                Item: item,
            })
        );
    });

    return Promise.all(writes);
}

export async function fetchFromDynamoDB(namespaceName) {
    const tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME;
    if (!tableName) throw new Error("VITE_DYNAMODB_TABLE_NAME is missing");

    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "#n = :name",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: { ":name": namespaceName },
    });

    const response = await docClient.send(command);
    if (!response.Items?.length) {
        throw new Error(`No endpoints found for namespace: ${namespaceName}`);
    }

    const first = response.Items[0];
    return {
        name: first.name,
        type: first.type || "openapi",
        endpoints: response.Items.map(item => {
            let params = [];
            try {
                const parsed = item.parameters ? JSON.parse(item.parameters) : [];
                // Migration: Handle legacy object format { key: value }
                if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
                    params = Object.entries(parsed).map(([name, value]) => ({
                        name,
                        value: value?.toString() || '',
                        in: 'query'
                    }));
                } else {
                    params = Array.isArray(parsed) ? parsed : [];
                }
            } catch (e) {
                console.warn("Failed to parse parameters for", item.api_id, e);
            }

            return {
                id: `${item.api_id}-${Math.random()}`,
                name: item.api_id,
                method: item.method,
                path: item.path,
                requestSchema: item.requestSchema ? JSON.parse(item.requestSchema) : null,
                responses: item.responses ? JSON.parse(item.responses) : [],
                body: item.body ? JSON.parse(item.body) : null,
                parameters: params,
            };
        }),
    };
}

export async function fetchAllFromDynamoDB() {
    const tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME;
    if (!tableName) throw new Error("VITE_DYNAMODB_TABLE_NAME is missing");

    const command = new ScanCommand({ TableName: tableName });
    const response = await docClient.send(command);
    if (!response.Items?.length) return [];

    // Group items by namespace name + namespaceId to be safe
    const grouped = response.Items.reduce((acc, item) => {
        const key = `${item.name}-${item.namespaceId}`;
        if (!acc[key]) {
            acc[key] = {
                id: item.namespaceId,
                name: item.name,
                type: item.type || "openapi",
                topNamespaceId: item.topNamespaceId || 'default',
                endpoints: []
            };
        }

        let params = [];
        try {
            const parsed = item.parameters ? JSON.parse(item.parameters) : [];
            if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
                params = Object.entries(parsed).map(([name, value]) => ({
                    name,
                    value: value?.toString() || '',
                    in: 'query'
                }));
            } else {
                params = Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            console.warn("Failed to parse parameters for", item.api_id, e);
        }

        acc[key].endpoints.push({
            id: `${item.api_id}-${Math.random()}`,
            name: item.api_id,
            method: item.method,
            path: item.path,
            requestSchema: item.requestSchema ? JSON.parse(item.requestSchema) : null,
            responses: item.responses ? JSON.parse(item.responses) : [],
            body: item.body ? JSON.parse(item.body) : null,
            parameters: params,
        });
        return acc;
    }, {});

    return Object.values(grouped);
}

