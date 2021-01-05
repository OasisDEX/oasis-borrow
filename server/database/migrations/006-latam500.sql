CREATE TABLE latam500_distribution (
    id SERIAL PRIMARY KEY,
    recipient character varying(42) NOT NULL,
    last_sent_date timestamp without time zone,
    first_sent_date timestamp without time zone,
    first_sent_tx_hash text,
    second_sent_date timestamp without time zone,
    second_sent_tx_hash text,
    third_sent_date timestamp without time zone,
    third_sent_tx_hash text,
    locked boolean DEFAULT false,
    join_date timestamp without time zone
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX latam500_payout_pkey ON latam500_distribution(id int4_ops);
CREATE UNIQUE INDEX latam500_distribution_recipient ON latam500_distribution(recipient text_ops);