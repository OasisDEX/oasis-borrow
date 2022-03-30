CREATE TABLE wallet_risk
(
  address CHARACTER VARYING(66) NOT NULL,
  last_check TIMESTAMP NOT NULL,
  is_risky BOOLEAN NOT NULL
);

CREATE UNIQUE INDEX wallet_risk_unique_index ON wallet_risk(address);
