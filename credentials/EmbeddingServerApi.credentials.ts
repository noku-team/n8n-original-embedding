import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class EmbeddingServerApi implements ICredentialType {
	name = 'embeddingServerApi';
	displayName = 'Embedding Server API';
	documentationUrl = 'https://docs.n8n.io/credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The API key for the embedding server',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: 'Bearer ={{ $credentials.apiKey }}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			url: 'https://httpbin.org/status/200',
			method: 'GET',
		},
	};
}
