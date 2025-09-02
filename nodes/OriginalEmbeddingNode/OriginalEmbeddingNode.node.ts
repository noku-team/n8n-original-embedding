import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class OriginalEmbeddingNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Original Embedding Node',
		name: 'originalEmbeddingNode',
		group: ['ai'],
		icon: {
			dark: 'file:original.svg',
			light: 'file:original.svg',
		},
		version: 1,
		description: 'Generate embeddings using a custom embedding server',
		defaults: {
			name: 'Original Embedding Node',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.AiEmbedding],
		credentials: [
			{
				name: 'embeddingServerApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Endpoint URL',
				name: 'endpoint',
				type: 'string',
				default: '',
				placeholder: 'https://your-server.com/api/v1/openai-compatible/embeddings',
				description: 'The endpoint URL of your embedding server',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'query',
				description: 'The model to use for embeddings',
				required: true,
			},
			{
				displayName: 'Input Text',
				name: 'inputText',
				type: 'string',
				default: '={{ $json.text }}',
				placeholder: 'Enter text to embed or use an expression',
				description: 'The text to generate embeddings for',
				required: true,
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Batch Processing',
				name: 'batchProcessing',
				type: 'boolean',
				default: false,
				description: 'Whether to process multiple texts in a single API call for better performance',
			},
		],
	};

	// Generate embeddings by calling the embedding server
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get parameters
				const endpoint = this.getNodeParameter('endpoint', itemIndex, '') as string;
				const model = this.getNodeParameter('model', itemIndex, 'query') as string;
				const inputText = this.getNodeParameter('inputText', itemIndex, '') as string;

				if (!endpoint) {
					throw new NodeOperationError(this.getNode(), 'Endpoint URL is required', {
						itemIndex,
					});
				}

				if (!inputText) {
					throw new NodeOperationError(this.getNode(), 'Input text is required', {
						itemIndex,
					});
				}

				// Prepare HTTP request
				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: endpoint,
					body: {
						input: inputText,
						model: model,
					},
					json: true,
				};

				// Make the HTTP request with credentials
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'embeddingServerApi',
					requestOptions,
				);

				console.log(response);

				// Process the response
				if (response && response.data && Array.isArray(response.data)) {
					// For AI embeddings, we should return the original item with the embedding data
					const item = items[itemIndex];
					const embeddingData = response.data[0]; // Take the first embedding

					returnData.push({
						json: {
							...item.json, // Preserve original data
							embedding: embeddingData.embedding,
							text: inputText, // Store the text that was embedded
							model: response.model,
							usage: response.usage,
						},
						pairedItem: itemIndex,
					});
				} else {
					throw new NodeOperationError(this.getNode(), 'Invalid response format from embedding server', {
						itemIndex,
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
