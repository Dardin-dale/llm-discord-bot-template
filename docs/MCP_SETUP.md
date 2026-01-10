# MCP Server Setup

Model Context Protocol (MCP) servers enhance Claude Code's ability to help you with AWS and CDK tasks.

## Recommended MCP Servers

### AWS Infrastructure as Code MCP Server

Helps Claude Code generate correct CDK code with security validation.

```bash
# Install
npm install -g @aws/infrastructure-as-code-mcp-server

# Or via npx (no install)
npx @aws/infrastructure-as-code-mcp-server
```

### AWS Serverless MCP Server

Provides Lambda and serverless best practices.

```bash
npm install -g @aws/serverless-mcp-server
```

### AWS Documentation MCP Server

Real-time access to AWS documentation.

```bash
npm install -g @aws/documentation-mcp-server
```

## Configuration

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "aws-iac": {
      "command": "npx",
      "args": ["@aws/infrastructure-as-code-mcp-server"]
    },
    "aws-serverless": {
      "command": "npx",
      "args": ["@aws/serverless-mcp-server"]
    },
    "aws-docs": {
      "command": "npx",
      "args": ["@aws/documentation-mcp-server"]
    }
  }
}
```

## What This Enables

With MCP servers enabled, Claude Code can:

- **Generate CDK code** with automatic security validation
- **Check AWS best practices** in real-time
- **Access current AWS documentation**
- **Validate your infrastructure** before deployment

## Example Usage

Ask Claude Code:

- "Add an S3 bucket for storing user uploads"
- "Create a DynamoDB table for user preferences"
- "Add a scheduled Lambda that runs daily"
- "What's the best way to handle secrets in Lambda?"

Claude Code will use the MCP servers to provide accurate, up-to-date guidance.

## More Information

- [AWS MCP Servers](https://awslabs.github.io/mcp/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
