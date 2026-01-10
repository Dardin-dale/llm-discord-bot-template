/**
 * Local Development Server
 *
 * Runs an Express server that mimics the Lambda environment.
 * Use with ngrok to test Discord interactions locally.
 *
 * Usage:
 *   1. npm run dev
 *   2. In another terminal: ngrok http 3000
 *   3. Copy the ngrok URL to Discord Developer Portal -> Interactions Endpoint URL
 */
import express from 'express';
import dotenv from 'dotenv';
import { handler } from '../src/index';
import { APIGatewayProxyEvent } from 'aws-lambda';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Parse raw body for signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Discord interactions endpoint
app.post('/interactions', async (req: any, res) => {
  console.log('\n--- Incoming Request ---');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Convert Express request to Lambda event format
  const event: APIGatewayProxyEvent = {
    body: req.rawBody,
    headers: req.headers,
    httpMethod: 'POST',
    path: '/interactions',
    pathParameters: null,
    queryStringParameters: null,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '/interactions',
    isBase64Encoded: false,
  };

  try {
    const result = await handler(event);

    if (result) {
      console.log('Response:', JSON.stringify(result, null, 2));
      res.status(result.statusCode).set(result.headers).send(result.body);
    } else {
      res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`\n Discord Bot Local Server`);
  console.log('================================');
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Interactions endpoint: http://localhost:${PORT}/interactions`);
  console.log('\nTo expose to Discord:');
  console.log('  1. Run: ngrok http 3000');
  console.log('  2. Copy the https URL');
  console.log('  3. Paste in Discord Developer Portal -> Interactions Endpoint URL');
  console.log('\nPress Ctrl+C to stop');
});
