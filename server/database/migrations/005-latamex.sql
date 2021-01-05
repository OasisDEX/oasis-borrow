INSERT INTO onramp_provider (id, name, provider_type) VALUES (3, 'Latamex', 'latamex');

CREATE TABLE latamex_user (
	uuid VARCHAR(36) PRIMARY KEY,
	email VARCHAR(100) NOT NULL,
	country VARCHAR(20) NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX latamex_email_idx ON latamex_user(email);
CREATE INDEX latamex_uuid_idx ON latamex_user(uuid);
