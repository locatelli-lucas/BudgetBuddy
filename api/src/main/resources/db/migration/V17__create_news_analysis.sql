CREATE TABLE news_article_analysis (
    id UUID PRIMARY KEY,
    asset_symbol VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    source VARCHAR(100),
    url VARCHAR(1000) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    article_content TEXT,
    ai_summary TEXT,
    sentiment VARCHAR(20),
    opportunities TEXT, -- Stored as JSON string or comma separated
    risks TEXT,         -- Stored as JSON string or comma separated
    market_impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_analysis_asset_symbol ON news_article_analysis(asset_symbol);
CREATE INDEX idx_news_analysis_url ON news_article_analysis(url);
