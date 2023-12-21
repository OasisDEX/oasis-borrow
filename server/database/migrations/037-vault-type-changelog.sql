ALTER TABLE vault
    DROP CONSTRAINT IF EXISTS vault_vault_id_chain_id_protocol_token_pair_unique_constraint;

ALTER TABLE vault
    ADD CONSTRAINT vault_unique_constraint
        UNIQUE (vault_id, chain_id, protocol, token_pair, owner_address);

CREATE TABLE IF NOT EXISTS vault_change_log
(
    id             SERIAL PRIMARY KEY,
    vault_id       INT         NOT NULL,
    chain_id       INT         NOT NULL,
    token_pair     varchar(32) NOT NULL,
    owner_address  char(42)    NOT NULL,
    protocol       varchar(32) NOT NULL,
    old_vault_type vault_type  NULL,
    new_vault_type vault_type  NULL,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION vaultAfterInsert()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
    BEGIN
    INSERT INTO vault_change_log(vault_id, chain_id, token_pair, owner_address, protocol, new_vault_type)
    VALUES (NEW.vault_id, NEW.chain_id, NEW.token_pair, NEW.owner_address, NEW.protocol, NEW.type);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION vaultAfterUpdate()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.type <> OLD.type THEN
        INSERT INTO vault_change_log(vault_id, chain_id, token_pair, owner_address, protocol, old_vault_type,
                                     new_vault_type)
        VALUES (NEW.vault_id, NEW.chain_id, new.token_pair, NEW.owner_address, NEW.protocol, OLD.type, NEW.type);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER vaultAfterInsert
    AFTER INSERT
    ON vault
    FOR EACH ROW
EXECUTE PROCEDURE vaultAfterInsert();

CREATE TRIGGER vaultAfterUpdate
    AFTER UPDATE
    ON vault
    FOR EACH ROW
EXECUTE PROCEDURE vaultAfterUpdate();
