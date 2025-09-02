## [0.1.8](https://github.com/noku-team/n8n-original-embedding/compare/v0.1.7...v0.1.8) (2025-09-02)



# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2024-01-15

### Added
- **Original Embedding Node**: Custom embedding node for n8n
- **Flexible Authentication**: Support for API Key, Basic Auth, or both combined
- **RAG Compatibility**: Full integration with n8n's AI ecosystem
- **Batch Processing**: Optional batch processing for improved performance
- **OpenAI Compatible**: Works with any OpenAI-compatible embedding server

### Features
- ✅ Multiple authentication methods (API Key, Basic Auth, Combined)
- ✅ Integration with Vector Stores (Pinecone, Weaviate, etc.)
- ✅ Compatible with AI Retrievers and RAG Chains
- ✅ Configurable endpoint and model selection
- ✅ Expression support for dynamic text input
- ✅ Secure credential storage
- ✅ Error handling with continueOnFail support
- ✅ TypeScript support and proper type definitions

### Technical Details
- **Input Type**: `NodeConnectionType.Main`
- **Output Type**: `NodeConnectionType.AiEmbedding` 
- **Node Group**: `ai`
- **Minimum n8n Version**: 1.0.0+
- **Node.js Version**: >=20.15

### Documentation
- Comprehensive README with setup instructions
- Usage examples and RAG workflow integration
- API compatibility guide
- Development setup instructions

## [0.1.0] - Initial Release

### Added
- Initial project setup
- Basic node structure
- Credential system foundation