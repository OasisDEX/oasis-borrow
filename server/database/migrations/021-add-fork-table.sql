CREATE TABLE rpc_forks
(
  uuid CHARACTER VARYING(50) NOT NULL,
  last_modified TIMESTAMP NOT NULL,
  blockNumber INTEGER NOT NULL
);

CREATE UNIQUE INDEX rpc_forks_unique_index ON rpc_forks(uuid);
