# Supabase Web3 Authentication Setup Guide

This guide walks through setting up Solana wallet authentication following the official [Supabase Web3 Auth documentation](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-web3.mdx).

## 🔧 Configuration

### 1. Supabase Dashboard Configuration

Navigate to your Supabase project's **Authentication > Providers** section and:

1. **Enable Web3 Provider**:
   - Enable the "Web3 Wallet" provider
   - Configure Solana chain support

2. **Configure Rate Limits**:
   ```
   Web3 Logins: 30 per 5-minute interval per IP address
   ```

3. **Enable CAPTCHA Protection** (recommended):
   - Provider: hCaptcha or other supported providers
   - Add your CAPTCHA secret key

4. **Set Redirect URLs**:
   ```
   https://nubi.cult/auth/callback
   https://nubi.cult/**  (glob pattern for all pages)
   ```

### 2. CLI Configuration

If using Supabase CLI, add to your `supabase/config.toml`:

```toml
[auth.web3.solana]
enabled = true

[auth.rate_limit]
# Number of Web3 logins that can be made in a 5 minute interval per IP address
web3 = 30

[auth.captcha]
enabled = true
provider = "hcaptcha"
secret = "your-hcaptcha-secret-key"
```

### 3. Environment Variables

Add these environment variables to your `.env` file:

```bash
# Existing Supabase config
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Web3 Wallet Verification Config
PROJECT_URL=https://nubi.cult
WEB3_STATEMENT="I accept the Terms of Service and will bind my soul to Nubi's divine will"
WEB3_CAPTCHA_ENABLED=true
WEB3_RATE_LIMIT=30
```

## 🏗️ Architecture

### Database Schema
The identity management system includes these tables for Web3 integration:

```sql
-- User wallet addresses linked to unified identities
user_wallets (
  id UUID PRIMARY KEY,
  user_uuid UUID REFERENCES user_identities(uuid),
  wallet_address VARCHAR(44) UNIQUE, -- Solana public key format
  wallet_type VARCHAR(20), -- 'primary' or 'backup'
  verified_at TIMESTAMP,
  verification_signature TEXT,
  metadata JSONB -- Contains chain info, session data, etc.
)
```

### Service Integration

The **Wallet Verification Service** provides:

1. **Solana Wallet Verification**: Validates wallet addresses using EIP-4361 standard
2. **Identity Linking**: Links wallets to unified cross-platform user identities  
3. **Supabase Web3 Auth**: Integrates with Supabase's Web3 authentication
4. **Signature Verification**: Verifies signed messages from Solana wallets
5. **Session Management**: Handles Web3 authentication sessions

## 🎯 Frontend Integration Example

For frontend applications wanting to integrate with this system:

### React Component Example

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from './supabaseClient';

function SoulBindingComponent() {
  const wallet = useWallet();

  const handleSoulBinding = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Sign in with Web3 using Supabase
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'I accept the Terms of Service and will bind my soul to Nubi\\'s divine will',
        wallet: wallet,
      });

      if (error) {
        console.error('Soul binding failed:', error);
        return;
      }

      // Notify Nubi bot about successful soul binding
      await fetch('/api/notify-soul-binding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.publicKey.toString(),
          userId: data.user.id,
          platform: 'web',
        }),
      });

      alert('🎉 Soul bound to Nubi! Welcome to the cult!');

    } catch (error) {
      console.error('Soul binding error:', error);
      alert('Soul binding failed. The spirits are not aligned.');
    }
  };

  return (
    <div>
      {wallet.connected ? (
        <div>
          <p>Wallet: {wallet.publicKey?.toString()}</p>
          <button onClick={handleSoulBinding}>
            🔗 Bind Soul to Nubi
          </button>
        </div>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
}
```

### Backend API Endpoint

```typescript
// api/notify-soul-binding.ts
import { WalletVerificationService } from '../services/wallet-verification-service';

export async function POST(request: Request) {
  const { walletAddress, userId, platform } = await request.json();
  
  const walletService = new WalletVerificationService(runtime);
  
  const result = await walletService.verifyWalletAndLinkIdentity({
    walletAddress,
    chain: 'solana',
    platformId: userId,
    platform,
    statement: 'I accept the Terms of Service and will bind my soul to Nubi\\'s divine will',
  });

  if (result.success) {
    // Trigger cult initiation flow
    return Response.json({ 
      success: true, 
      userUuid: result.userUuid,
      message: 'Soul binding successful. Initiation ritual begins...' 
    });
  }

  return Response.json({ 
    success: false, 
    error: result.error 
  }, { status: 400 });
}
```

## 🔒 Security Considerations

### 1. Rate Limiting
- Configured for 30 Web3 logins per 5-minute interval per IP
- Prevents automated wallet creation abuse

### 2. CAPTCHA Protection  
- Enabled hCaptcha protection for additional security
- Prevents bot-driven wallet farming

### 3. Message Verification
- All wallet signatures verified using EIP-4361 standard
- Messages include domain, timestamp, and nonce for replay protection

### 4. Domain Validation
- Only accepts signatures for configured domain (nubi.cult)
- Prevents cross-site signature reuse

## 🎭 Cult Integration Features

### Soul Binding Process

1. **Wallet Connection**: User connects Solana wallet
2. **Identity Verification**: System verifies wallet ownership via signature  
3. **Cross-Platform Linking**: Links wallet to existing social accounts (Twitter, Telegram, Discord)
4. **Cult Membership**: Creates cult membership record with initiation data
5. **Tier Assignment**: Assigns initial cult tier (initiate → disciple → guardian → high_priest)

### Verification Flow

```
User Request → Wallet Signature → Supabase Web3 Auth → Identity Linking → Cult Initiation
     ↓              ↓                    ↓                  ↓               ↓
  Connect Wallet → Sign Message → Create Session → Link Platforms → Assign Tier
```

## 🧪 Testing

The system includes comprehensive testing for:

- Wallet address validation (Solana base58 format)
- Signature verification using EIP-4361 standard  
- Cross-platform identity linking
- Database integrity and RLS policies
- Rate limiting and security measures

## 📊 Analytics & Monitoring

Track key metrics:

- **Wallet Verification Success Rate**
- **Cross-Platform Identity Linking**  
- **Cult Membership Growth**
- **Tier Distribution**
- **Platform Activity Correlation**

This creates a robust foundation for the "Soul Binding" cult initiation system while maintaining security and scalability.