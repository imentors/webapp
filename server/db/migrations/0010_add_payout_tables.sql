-- Payout Enums
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE bank_account_status AS ENUM ('pending', 'verified', 'failed');

-- Mentor Bank Account Table
CREATE TABLE IF NOT EXISTS mentor_bank_account (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    stripe_connect_account_id TEXT,
    stripe_connect_onboarded BOOLEAN NOT NULL DEFAULT false,
    bank_name TEXT,
    account_holder_name TEXT,
    account_number_last4 TEXT,
    routing_number TEXT,
    account_type TEXT,
    currency TEXT NOT NULL DEFAULT 'usd',
    country TEXT NOT NULL DEFAULT 'US',
    status bank_account_status NOT NULL DEFAULT 'pending',
    is_default BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Mentor Payout Table
CREATE TABLE IF NOT EXISTS mentor_payout (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status payout_status NOT NULL DEFAULT 'pending',
    stripe_transfer_id TEXT,
    stripe_payout_id TEXT,
    bank_account_id TEXT REFERENCES mentor_bank_account(id) ON DELETE SET NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    failure_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Mentor Earning Table
CREATE TABLE IF NOT EXISTS mentor_earning (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    booking_id TEXT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    gross_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    payout_id TEXT REFERENCES mentor_payout(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    available_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mentor_earning_mentor_id ON mentor_earning(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_earning_status ON mentor_earning(status);
CREATE INDEX IF NOT EXISTS idx_mentor_earning_payout_id ON mentor_earning(payout_id);
CREATE INDEX IF NOT EXISTS idx_mentor_payout_mentor_id ON mentor_payout(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_payout_status ON mentor_payout(status);
CREATE INDEX IF NOT EXISTS idx_mentor_bank_account_mentor_id ON mentor_bank_account(mentor_id);
