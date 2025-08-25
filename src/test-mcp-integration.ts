import { character } from './agent-hub/character';

console.log('🧪 Testing NUBI MCP Integration...\n');

// Test 1: Verify MCP plugin is included
console.log('✅ Test 1: MCP Plugin Integration');
const hasMcpPlugin = character.plugins?.includes('@elizaos/plugin-mcp') || false;
console.log(`   MCP Plugin included: ${hasMcpPlugin ? '✅' : '❌'}`);

// Test 2: Verify MCP configuration exists
console.log('\n✅ Test 2: MCP Configuration');
const hasMcpConfig = character.settings && 'mcp' in character.settings;
console.log(`   MCP Settings configured: ${hasMcpConfig ? '✅' : '❌'}`);

if (hasMcpConfig && character.settings?.mcp) {
  const mcpSettings = character.settings.mcp as any;
  console.log(`   MCP Servers configured: ${Object.keys(mcpSettings.servers || {}).length}`);
  
  // Check for XMCPX server
  if (mcpSettings.servers?.xmcpx) {
    console.log('   ✅ XMCPX server configured');
    console.log(`   Server type: ${mcpSettings.servers.xmcpx.type}`);
    console.log(`   Command: ${mcpSettings.servers.xmcpx.command}`);
    console.log(`   Arguments: ${mcpSettings.servers.xmcpx.args.join(' ')}`);
  } else {
    console.log('   ❌ XMCPX server not found');
  }
}

// Test 3: Verify MCP-related topics
console.log('\n✅ Test 3: MCP Knowledge Topics');
const hasTopics = character.topics && Array.isArray(character.topics);
const mcpTopics = hasTopics ? character.topics!.filter(topic => 
  topic.toLowerCase().includes('mcp') || 
  topic.toLowerCase().includes('twitter') ||
  topic.toLowerCase().includes('api')
) : [];
console.log(`   MCP-related topics found: ${mcpTopics.length}`);
mcpTopics.forEach(topic => console.log(`   - ${topic}`));

// Test 4: Verify system prompt includes MCP capabilities
console.log('\n✅ Test 4: System Prompt MCP Integration');
const hasSystem = character.system && typeof character.system === 'string';
const hasMcpInSystem = hasSystem && (
  character.system!.toLowerCase().includes('mcp') || 
  character.system!.toLowerCase().includes('external tool')
);
console.log(`   MCP mentioned in system prompt: ${hasMcpInSystem ? '✅' : '❌'}`);

// Test 5: Check secrets configuration
console.log('\n✅ Test 5: MCP Secrets Configuration');
const hasMcpSecrets = character.secrets && Object.keys(character.secrets).length > 0;
console.log(`   MCP secrets configured: ${hasMcpSecrets ? '✅' : '❌'}`);

if (hasMcpSecrets) {
  Object.entries(character.secrets || {}).forEach(([key, value]) => {
    console.log(`   - ${key}: ${typeof value === 'string' && value.length > 20 ? '***' : value}`);
  });
}

console.log('\n🎉 MCP Integration Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Copy env.template to .env and fill in your Twitter credentials');
console.log('2. Test XMCPX server with: npx -y @promptordie/xmcpx --help');
console.log('3. Start your agent and test MCP tools');
console.log('4. Check the MCP_INTEGRATION_GUIDE.md for detailed usage instructions');
