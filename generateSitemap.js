import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import axios from 'axios';

// URLs base
const urlBase = 'http://neotechbol.test/api/';
const urlBaseAsset = 'http://neotechbol.test/';
const siteUrl = 'https://neotechbol.com'; // URL pública de tu sitio

// Función para obtener productos recientes
const listarProductosRecientes = async () => {
  try {
    const { data } = await axios.get(`${urlBase}productos-recientes`);
    return data.datos || [];
  } catch (error) {
    console.error('Error al obtener productos recientes:', error.message);
    return [];
  }
};

// Función para obtener catálogos activos
const listarCatalogosActivos = async () => {
  try {
    const { data } = await axios.get(`${urlBase}catalogos-activos`);
    return data.datos || [];
  } catch (error) {
    console.error('Error al obtener catálogos activos:', error.message);
    return [];
  }
};

// Función para generar slug SEO-friendly
export function generarSlug(text) {
  if (!text) return '';
  
  return text
    .toString()
    .normalize('NFD')                   // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')   // Elimina diacríticos
    .toLowerCase()                      // Convierte a minúsculas
    .replace(/\s+/g, '-')              // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '')          // Elimina caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')            // Reemplaza múltiples guiones con uno solo
    .replace(/^-+/, '')                // Elimina guiones del inicio
    .replace(/-+$/, '');               // Elimina guiones del final
}

// Función para calcular prioridad basada en datos del producto
const calcularPrioridad = (producto) => {
  if (producto.precio_preventa) {
    return 0.9; // Mayor prioridad para productos en preventa
  }
  return 0.8; // Prioridad estándar
};

