-- Enable leaked password protection for enhanced security
-- This prevents users from using passwords that have been compromised in data breaches

-- Update auth configuration to enable leaked password protection
INSERT INTO auth.config (parameter, value)
VALUES ('security.enable_weak_password_check', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;

-- Also ensure password strength requirements are enabled
INSERT INTO auth.config (parameter, value)
VALUES ('security.password_min_length', '8')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;

-- Enable password complexity requirements
INSERT INTO auth.config (parameter, value)
VALUES ('security.password_require_lowercase', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value)
VALUES ('security.password_require_uppercase', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value)
VALUES ('security.password_require_numbers', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value)
VALUES ('security.password_require_symbols', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;