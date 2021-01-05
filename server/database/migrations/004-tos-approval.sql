CREATE TABLE user_email
(
  id SERIAL PRIMARY KEY,
  email VARCHAR(100)
);

CREATE UNIQUE INDEX user_email_unique_email ON user_email(email);

CREATE TABLE tos_approval
(
  id SERIAL PRIMARY KEY,
  address CHARACTER VARYING(66) NOT NULL,
  email_id INTEGER REFERENCES user_email(id),
  doc_version VARCHAR NOT NULL,
  sign_date TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX tos_approval_unique_signature ON tos_approval(address, doc_version);
CREATE INDEX tos_approval_email_id_idx ON tos_approval(email_id);