const generateSitemap = async () => {
  try {
    // Obtener datos
    console.log('Obteniendo datos para el sitemap...');
    const [productosRecientes, catalogos] = await Promise.all([
      listarProductosRecientes(),
      listarCatalogosActivos()
    ]);
    
    console.log(`Se encontraron ${productosRecientes.length} productos y ${catalogos.length} catálogos`);

    // Crear stream de sitemap
    const sitemapStream = new SitemapStream({ hostname: siteUrl });
    
    // Asegurar que existe el directorio de salida
    const outputPath = './public/sitemap.xml';
    const outputDir = dirname(outputPath);

    if (!existsSync(outputDir)) {
      console.log(`Creando directorio: ${outputDir}`);
      mkdirSync(outputDir, { recursive: true });
    }

    // URLs estáticas principales
    const staticUrls = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/nosotros', changefreq: 'monthly', priority: 0.7 },
      { url: '/contacto', changefreq: 'monthly', priority: 0.7 },
      { url: '/productos', changefreq: 'daily', priority: 0.9 },
      { url: '/categorias', changefreq: 'weekly', priority: 0.8 },
      { url: '/catalogos', changefreq: 'weekly', priority: 0.8 },
    ];

    // Agregar URLs estáticas al sitemap
    staticUrls.forEach(urlObj => {
      sitemapStream.write(urlObj);
    });

    // Añadir catálogos y sus categorías al sitemap
    console.log(`Añadiendo ${catalogos.length} catálogos al sitemap...`);
    catalogos.forEach(catalogo => {
      const catalogoSlug = generarSlug(catalogo.nombre);
      
      // Añadir URL del catálogo
      sitemapStream.write({
        url: `/catalogo/${catalogo.id}/${catalogoSlug}`,
        lastmod: catalogo.updated_at,
        changefreq: 'weekly',
        priority: 0.8
      });
      
      // Procesar categorías del catálogo
      if (catalogo.categorias && Array.isArray(catalogo.categorias)) {
        console.log(`  - Catálogo ${catalogo.id}: ${catalogo.nombre} tiene ${catalogo.categorias.length} categorías`);
        
        catalogo.categorias.forEach(categoria => {
          // Verificar que la categoría tiene los datos necesarios
          if (categoria && categoria.id) {
            const categoriaSlug = generarSlug(categoria.nombre);
            
            // Añadir URL de la categoría dentro del catálogo
            sitemapStream.write({
              url: `/catalogo/${catalogo.id}/categoria/${categoria.id}/${categoriaSlug}`,
              lastmod: categoria.updated_at || catalogo.updated_at,
              changefreq: 'weekly',
              priority: 0.7,
              // Incluir banner de categoría si existe
              img: categoria.banner
                ? [{
                    url: `${urlBaseAsset}images/banners/${categoria.banner}`,
                    caption: categoria.titulo || categoria.nombre,
                    title: categoria.nombre
                  }]
                : undefined,
              // Enlazar con el catálogo padre
              links: [
                {
                  lang: 'es',
                  url: `/catalogo/${catalogo.id}/${catalogoSlug}`,
                  title: catalogo.nombre
                }
              ]
            });
            
            // También añadir URL independiente de la categoría
            sitemapStream.write({
              url: `/categoria/${categoria.id}/${categoriaSlug}`,
              lastmod: categoria.updated_at || catalogo.updated_at,
              changefreq: 'weekly',
              priority: 0.7,
              img: categoria.banner
                ? [{
                    url: `${urlBaseAsset}images/banners/${categoria.banner}`,
                    caption: categoria.titulo || categoria.nombre,
                    title: categoria.nombre
                  }]
                : undefined
            });
          } else {
            console.warn(`    - Advertencia: Categoría inválida en catálogo ${catalogo.id}`);
          }
        });
      } else {
        console.log(`  - Catálogo ${catalogo.id}: ${catalogo.nombre} no tiene categorías o no son un array`);
      }
    });

    // Extraer categorías únicas de los productos
    const categorias = [];
    const categoriasIds = new Set();

    productosRecientes.forEach(producto => {
      if (producto.categoria && !categoriasIds.has(producto.categoria.id)) {
        categorias.push(producto.categoria);
        categoriasIds.add(producto.categoria.id);
      }
    });

    // Añadir productos al sitemap
    console.log(`Añadiendo ${productosRecientes.length} productos al sitemap...`);
    productosRecientes.forEach(producto => {
      const productoSlug = generarSlug(producto.nombre);
      
      // Crear URLs para el producto
      const urls = [
        // URL principal del producto
        {
          url: `/producto/${producto.id}/${productoSlug}`,
          lastmod: producto.updated_at,
          changefreq: 'weekly',
          priority: calcularPrioridad(producto),
          img: [
            // Imagen principal
            ...(producto.imagen_principal ? [{
              url: producto.imagen_principal,
              caption: producto.nombre,
              title: producto.nombre
            }] : []),
            // Imágenes adicionales (limitadas a 5)
            ...(producto.images && producto.images.length > 0 
              ? producto.images
                  .filter(img => img && (img.url || img.path || img.src))
                  .map(img => ({
                    url: img.url || img.path || img.src,
                    caption: `${producto.nombre} - ${img.alt || 'Imagen adicional'}`,
                    title: producto.nombre
                  }))
                  .slice(0, 5)
              : [])
          ],
          // Enlaces relacionados
          links: []
        }
      ];
      
      // Añadir enlace a la categoría si existe
      if (producto.categoria) {
        const categoriaSlug = generarSlug(producto.categoria.nombre);
        urls[0].links.push({
          lang: 'es',
          url: `/categoria/${producto.categoria.id}/${categoriaSlug}`,
          title: producto.categoria.nombre
        });
        
        // Añadir URL alternativa del producto dentro de su categoría
        urls.push({
          url: `/categoria/${producto.categoria.id}/producto/${producto.id}/${productoSlug}`,
          lastmod: producto.updated_at,
          changefreq: 'weekly',
          priority: 0.7
        });
      }
      
      // Escribir todas las URLs del producto
      urls.forEach(url => sitemapStream.write(url));
    });

    // Finalizar el stream
    sitemapStream.end();

    // Guardar el sitemap en un archivo
    const sitemapOutput = await streamToPromise(sitemapStream);
    const writeStream = createWriteStream(outputPath);
    writeStream.write(sitemapOutput.toString());
    writeStream.end();

    console.log(`Sitemap generado correctamente en ${outputPath}`);

    // Generar robots.txt
    const robotsPath = './public/robots.txt';
    const robotsContent = `
User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;

    const robotsStream = createWriteStream(robotsPath);
    robotsStream.write(robotsContent);
    robotsStream.end();

    console.log(`Archivo robots.txt generado en ${robotsPath}`);
    
    // Generar sitemap de imágenes separado
    await generateImageSitemap(productosRecientes);
    
  } catch (error) {
    console.error('Error al generar el sitemap:', error);
  }
};

// Función para generar un sitemap específico para imágenes
const generateImageSitemap = async (productos) => {
  try {
    const imageSitemapStream = new SitemapStream({ hostname: siteUrl });
    const outputPath = './public/image-sitemap.xml';
    
    console.log('Generando sitemap de imágenes...');
    
    // Añadir productos con imágenes
    productos.forEach(producto => {
      const productoSlug = generarSlug(producto.nombre);
      const productoUrl = `/producto/${producto.id}/${productoSlug}`;
      
      // Solo añadir productos que tengan imágenes
      if (producto.imagen_principal || (producto.images && producto.images.length > 0)) {
        const imagenes = [];
        
        // Añadir imagen principal
        if (producto.imagen_principal) {
          imagenes.push({
            url: producto.imagen_principal,
            caption: producto.nombre,
            title: producto.nombre,
            license: 'https://creativecommons.org/licenses/by/4.0/'
          });
        }
        
        // Añadir imágenes adicionales
        if (producto.images && producto.images.length > 0) {
          producto.images
            .filter(img => img && (img.url || img.path || img.src))
            .forEach(img => {
              imagenes.push({
                url: img.url || img.path || img.src,
                caption: `${producto.nombre} - ${img.alt || 'Imagen adicional'}`,
                title: producto.nombre,
                license: 'https://creativecommons.org/licenses/by/4.0/'
              });
            });
        }
        
        // Añadir entrada al sitemap de imágenes
        if (imagenes.length > 0) {
          imageSitemapStream.write({
            url: productoUrl,
            img: imagenes
          });
        }
      }
    });
    
    // Finalizar el stream
    imageSitemapStream.end();
    
    // Guardar el sitemap de imágenes
    const imageSitemapOutput = await streamToPromise(imageSitemapStream);
    const writeStream = createWriteStream(outputPath);
    writeStream.write(imageSitemapOutput.toString());
    writeStream.end();
    
    console.log(`Sitemap de imágenes generado correctamente en ${outputPath}`);
    
    // Actualizar robots.txt para incluir el sitemap de imágenes
    const robotsPath = './public/robots.txt';
    const robotsContent = `
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/image-sitemap.xml
`;
    
    const robotsStream = createWriteStream(robotsPath);
    robotsStream.write(robotsContent);
    robotsStream.end();
    
  } catch (error) {
    console.error('Error al generar el sitemap de imágenes:', error);
  }
};

// Ejecutar la generación del sitemap
generateSitemap();