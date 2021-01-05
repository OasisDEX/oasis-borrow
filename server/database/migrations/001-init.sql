CREATE TABLE wyre_webhook_request_log (
	id SERIAL PRIMARY KEY,
	wyre_account_id VARCHAR(32) NOT NULL,
	wyre_order_id VARCHAR(32) NOT NULL,
	wyre_order_status VARCHAR(32), -- RUNNING_CHECKS or PROCESSING or COMPLETE or FAILED
	wyre_reference_id VARCHAR(66),
	wyre_transfer_id VARCHAR(66),
	wyre_failed_reason VARCHAR,
	wyre_reservation VARCHAR,
	wyre_environment VARCHAR,
	created TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX wyre_webhook_request_log_wyre_order_id_idx ON wyre_webhook_request_log(wyre_order_id);
CREATE INDEX wyre_webhook_request_log_wyre_order_status_idx ON wyre_webhook_request_log(wyre_order_status);
CREATE INDEX wyre_webhook_request_log_wyre_reference_id_idx ON wyre_webhook_request_log(wyre_reference_id);
CREATE INDEX wyre_webhook_request_log_wyre_transfer_id_idx ON wyre_webhook_request_log(wyre_transfer_id);
CREATE INDEX wyre_webhook_request_log_wyre_environment_idx ON wyre_webhook_request_log (wyre_environment);

CREATE TABLE onramp_provider (
	id SERIAL PRIMARY KEY,
	name VARCHAR(32) NOT NULL
);
INSERT INTO onramp_provider (id, name) VALUES
(1, 'Wyre'),
(2, 'MoonPay');

CREATE TYPE order_status AS ENUM ('incomplete', 'initialised', 'pending', 'complete', 'accepted', 'failed', 'expired', 'rejected');

CREATE TABLE onramp_order (
	id SERIAL PRIMARY KEY,
	onramp_provider_id INTEGER NOT NULL REFERENCES onramp_provider(id),
	order_ref VARCHAR(64) NOT NULL,
	account_ref VARCHAR(64) NOT NULL,
	order_status order_status,
	order_message VARCHAR,
	recipient VARCHAR(42),
	source_amount NUMERIC(62,18),
	source_currency VARCHAR(10),
	dest_amount NUMERIC(62,18),
	dest_currency VARCHAR(10),
	network VARCHAR(16),
	updated TIMESTAMP NULL,
	created TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX onramp_order_order_ref_idx ON onramp_order(order_ref);
CREATE INDEX onramp_order_order_status_idx ON onramp_order(order_status);
CREATE INDEX onramp_order_recipient_idx ON onramp_order(recipient);
CREATE INDEX onramp_order_source_amount_idx ON onramp_order(source_amount);
CREATE INDEX onramp_order_dest_amount_idx ON onramp_order(dest_amount);
CREATE INDEX onramp_order_network_idx ON onramp_order(network);
CREATE INDEX onramp_order_created_idx ON onramp_order(created);

CREATE TABLE wyre_reservation (
	id SERIAL PRIMARY KEY,
	onramp_order_id INTEGER NULL REFERENCES onramp_order(id),
	reservation VARCHAR(32) NOT NULL,
	pay_url VARCHAR NOT NULL,
	wyre_account VARCHAR(32) NOT NULL,
	recipient VARCHAR(42) NOT NULL,
	amount NUMERIC(62,18) NOT NULL,
	source_currency VARCHAR(10) NOT NULL,
	dest_currency VARCHAR(10) NOT NULL,
	network VARCHAR(16),
	redirect_url VARCHAR,
	failure_redirect_url VARCHAR,
	created TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX wyre_reservation_reservation_idx ON wyre_reservation(reservation);
CREATE INDEX wyre_reservation_created_idx ON wyre_reservation(created);
