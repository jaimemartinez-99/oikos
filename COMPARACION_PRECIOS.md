# Comparación de precios

El botón de la lupa, a la izquierda de borrar cada producto de Compra, abre una comparación con hasta ocho resultados por tienda. Para usarla con Supabase, despliega la función con `supabase functions deploy compare-prices` en el proyecto configurado. En modo demostración local sin Supabase, la ventana indica que no puede consultar precios.

Fuentes utilizadas (consultadas el 28-09-2026):

- **Alcampo:** página de búsqueda `https://www.compraonline.alcampo.es/search?q=...`, cuyos datos de producto y precio vienen en `productEntities` dentro del HTML. La estructura no es una API pública documentada y puede cambiar.
- **Mercadona:** índice de búsqueda Algolia utilizado por su web. Se verificó una consulta a `products_prod_mad1_es`. El identificador y la clave de solo búsqueda están publicados en el cliente web; pueden rotar. Se pueden sustituir en Supabase mediante los secretos `MERCADONA_ALGOLIA_APP` y `MERCADONA_ALGOLIA_KEY`. `MERCADONA_WAREHOUSE` permite elegir el almacén (por defecto `mad1`).
- **Supermercados BM:** endpoint `api/rest/V1.0/catalog/searcher/products` en `www.online.bmsupermercados.es`, identificado en el `config.json` público de su tienda. Se verificaron búsquedas de Maizena y leche con nombre, precio y precio por unidad. Es una API usada por la web, no una API pública documentada; su estructura puede cambiar. Si falla, la ventana muestra el error y ofrece un enlace a la tienda, sin inventar un precio.

Los resultados no son productos necesariamente equivalentes: hay que comparar marca, formato y precio por unidad. Los precios y la disponibilidad pueden variar por zona y fecha. No se envían direcciones postales ni credenciales a las tiendas.
