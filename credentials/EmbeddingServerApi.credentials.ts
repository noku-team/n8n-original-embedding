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
			displayName: 'Authentication Method',
			name: 'authMethod',
			type: 'options',
			options: [
				{
					name: 'API Key Only',
					value: 'apiKey',
				},
				{
					name: 'Basic Auth Only',
					value: 'basicAuth',
				},
				{
					name: 'API Key + Basic Auth',
					value: 'both',
				},
			],
			default: 'both',
			description: 'Choose the authentication method for your embedding server',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The API key for the embedding server',
			displayOptions: {
				show: {
					authMethod: ['apiKey', 'both'],
				},
			},
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'Username for basic authentication',
			displayOptions: {
				show: {
					authMethod: ['basicAuth', 'both'],
				},
			},
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for basic authentication',
			displayOptions: {
				show: {
					authMethod: ['basicAuth', 'both'],
				},
			},
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '={{ $credentials.authMethod === "apiKey" || $credentials.authMethod === "both" ? $credentials.apiKey : undefined }}',
				'Content-Type': 'application/json',
			},
			auth: {
				username: '={{ $credentials.authMethod === "basicAuth" || $credentials.authMethod === "both" ? $credentials.username : undefined }}',
				password: '={{ $credentials.authMethod === "basicAuth" || $credentials.authMethod === "both" ? $credentials.password : undefined }}',
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
