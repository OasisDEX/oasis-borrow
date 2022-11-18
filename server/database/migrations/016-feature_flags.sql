CREATE TABLE "feature_flag" (
    "id" SERIAL NOT NULL,
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    CONSTRAINT "feature_flag_pkey" PRIMARY KEY ("id")
);

INSERT INTO
    "feature_flag" ("feature", "enabled")
VALUES
    ('automation', FALSE),
    ('testFeature', FALSE),
    ('anotherTestFeature', TRUE),
    ('stopLossRead', TRUE),
    ('stopLossWrite', TRUE),
    ('batchCache', FALSE),
    ('stopLossOpenFlow', FALSE),
    ('readOnlyBasicBS', FALSE),
    ('notifications', TRUE),
    ('referrals', TRUE),
    ('constantMultipleReadOnly', FALSE),
    ('disableSidebarScroll', FALSE),
    ('proxyCreationDisabled', FALSE),
    ('autoTakeProfit', TRUE),
    ('updatedPnL', TRUE),
    ('readOnlyAutoTakeProfit', FALSE),
    ('discoverOasis', FALSE),
    ('showAaveStETHETHProductCard', TRUE),
    ('followVaults', FALSE),
    ('aaveProtection', FALSE)