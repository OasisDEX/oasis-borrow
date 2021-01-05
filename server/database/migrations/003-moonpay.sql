CREATE TABLE moonpay_webhook_request_log (
	id SERIAL PRIMARY KEY,
	moonpay_order_id VARCHAR(64) NOT NULL,
	moonpay_order_status VARCHAR(32), -- pending or completed or failed
	moonpay_base_currency_id VARCHAR(66),
	moonpay_currency_id VARCHAR(66),
	moonpay_customer_id VARCHAR(66),
	moonpay_card_id VARCHAR(66),
	moonpay_type VARCHAR,
	moonpay_failed_reason VARCHAR,
	moonpay_environment VARCHAR,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	updated TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX moonpay_webhook_request_log_moonpay_order_id_idx ON moonpay_webhook_request_log(moonpay_order_id);
CREATE INDEX moonpay_webhook_request_log_moonpay_order_status_idx ON moonpay_webhook_request_log(moonpay_order_status);
CREATE INDEX moonpay_webhook_request_log_moonpay_environment_idx ON moonpay_webhook_request_log (moonpay_environment);