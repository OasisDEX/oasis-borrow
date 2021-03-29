
CREATE TABLE tos_approval
(
  id SERIAL PRIMARY KEY,
  address CHARACTER VARYING(66) NOT NULL,
  doc_version VARCHAR NOT NULL,
  sign_date TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX tos_approval_unique_signature ON tos_approval(address, doc_version);