const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio');

async function testMCP() {
  try {
    console.log('🚀 Testing MCP Integration...');
    
    // Create MCP client
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@promptordie/xmcpx'],
      env: {
        ...process.env,
        PORT: '3000',
        DISABLE_HTTP_SERVER: 'false'
      }
    });
    
    const client = new Client({
      name: 'nubi-test',
      version: '1.0.0'
    }, { capabilities: {} });
    
    await client.connect(transport);
    console.log('✅ MCP Client connected');
    
    // List available tools
    const tools = await client.listTools();
    console.log('🔧 Available tools:', tools.map(t => t.name));
    
    // Test posting a tweet
    if (tools.some(t => t.name === 'post_tweet')) {
      console.log('📱 Testing tweet posting...');
      const result = await client.callTool('post_tweet', {
        text: 'oh yea its getting that time'
      });
      console.log('✅ Tweet posted:', result);
    } else {
      console.log('❌ post_tweet tool not available');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ MCP test failed:', error.message);
  }
}

testMCP();
