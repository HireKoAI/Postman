import { parseCollection } from './src/utils/parsers.js';

const sample = {
    "info": {
        "_postman_id": "50eb4f1c-4d7c-4ddf-a908-b24792bf1447",
        "name": "Universal-RAG Resume Upload",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        "_exporter_id": "19087620"
    },
    "item": [
        {
            "name": "UploadRandomTenantResumeDocumentAndAnalyz",
            "request": {
                "method": "PUT",
                "header": [],
                "body": {
                    "mode": "formdata",
                    "formdata": [
                        {
                            "key": "digvijaygore",
                            "type": "file",
                            "src": "/C:/Users/Lenovo/Downloads/digvijay.pdf"
                        }
                    ]
                },
                "url": {
                    "raw": "https://c3tal5hys2.execute-api.us-west-2.amazonaws.com/beta/UniversalCandidateRAG/stage/beta/tenant/test/UploadRandomTenantResumeDocumentAndAnalyz/funnelId/AllFunnels/jobID/job_fb85ecc8-7052-4e13-8c92-4881b4e75f47/file/digvijaygore.pdf",
                    "protocol": "https",
                    "host": [
                        "c3tal5hys2",
                        "execute-api",
                        "us-west-2",
                        "amazonaws",
                        "com"
                    ],
                    "path": [
                        "beta",
                        "UniversalCandidateRAG",
                        "stage",
                        "beta",
                        "tenant",
                        "test",
                        "UploadRandomTenantResumeDocumentAndAnalyz",
                        "funnelId",
                        "AllFunnels",
                        "jobID",
                        "job_fb85ecc8-7052-4e13-8c92-4881b4e75f47",
                        "file",
                        "digvijaygore.pdf"
                    ]
                }
            },
            "response": []
        },
        {
            "name": "UploadRandomTenantResumeDocumentAndAnalyzWithoutDetailExtraction",
            "request": {
                "method": "PUT",
                "header": [],
                "body": {
                    "mode": "formdata",
                    "formdata": [
                        {
                            "key": "ashish",
                            "type": "file",
                            "src": "/D:/MetricDust/Hireko/ResumeSorter/ResumeSorter/not_working/Ashish_Resume.pdf"
                        }
                    ]
                },
                "url": {
                    "raw": "https://c3tal5hys2.execute-api.us-west-2.amazonaws.com/beta/UniversalCandidateRAG/stage/beta/tenant/test/UploadRandomTenantResumeDocumentAndAnalyzWithoutDetailExtraction/funnelId/AllFunnels/jobID/job_fb85ecc8-7052-4e13-8c92-4881b4e75f47/name/Ashish/userAlias/ashishpalankar222@gmail.com/userAliasType/email/file/Ashish_Resumne.pdf",
                    "protocol": "https",
                    "host": [
                        "c3tal5hys2",
                        "execute-api",
                        "us-west-2",
                        "amazonaws",
                        "com"
                    ],
                    "path": [
                        "beta",
                        "UniversalCandidateRAG",
                        "stage",
                        "beta",
                        "tenant",
                        "test",
                        "UploadRandomTenantResumeDocumentAndAnalyzWithoutDetailExtraction",
                        "funnelId",
                        "AllFunnels",
                        "jobID",
                        "job_fb85ecc8-7052-4e13-8c92-4881b4e75f47",
                        "name",
                        "Ashish",
                        "userAlias",
                        "ashishpalankar222@gmail.com",
                        "userAliasType",
                        "email",
                        "file",
                        "Ashish_Resumne.pdf"
                    ]
                }
            },
            "response": []
        }
    ]
};

try {
    const result = parseCollection(sample);
    console.log("Success!");
    console.log("Title:", result.title);
    console.log("Endpoints Count:", result.endpoints.length);
    result.endpoints.forEach(ep => {
        console.log(`- [${ep.method}] ${ep.path} (${ep.summary})`);
    });
} catch (e) {
    console.error("Failed:", e.message);
    console.error(e);
}
