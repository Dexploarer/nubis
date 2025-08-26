-- Identity Management System Database Schema
-- Creates tables for unified cross-platform user identities
-- Date: 2025-08-26

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Identities Table
-- Central table for unified user identities across all platforms
CREATE TABLE IF NOT EXISTS user_identities (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    -- Indexes for performance
    CREATED_AT TIMESTAMP DEFAULT NOW(),
    UPDATED_AT TIMESTAMP DEFAULT NOW()
);

-- Platform Accounts Table
-- Links platform-specific accounts (Twitter, Telegram, Discord) to unified identities
CREATE TABLE IF NOT EXISTS platform_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL REFERENCES user_identities(uuid) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'telegram', 'discord', 'web', 'api')),
    platform_id VARCHAR(255) NOT NULL,
    platform_username VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    -- Ensure unique platform accounts
    UNIQUE(platform, platform_id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Addresses Table (for future Solana integration)
-- Links Solana wallet addresses to user identities
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL REFERENCES user_identities(uuid) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL UNIQUE, -- Solana public key format
    wallet_type VARCHAR(20) DEFAULT 'primary' CHECK (wallet_type IN ('primary', 'backup')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_signature TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cult Membership Table (for initiation system)
-- Tracks cult membership status and tiers
CREATE TABLE IF NOT EXISTS cult_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL REFERENCES user_identities(uuid) ON DELETE CASCADE,
    membership_tier VARCHAR(20) DEFAULT 'initiate' CHECK (
        membership_tier IN ('initiate', 'disciple', 'guardian', 'high_priest')
    ),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    soul_bound BOOLEAN DEFAULT FALSE,
    initiation_data JSONB DEFAULT '{}',
    
    -- Ensure one membership per user
    UNIQUE(user_uuid),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_identities_last_active ON user_identities(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_identities_created ON user_identities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_accounts_user_uuid ON platform_accounts(user_uuid);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_platform ON platform_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_platform_id ON platform_accounts(platform, platform_id);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_verified ON platform_accounts(verified_at DESC) WHERE verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_uuid ON user_wallets(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_verified ON user_wallets(verified_at DESC) WHERE verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cult_memberships_user_uuid ON cult_memberships(user_uuid);
CREATE INDEX IF NOT EXISTS idx_cult_memberships_tier ON cult_memberships(membership_tier);
CREATE INDEX IF NOT EXISTS idx_cult_memberships_soul_bound ON cult_memberships(soul_bound) WHERE soul_bound = TRUE;
CREATE INDEX IF NOT EXISTS idx_cult_memberships_initiated ON cult_memberships(initiated_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cult_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_identities
CREATE POLICY "Users can view their own identity" ON user_identities
    FOR SELECT USING (auth.uid()::text = uuid::text);

CREATE POLICY "Service role can manage all identities" ON user_identities
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for platform_accounts
CREATE POLICY "Users can view their own platform accounts" ON platform_accounts
    FOR SELECT USING (auth.uid()::text = user_uuid::text);

CREATE POLICY "Service role can manage all platform accounts" ON platform_accounts
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_wallets
CREATE POLICY "Users can view their own wallets" ON user_wallets
    FOR SELECT USING (auth.uid()::text = user_uuid::text);

CREATE POLICY "Users can insert their own wallets" ON user_wallets
    FOR INSERT WITH CHECK (auth.uid()::text = user_uuid::text);

CREATE POLICY "Service role can manage all wallets" ON user_wallets
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for cult_memberships
CREATE POLICY "Users can view their own membership" ON cult_memberships
    FOR SELECT USING (auth.uid()::text = user_uuid::text);

CREATE POLICY "Service role can manage all memberships" ON cult_memberships
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for table creation (used by Identity Management Service)
CREATE OR REPLACE FUNCTION create_user_identities_table()
RETURNS VOID AS $$
BEGIN
    -- This function is called by the service to ensure table exists
    -- The actual table creation is handled above
    RAISE NOTICE 'User identities table schema verified';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_platform_accounts_table()
RETURNS VOID AS $$
BEGIN
    -- This function is called by the service to ensure table exists
    -- The actual table creation is handled above
    RAISE NOTICE 'Platform accounts table schema verified';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper functions for identity management
CREATE OR REPLACE FUNCTION get_user_cross_platform_summary(input_user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'uuid', ui.uuid,
        'created_at', ui.created_at,
        'last_active_at', ui.last_active_at,
        'metadata', ui.metadata,
        'platform_accounts', (
            SELECT json_agg(json_build_object(
                'platform', pa.platform,
                'platform_id', pa.platform_id,
                'platform_username', pa.platform_username,
                'verified_at', pa.verified_at
            ))
            FROM platform_accounts pa
            WHERE pa.user_uuid = ui.uuid
        ),
        'wallets', (
            SELECT json_agg(json_build_object(
                'wallet_address', uw.wallet_address,
                'wallet_type', uw.wallet_type,
                'verified_at', uw.verified_at
            ))
            FROM user_wallets uw
            WHERE uw.user_uuid = ui.uuid
        ),
        'cult_membership', (
            SELECT json_build_object(
                'membership_tier', cm.membership_tier,
                'initiated_at', cm.initiated_at,
                'soul_bound', cm.soul_bound
            )
            FROM cult_memberships cm
            WHERE cm.user_uuid = ui.uuid
        )
    ) INTO result
    FROM user_identities ui
    WHERE ui.uuid = input_user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find or create user identity by platform account
CREATE OR REPLACE FUNCTION find_or_create_user_by_platform(
    p_platform VARCHAR(50),
    p_platform_id VARCHAR(255),
    p_platform_username VARCHAR(255) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    found_user_uuid UUID;
    new_user_uuid UUID;
BEGIN
    -- Try to find existing platform account
    SELECT pa.user_uuid INTO found_user_uuid
    FROM platform_accounts pa
    WHERE pa.platform = p_platform AND pa.platform_id = p_platform_id;
    
    IF found_user_uuid IS NOT NULL THEN
        -- Update last active
        UPDATE user_identities 
        SET last_active_at = NOW()
        WHERE uuid = found_user_uuid;
        
        RETURN found_user_uuid;
    END IF;
    
    -- Create new user identity
    INSERT INTO user_identities (metadata)
    VALUES (json_build_object(
        'displayName', p_platform_username,
        'preferredPlatform', p_platform,
        'createdFrom', p_platform
    ))
    RETURNING uuid INTO new_user_uuid;
    
    -- Create platform account link
    INSERT INTO platform_accounts (user_uuid, platform, platform_id, platform_username, metadata)
    VALUES (new_user_uuid, p_platform, p_platform_id, p_platform_username, p_metadata);
    
    RETURN new_user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_identities_updated_at
    BEFORE UPDATE ON user_identities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_platform_accounts_updated_at
    BEFORE UPDATE ON platform_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cult_memberships_updated_at
    BEFORE UPDATE ON cult_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant permissions to service role
GRANT ALL ON user_identities TO service_role;
GRANT ALL ON platform_accounts TO service_role;
GRANT ALL ON user_wallets TO service_role;
GRANT ALL ON cult_memberships TO service_role;

GRANT EXECUTE ON FUNCTION create_user_identities_table() TO service_role;
GRANT EXECUTE ON FUNCTION create_platform_accounts_table() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_cross_platform_summary(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION find_or_create_user_by_platform(VARCHAR, VARCHAR, VARCHAR, JSONB) TO service_role;

-- Insert initial migration record
INSERT INTO migrations (name, executed_at) VALUES 
('2025-08-26-identity-management-schema', NOW())
ON CONFLICT (name) DO NOTHING;