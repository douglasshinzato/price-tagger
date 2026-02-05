-- Migration: Add product_details column to label_orders table
-- Execute this SQL in your Supabase SQL Editor

-- Add the product_details column (optional field)
ALTER TABLE label_orders 
ADD COLUMN IF NOT EXISTS product_details TEXT;

-- Add a comment to explain the column usage
COMMENT ON COLUMN label_orders.product_details IS 
'Características específicas do produto (tamanho, libragem, tipo de carretel, etc). Ex: 5''8, 6-12lb, Carretilha';
