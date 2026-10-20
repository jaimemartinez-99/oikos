# Categorías de la compra

Los tickets se agrupan automáticamente en Fruta, Verdura y hortalizas, Carne y
embutidos, Pescado y marisco, Lácteos y huevos, Pan/pasta/cereales, Legumbres,
Bebidas, Limpieza y hogar, Higiene personal, Otros y Desconocido.

La clasificación funciona en el navegador, sin servicios de IA ni coste por
consulta. Se aplica también a los tickets existentes, sin reescribir productos.
Los pendientes aparecen antes que los comprados y se ordenan alfabéticamente
dentro de cada categoría. Se conservan cantidades, duplicados y estados.

## Catálogo y detección

- `src/shoppingCatalogue.js` contiene las familias de productos, expresiones y
  marcas. Los alias de cada familia se separan con `|`.
- `src/shoppingCategories.js` normaliza tildes, mayúsculas, puntuación y plurales
  conocidos. La expresión más específica del principio tiene prioridad:
  «Fairy limón» es limpieza, «leche corporal» es higiene, «leche de avena» es bebida.
- Se tolera una errata en palabras de al menos cinco letras conservando sus dos
  primeras letras, siempre que los candidatos pertenezcan a una sola categoría.
- Las marcas generales ambiguas como Nestlé, Hacendado y Carrefour necesitan un
  nombre de producto. «Gallo» sin más también es ambiguo entre pescado y pasta.
- «Otros» contiene productos reconocidos como hummus, aceite y salsas.
  Todo lo no reconocido o ambiguo va a «Desconocido».

## Corregir categorías

Clic derecho sobre cualquier producto, botón de categorías (etiquetas), o
pulsación larga sobre el nombre en móvil. El menú admite teclado: flechas,
Inicio/Fin, Intro para elegir y Escape para cerrar.

La elección se aplica al mismo nombre normalizado en todos los tickets del hogar,
incluidos los productos añadidos después, y tiene prioridad sobre el catálogo.
Se recuerda la frase completa; categorizar «mi marca» no cambia automáticamente
otros nombres que la contengan. Se puede elegir «Desconocido» expresamente o
usar «Volver a detección automática» para borrar una corrección.

Las correcciones se guardan en `shopping_product_categories`, con clave
`(household_id, product_key)` y RLS para miembros del hogar. Se cargan al entrar o
recargar la aplicación. No se necesita añadir columnas a `shopping_items`.
En modo demo se conservan en el almacenamiento local del navegador.

## Base de datos y comprobaciones

La migración `supabase/migrations/20261020000000_shopping_categories.sql` debe
aplicarse antes de publicar el frontend. También está incorporada a `schema.sql`.

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas de navegador usan un hogar de demostración aislado, en escritorio y
móvil, sin conectar con Supabase. Los resultados quedan en `e2e/.results/`.
Las pruebas SQL de permisos crean fixtures dentro de una transacción que se
revierte completamente:

```sh
supabase db query --linked --file supabase/tests/shopping_categories.sql
```
