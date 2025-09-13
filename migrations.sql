-- Tabelas existentes já criadas anteriormente...

-- Tabela de sabores de pizza
CREATE TABLE IF NOT EXISTS pizza_flavors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('tradicional', 'premium', 'especial')),
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sabores de esfiha
CREATE TABLE IF NOT EXISTS esfiha_flavors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('tradicional', 'premium', 'especial')),
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir sabores de pizza
INSERT INTO pizza_flavors (name, category, price, active) VALUES
    ('Margherita', 'tradicional', 25.00, true),
    ('Calabresa', 'tradicional', 25.00, true),
    ('Portuguesa', 'tradicional', 25.00, true),
    ('Mussarela', 'tradicional', 25.00, true),
    ('Napolitana', 'tradicional', 25.00, true),
    ('Frango Catupiry', 'premium', 27.00, true),
    ('Bacon', 'premium', 27.00, true),
    ('Quatro Queijos', 'premium', 27.00, true),
    ('Pepperoni', 'premium', 27.00, true),
    ('Toscana', 'premium', 27.00, true),
    ('Banana Nevada', 'especial', 32.00, true),
    ('Chocolate', 'especial', 32.00, true),
    ('Salmão', 'especial', 32.00, true),
    ('Camarão', 'especial', 32.00, true),
    ('Vegetariana Gourmet', 'especial', 32.00, true)
ON CONFLICT DO NOTHING;

-- Inserir sabores de esfiha
INSERT INTO esfiha_flavors (name, category, price, active) VALUES
    ('Carne', 'tradicional', 2.50, true),
    ('Frango', 'tradicional', 2.50, true),
    ('Queijo', 'tradicional', 2.50, true),
    ('Pizza', 'tradicional', 2.50, true),
    ('Carne Seca', 'premium', 3.50, true),
    ('Frango Catupiry', 'premium', 3.50, true),
    ('Camarão', 'premium', 3.50, true),
    ('Chocolate', 'especial', 3.50, true),
    ('Doce de Leite', 'especial', 3.50, true)
ON CONFLICT DO NOTHING;

-- Atualizar produtos base (sem esfiha massa inicial para demo)
UPDATE products SET stock = 50 WHERE name = 'Massa de Pizza';
UPDATE products SET stock = 0 WHERE name = 'Massa de Esfiha';
UPDATE products SET in_stock = (stock > 0);
