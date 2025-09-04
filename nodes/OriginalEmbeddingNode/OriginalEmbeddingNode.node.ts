import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
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
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Embeddings'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.npmjs.com/package/@original-land/n8n-nodes-embedding',
					},
				],
			},
		},
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
				displayName: 'Batch Processing',
				name: 'batchProcessing',
				type: 'boolean',
				default: false,
				description:
					'Whether to process multiple texts in a single API call for better performance',
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
				const item = items[itemIndex];

				if (!endpoint) {
					throw new NodeOperationError(this.getNode(), 'Endpoint URL is required', {
						itemIndex,
					});
				}

				// Helper function to process embedding
				const processEmbedding = async (text: string, isQuery = false): Promise<number[]> => {
					const model = isQuery ? 'query' : 'doc';
					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: endpoint,
						body: {
							input: text,
							model: model,
						},
						json: true,
					};

					// Debug: Log request details
					console.log('🔧 Making embedding request:', {
						endpoint,
						model,
						text,
						textLength: text.length,
						requestMethod: 'POST',
					});

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'embeddingServerApi',
						requestOptions,
					);

					if (response && response.data && Array.isArray(response.data)) {
						const embeddingData = response.data[0];
						return embeddingData.embedding;
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid response format from embedding server',
							{ itemIndex },
						);
					}
				};

				// Determine input type following n8n embedding standards
				if (typeof item.json === 'string') {
					// Single text string (query)
					const embedding = await processEmbedding(item.json, true);
					returnData.push({
						json: {
							embedding,
							text: item.json,
						},
						pairedItem: itemIndex,
					});
				} else if (Array.isArray(item.json)) {
					// Array of strings (batch processing)
					for (const text of item.json) {
						if (typeof text === 'string') {
							const embedding = await processEmbedding(text, false);
							returnData.push({
								json: {
									embedding,
									text,
								},
								pairedItem: itemIndex,
							});
						}
					}
				} else if (
					item.json &&
					typeof item.json === 'object' &&
					item.json.pageContent !== undefined
				) {
					// Document with pageContent and metadata
					const text = item.json.pageContent as string;
					const metadata = item.json.metadata || {};
					const embedding = await processEmbedding(text, false);

					returnData.push({
						json: {
							embedding,
							text,
							metadata,
						},
						pairedItem: itemIndex,
					});
				} else {
					throw new NodeOperationError(
						this.getNode(),
						'Invalid input format. Expected: string, string[], or {pageContent: string, metadata?: object}',
						{ itemIndex },
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex,
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

	// Supply data method for AI context usage
	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		// Get parameters
		const endpoint = this.getNodeParameter('endpoint', itemIndex, '') as string;

		if (!endpoint) {
			throw new NodeOperationError(this.getNode(), 'Endpoint URL is required');
		}

		// Create embeddings object with embedQuery method
		const embeddings = {
			embedQuery: async (text: string) => {
				// Prepare HTTP request with query model
				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: endpoint,
					body: {
						input: text,
						model: 'query', // Fixed model for queries
					},
					json: true,
				};

				// Debug: Log supplyData query request
				console.log('🤖 SupplyData embedQuery request:', {
					endpoint,
					text,
					model: 'query',
					textLength: text.length,
				});

				// Make the HTTP request with credentials
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'embeddingServerApi',
					requestOptions,
				);

				// Process the response
				if (response && response.data && Array.isArray(response.data)) {
					const embeddingData = response.data[0];
					return embeddingData.embedding;
				} else {
					throw new NodeOperationError(
						this.getNode(),
						'Invalid response format from embedding server',
					);
				}
			},

			embedDocuments: async (documents: string[]) => {
				const embeddingResults: number[][] = [];

				for (const document of documents) {
					// Prepare HTTP request with doc model
					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: endpoint,
						body: {
							input: document,
							model: 'doc', // Fixed model for documents
						},
						json: true,
					};

					// Make the HTTP request with credentials
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'embeddingServerApi',
						requestOptions,
					);

					// Process the response
					if (response && response.data && Array.isArray(response.data)) {
						const embeddingData = response.data[0];
						embeddingResults.push(embeddingData.embedding);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid response format from embedding server',
						);
					}
				}

				return embeddingResults;
			},
		};

		return {
			response: embeddings,
		};
	}
}
