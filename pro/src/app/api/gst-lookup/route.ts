import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gstNumber = searchParams.get('gstNumber');

    // Validate GST Number
    if (!gstNumber) {
      return NextResponse.json(
        { error: 'GST Number is required' },
        { status: 400 }
      );
    }

    if (gstNumber.length !== 15) {
      return NextResponse.json(
        { error: 'GST Number must be 15 characters long' },
        { status: 400 }
      );
    }

    // GST Number format validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      return NextResponse.json(
        { error: 'Invalid GST Number format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GST_API_KEY;

    // If no API key, return mock data
    if (!apiKey || apiKey === 'mock') {
      console.log('⚠️ No API key found, using mock data');
      return NextResponse.json(getMockData(gstNumber));
    }

    // Call AppyFlow API - Using POST as per documentation
    const url = 'https://appyflow.in/api/verifyGST';
    
    console.log('📞 Calling AppyFlow API...');
    
    // Try POST request with form data
    const formData = new URLSearchParams();
    formData.append('gstNo', gstNumber);
    formData.append('key_secret', apiKey);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('📡 Response Status:', response.status);

    if (!response.ok) {
      console.error('❌ AppyFlow API Error:', responseText);
      
      // Check if quota exhausted
      if (responseText.includes('quota') || responseText.includes('exhausted')) {
        return NextResponse.json(
          { error: 'API quota exhausted. Please recharge at https://dashboard.gstapi.appyflow.in/' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch GST details. Please check your API key at https://dashboard.gstapi.appyflow.in/' },
        { status: response.status }
      );
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      return NextResponse.json(
        { error: 'Invalid response from GST API' },
        { status: 500 }
      );
    }

    // Check for API errors
    if (data.error === true) {
      console.error('❌ API returned error:', data.message);
      return NextResponse.json(
        { error: data.message || 'Invalid GST Number or not found' },
        { status: 404 }
      );
    }

    // Check if taxpayerInfo exists
    if (!data.taxpayerInfo) {
      console.error('❌ No taxpayerInfo in response:', data);
      return NextResponse.json(
        { error: 'Invalid response structure from API' },
        { status: 500 }
      );
    }

    // Extract taxpayer info
    const taxpayerInfo = data.taxpayerInfo;
    const pradr = taxpayerInfo.pradr || {};
    const addr = pradr.addr || {};

    console.log('✅ Successfully fetched GST details for:', taxpayerInfo.lgnm);

    // Format address
    const addressParts = [
      addr.bno,
      addr.st,
      addr.loc,
    ].filter(Boolean);
    
    const formattedAddress = [
      addressParts.join(', '),
      addr.dst,
      addr.stcd,
      addr.pncd
    ].filter(Boolean).join(', ');

    // Return formatted data
    return NextResponse.json({
      businessName: taxpayerInfo.tradeNam || taxpayerInfo.lgnm || '',
      address: formattedAddress || pradr.adr || '',
      legalName: taxpayerInfo.lgnm || '',
      status: taxpayerInfo.sts || '',
      registrationDate: taxpayerInfo.rgdt || '',
      taxpayerType: taxpayerInfo.ctb || '',
      state: addr.stcd || '',
      city: addr.dst || '',
      pincode: addr.pncd || '',
    });

  } catch (error) {
    console.error('💥 GST Lookup Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch GST details. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Mock data for testing without API key
function getMockData(gstNumber: string) {
  console.warn('🔶 Using MOCK GST data for testing');
  console.warn('📝 Add your AppyFlow API key to .env.local as GST_API_KEY');
  
  const stateCode = gstNumber.substring(0, 2);
  const stateMap: { [key: string]: string } = {
    '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '27': 'Maharashtra', '29': 'Karnataka', '33': 'Tamil Nadu',
  };
  const state = stateMap[stateCode] || 'Unknown State';
  
  return {
    businessName: 'Sample Business Private Limited',
    address: `123, Business Tower, Main Road, Sample City, ${state}, 560001`,
    legalName: 'SAMPLE BUSINESS PRIVATE LIMITED',
    status: 'Active',
    registrationDate: '01/01/2020',
    taxpayerType: 'Regular',
    state: state,
    city: 'Sample City',
    pincode: '560001',
  };
}

