/**
 * Quick API Test Script
 * 
 * Run this to verify your API key and connection are working.
 */

import WanClient, { Region } from './src/index';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function test() {
  console.log('🧪 Testing Alibaba Cloud Wan2.6 API Connection\n');
  console.log('='.repeat(60));

  // Check API key
  const apiKey = process.env.ALICLOUD_API_KEY;
  if (!apiKey) {
    console.error('❌ ALICLOUD_API_KEY not found in .env file');
    console.log('\nPlease create a .env file with:');
    console.log('ALICLOUD_API_KEY=your-api-key-here');
    process.exit(1);
  }

  console.log('✅ API key found\n');

  // Initialize client
  const client = new WanClient({
    apiKey: apiKey,
    region: 'singapore' as Region,  // Use 'singapore' as the region value
  });

  console.log(`📍 Region: ${client.getRegion()}`);
  console.log(`🔗 Endpoint: ${client.getBaseUrl()}\n`);

  try {
    // Test connectivity with a simple request
    console.log('⏳ Sending test request...');
    console.log('(This may take a few seconds)\n');

    const result = await client.textToImage({
      prompt: 'A simple red circle on white background',
      n: 1,
      size: '1280*1280', // Wan2.7 requires H*W format
      watermark: false,
    });

    console.log('='.repeat(60));
    console.log('✅ API CONNECTION SUCCESSFUL!\n');
    console.log(`📝 Request ID: ${result.requestId}`);
    console.log(`✅ Success: ${result.success}`);
    console.log(`🖼️  Images Generated: ${result.results[0]?.images.length || 0}\n`);

    if (result.results[0]?.images[0]) {
      console.log('🔗 Image URL:');
      console.log(result.results[0].images[0].url);
    }

    if (result.usage) {
      console.log('\n📊 Usage Statistics:');
      console.log(`   Image Count: ${result.usage.image_count}`);
      console.log(`   Size: ${result.usage.size}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Your Wan2.6 API client is ready to use!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.log('='.repeat(60));
    console.error('❌ API CONNECTION FAILED\n');
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    if (error.message) {
      console.error(`Error Message: ${error.message}`);
    }
    if (error.requestId) {
      console.error(`Request ID: ${error.requestId}`);
    }

    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check you\'re using the right region (Singapore/Virginia/Beijing)');
    console.log('3. Ensure your API key has access to Model Studio');
    console.log('4. Check your account has sufficient quota/balance');
    console.log('='.repeat(60));
    
    process.exit(1);
  }
}

test();
