-- Catálogo: nome Zanshin; kimonos KMNO e Zanshin com linha azul (tamanhos); rash manga curta/longa.
-- Quantidades ficam a 0 — o professor ajusta na app.
-- Idempotente: INSERT ... ON CONFLICT DO NOTHING.

UPDATE public.products
SET
  name = 'Quimonos Zanshin',
  updated_at = now()
WHERE
  code = 'quimonos-zenshins';

INSERT INTO
  public.product_variants (product_id, size_label, stock_quantity, sort_order)
SELECT
  p.id,
  v.size_label,
  0,
  v.sort_order
FROM
  public.products p
  INNER JOIN (
    VALUES
      ('quimonos-kmno', 'Azul A0', 10),
      ('quimonos-zenshins', 'Azul A0', 10),
      ('quimonos-kmno', 'Azul A1', 20),
      ('quimonos-zenshins', 'Azul A1', 20),
      ('quimonos-kmno', 'Azul A2', 30),
      ('quimonos-zenshins', 'Azul A2', 30),
      ('quimonos-kmno', 'Azul A3', 40),
      ('quimonos-zenshins', 'Azul A3', 40),
      ('quimonos-kmno', 'Azul A4', 50),
      ('quimonos-zenshins', 'Azul A4', 50),
      ('quimonos-kmno', 'Azul A5', 60),
      ('quimonos-zenshins', 'Azul A5', 60),
      ('quimonos-kmno', 'Azul M00', 70),
      ('quimonos-zenshins', 'Azul M00', 70),
      ('quimonos-kmno', 'Azul M0', 80),
      ('quimonos-zenshins', 'Azul M0', 80),
      ('quimonos-kmno', 'Azul M1', 90),
      ('quimonos-zenshins', 'Azul M1', 90),
      ('quimonos-kmno', 'Azul M2', 100),
      ('quimonos-zenshins', 'Azul M2', 100),
      ('quimonos-kmno', 'Azul M3', 110),
      ('quimonos-zenshins', 'Azul M3', 110),
      ('quimonos-kmno', 'Azul M4', 120),
      ('quimonos-zenshins', 'Azul M4', 120),
      ('rash-guards-femininas', 'Manga curta', 10),
      ('rash-guards-femininas', 'Manga longa', 20),
      ('rash-guards-masculinas', 'Manga curta', 10),
      ('rash-guards-masculinas', 'Manga longa', 20)
  ) AS v(product_code, size_label, sort_order) ON p.code = v.product_code
ON CONFLICT ON CONSTRAINT product_variants_product_size_unique DO NOTHING;
