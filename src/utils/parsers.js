export function parseNamespace(json) {
    if (json.info && json.info._postman_id) {
        return parsePostman(json);
    }
    if (json.openapi || json.swagger) {
        return parseOpenAPI(json);
    }
    throw new Error("Unknown format. Please provide a valid Postman (v2.1) or OpenAPI (2.0/3.0) JSON.");
}

export function parseMcpServer(json) {
    const servers = json.mcpServers || { [json.name || 'imported-server']: json };

    // Simply convert to a common format
    const endpoints = [];
    Object.entries(servers).forEach(([name, config]) => {
        if (config.tools) {
            config.tools.forEach(tool => {
                // Map properties to a standard parameter array format
                const parameters = Object.entries(tool.inputSchema?.properties || {}).map(([propName, prop]) => ({
                    name: propName,
                    type: prop.type || 'string',
                    description: prop.description || '',
                    in: 'body',
                    required: tool.inputSchema?.required?.includes(propName) || false
                }));

                endpoints.push({
                    id: tool.name || Math.random().toString(),
                    name: tool.name,
                    path: name,
                    method: 'MCP',
                    description: tool.description,
                    parameters: parameters,
                    requestSchema: tool.inputSchema,
                    responses: [{ status: '200', name: 'Success', content: {} }]
                });
            });
        }
    });

    return {
        name: json.name || "MCP Server",
        type: 'mcp',
        endpoints
    };
}

function parsePostman(json) {
    const endpoints = [];

    const traverse = (items) => {
        items.forEach(item => {
            if (item.request) {
                const req = item.request;
                let body = {};
                if (req.body?.mode === 'raw') {
                    try {
                        body = JSON.parse(req.body.raw);
                    } catch (e) {
                        body = req.body.raw;
                    }
                }

                // Map Postman query/headers to a standard parameter array format
                const parameters = [
                    ...(req.url?.query || []).map(q => ({
                        name: q.key,
                        value: q.value,
                        description: q.description,
                        in: 'query'
                    })),
                    ...(req.header || []).map(h => ({
                        name: h.key,
                        value: h.value,
                        description: h.description,
                        in: 'header'
                    }))
                ];

                endpoints.push({
                    id: item.id || Math.random().toString(),
                    name: item.name,
                    path: req.url?.raw || req.url || '',
                    method: req.method,
                    description: req.description,
                    parameters: parameters,
                    body: body,
                    responses: item.response?.map(res => ({
                        status: res.code?.toString() || '200',
                        name: res.name,
                        content: res.body ? JSON.parse(res.body) : {},
                        language: res._postman_previewlanguage
                    })) || []
                });
            }
            if (item.item) traverse(item.item);
        });
    };

    traverse(json.item);
    return {
        name: json.info.name,
        type: 'postman',
        endpoints
    };
}

function parseOpenAPI(json) {
    const endpoints = [];
    const paths = json.paths || {};

    Object.entries(paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, detail]) => {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
                const responses = detail.responses || {};
                const sampleResponses = Object.entries(responses).map(([code, res]) => {
                    const responseObj = {
                        name: res.description || code,
                        status: code,
                        content: {},
                        schema: null,
                        language: 'json'
                    };

                    if (res.content?.['application/json']?.schema) {
                        responseObj.schema = res.content['application/json'].schema;
                        responseObj.content = schemaToJSON(responseObj.schema);
                    }

                    return responseObj;
                });

                let body = {};
                let requestSchema = null;
                if (detail.requestBody?.content?.['application/json']?.schema) {
                    requestSchema = detail.requestBody.content['application/json'].schema;
                    body = schemaToJSON(requestSchema);
                }

                // OpenAPI parameters are already usually an array, keep the structure
                const parameters = (detail.parameters || []).map(p => ({
                    ...p,
                    in: p.in || 'query',
                    type: p.schema?.type || 'string'
                }));

                endpoints.push({
                    id: detail.operationId || `${method}-${path}`,
                    name: detail.summary || detail.operationId || path,
                    path: path,
                    method: method.toUpperCase(),
                    description: detail.description,
                    parameters: parameters,
                    body: body,
                    requestSchema: requestSchema,
                    responses: sampleResponses
                });
            }
        });
    });

    return {
        name: json.info?.title || "OpenAPI Spec",
        type: 'openapi',
        endpoints
    };
}

function schemaToJSON(schema) {
    if (!schema) return null;
    if (schema.example) return schema.example;
    if (schema.default) return schema.default;

    if (schema.type === 'object') {
        const obj = {};
        Object.entries(schema.properties || {}).forEach(([key, val]) => {
            obj[key] = schemaToJSON(val);
        });
        return obj;
    }

    if (schema.type === 'array') {
        return [schemaToJSON(schema.items)];
    }

    switch (schema.type) {
        case 'string': return "string";
        case 'number':
        case 'integer': return 0;
        case 'boolean': return true;
        default: return null;
    }
}
