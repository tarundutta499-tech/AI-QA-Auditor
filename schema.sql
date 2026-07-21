-- Schema for QA Copilot

-- 1. companies
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    api_key TEXT UNIQUE,
    api_key_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Multi-tenant Email Alerts Configuration
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_from_email TEXT,
    alert_threshold INTEGER DEFAULT 80,
    escalation_email TEXT,

    -- Stripe Subscription Fields
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_tier TEXT DEFAULT 'free'
);

-- 2. users (extends Supabase Auth users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'qa', 'tl', 'agent')),
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 3. scorecards
CREATE TABLE public.scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 4. scorecard_parameters
CREATE TABLE public.scorecard_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scorecard_id UUID REFERENCES public.scorecards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    max_score DECIMAL NOT NULL,
    is_mandatory BOOLEAN DEFAULT false,
    weightage DECIMAL DEFAULT 1.0,
    pass_fail_rules JSONB
);

-- 5. calls
CREATE TABLE public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_name TEXT,
    audio_url TEXT,
    duration INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'transcribed', 'audited')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 6. transcripts
CREATE TABLE public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
    content JSONB,
    dead_air_events JSONB
);

-- 7. audits
CREATE TABLE public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
    scorecard_id UUID REFERENCES public.scorecards(id) ON DELETE CASCADE,
    qa_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- system if null or specific system UUID
    overall_score DECIMAL,
    compliance_percent DECIMAL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 8. audit_results
CREATE TABLE public.audit_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    parameter_id UUID REFERENCES public.scorecard_parameters(id) ON DELETE CASCADE,
    obtained_score DECIMAL,
    is_passed BOOLEAN,
    evidence TEXT,
    reasoning TEXT,
    coaching_feedback TEXT
);

-- 9. coaching
CREATE TABLE public.coaching (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    strengths TEXT,
    improvement_areas TEXT,
    recommended_actions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 10. dsat_records
CREATE TABLE public.dsat_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
    score INTEGER,
    customer_feedback TEXT,
    root_cause_category TEXT,
    ai_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 11. calibrations
CREATE TABLE public.calibrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    qa_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    qa_score INTEGER,
    ai_score INTEGER,
    variance INTEGER,
    disagreement_areas JSONB,
    suggested_final_score INTEGER
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsat_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibrations ENABLE ROW LEVEL SECURITY;

-- 12. api_keys
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    key_value TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Modify audits for raw JSON payload
ALTER TABLE public.audits 
ADD COLUMN raw_analysis JSONB,
ADD COLUMN fatal_errors JSONB,
ADD COLUMN coaching_notes JSONB,
ADD COLUMN empathy_score DECIMAL;

-- 13. invites
CREATE TABLE public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'qa', 'tl', 'agent')),
    token UUID DEFAULT gen_random_uuid() UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
