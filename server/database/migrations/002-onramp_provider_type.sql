ALTER TABLE onramp_provider ADD provider_type VARCHAR(16) NULL;

UPDATE onramp_provider SET provider_type = 'wyre' WHERE id = 1;
UPDATE onramp_provider SET provider_type = 'moonpay' WHERE id = 2;

ALTER TABLE onramp_provider ALTER COLUMN provider_type SET NOT NULL;

CREATE INDEX onramp_provider_provider_type_idx ON onramp_provider (provider_type);
