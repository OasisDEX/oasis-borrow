INSERT INTO onramp_order (onramp_provider_id, order_ref, account_ref, order_status, order_message, recipient, source_amount, source_currency, dest_amount, dest_currency, network)
VALUES (1, 'RESERVATION_002', 'ABC_123', 'pending', NULL, '0x1234567890123456789012345678901234567890', 1.50, 'USD', 1, 'DAI', 'kovan');

INSERT INTO wyre_reservation (reservation,pay_url,wyre_account,recipient,amount,source_currency,dest_currency)
VALUES ('RESERVATION_001', 'https://pay.testwyre.com/purchase', 'ABC_123', '0x1234567890123456789012345678901234567890', 1, 'USD', 'DAI');
