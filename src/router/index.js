import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/Auth/LoginView.vue'
import RegisterView from '@/views/Auth/RegisterView.vue'
import LayoutAdmin from '@/Layouts/LayoutAdmin.vue'
import HomAdminView from '@/Admin/HomAdminView.vue'
import UsuariosView from '@/Admin/UsuariosView.vue'
import ProductosView from '@/Admin/ProductosView.vue'
import CatalogosView from '@/Admin/CatalogosView.vue'
import CategoriasView from '@/Admin/CategoriasView.vue'
import RolesView from '@/Admin/RolesView.vue'
import NosotrosVire from '@/views/NosotrosVire.vue'
import LayoutF1User from '@/Layouts/LayoutF1User.vue'
import ContactoView from '@/views/ContactoView.vue'
import Producto from '@/views/Producto.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import PedidosView from '@/Admin/PedidosView.vue'
import CartView from '@/views/CartView.vue'
import PerfilView from '@/views/PerfilView.vue'
import Unauthorized from '@/views/Unauthorized.vue'
import { obtenerPermisos, userAutenticado } from '@/Services/UsuarioService'
import FavoriteView from '@/views/FavoriteView.vue'
import CuponesView from '@/Admin/CuponesView.vue'
import TerminosCondiciones from '@/views/TerminosCondiciones.vue'
import Page401 from '@/views/page401.vue'
import CategoriasViewPagina from '@/views/CategoriasViewPagina.vue'
import ProductosHomeView from '@/views/ProductosHomeView.vue'
import Guia from '@/views/Guia.vue'
import Faq from '@/views/faq.vue'
import CatalogosHistorialView from '@/Admin/CatalogosHistorialView.vue'
import CatalogoHistorial from '@/views/CatalogoHistorial.vue'
import CatalogoActivoView from '@/views/CatalogoActivoView.vue'
import ContactanosPanelView from '@/Admin/ContactanosPanelView.vue'
import VerificacionPendiente from '@/views/VerificacionPendiente.vue'
import { ref, reactive } from 'vue'

// Crear estado reactivo para el usuario y permisos
const authState = reactive({
  user: null,
  userPermisos: [],
  isLoading: false,
  lastFetch: 0
});

// Función para obtener los permisos del usuario
const fetchPermisosUser = async (forceRefresh = false) => {
  // Si ya estamos cargando, no iniciar otra solicitud
  if (authState.isLoading) return authState.userPermisos;
  
  // Si no forzamos la actualización y los permisos se obtuvieron hace menos de 5 minutos, usar la caché
  const now = Date.now();
  if (!forceRefresh && authState.lastFetch > 0 && now - authState.lastFetch < 300000) {
    console.log('Usando permisos en caché');
    return authState.userPermisos;
  }
  
  try {
    authState.isLoading = true;
    console.log('Obteniendo permisos del servidor...');
    
    const { data } = await obtenerPermisos();
    console.log('Respuesta de permisos:', data);
    
    // Guardar los permisos del usuario
    if (data && data.datos) {
      authState.userPermisos = data.datos;
      console.log('Permisos actualizados:', authState.userPermisos);
    } else {
      // Si no hay datos de permisos, asumimos que no tiene permisos
      authState.userPermisos = [];
      console.warn('No se encontraron permisos en la respuesta');
    }
    
    // Actualizar timestamp de última actualización
    authState.lastFetch = now;
    return authState.userPermisos;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return [];
  } finally {
    authState.isLoading = false;
  }
};

const fetchAuthenticatedUser = async (forceRefresh = false) => {
  // Si ya estamos cargando, no iniciar otra solicitud
  if (authState.isLoading) return authState.user;
  
  // Si no forzamos la actualización y el usuario se obtuvo hace menos de 5 minutos, usar la caché
  const now = Date.now();
  if (!forceRefresh && authState.lastFetch > 0 && now - authState.lastFetch < 300000) {
    console.log('Usando datos de usuario en caché');
    return authState.user;
  }
  
  try {
    authState.isLoading = true;
    console.log('Obteniendo datos de usuario autenticado...');
    
    const { data } = await userAutenticado();
    console.log('Datos del usuario autenticado:', data);
    
    if (data && data.datos && data.datos.roles && data.datos.roles.length > 0) {
      authState.user = data.datos.roles[0].name;
      console.log('Rol del usuario actualizado:', authState.user);
      
      // Obtener permisos después de autenticar al usuario
      await fetchPermisosUser(true);
    } else {
      console.error('No se encontraron roles en los datos del usuario.');
      authState.user = null;
    }
    
    // Actualizar timestamp de última actualización
    authState.lastFetch = now;
    return authState.user;
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error);
    authState.user = null;
    return null;
  } finally {
    authState.isLoading = false;
  }
};

// Verificar si el usuario tiene un permiso específico
const tienePermiso = async (permiso) => {
  if (!permiso) return true; // Si no se requiere permiso específico
  
  // Asegurarse de que los permisos estén actualizados
  await fetchPermisosUser();
  
  return authState.userPermisos.includes(permiso);
};

// Función para obtener el rol del usuario
const getUserRole = async () => {
  // Si no hay usuario, intentar obtenerlo
  if (!authState.user) {
    await fetchAuthenticatedUser();
  }
  return authState.user;
};

// Crear el router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'navbar-user',
      component: LayoutF1User,
      children: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
          meta: {
            title: 'Neotech-Bol | Tecnología y Electrónica en Bolivia',
            description: 'Tienda líder en tecnología y electrónica en Bolivia. Encuentra smartphones, computadoras y más al mejor precio.'
          }
        },
        {
          path: '/nosotros',
          name: 'nosotros',
          component: NosotrosVire,
          meta: {
            title: 'Nosotros | Neotech-Bol Bolivia',
            description: 'Conoce a Neotech-Bol, tu tienda de tecnología en Bolivia. Nuestra misión es ofrecer lo mejor en electrónica.'
          }
        },
        {
          path: '/contacto',
          name: 'contacto',
          component: ContactoView,
          meta: {
            title: 'Contacto | Neotech-Bol Bolivia',
            description: 'Contáctanos en Neotech-Bol para soporte o consultas sobre productos tecnológicos en Bolivia.'
          }
        },
        {
          path: "/producto/:idProducto?",
          name: 'producto',
          component: Producto,
          meta: {
            title: 'Producto | Neotech-Bol Bolivia',
            description: 'Explora los detalles de nuestros productos tecnológicos en Bolivia: smartphones, laptops y más.'
          }
        },
        {
          path: '/carrito',
          name: 'carrito',
          component: CartView,
          meta: {
            title: 'Carrito | Neotech-Bol Bolivia',
            description: 'Revisa tu carrito en Neotech-Bol y compra tecnología al mejor precio en Bolivia.'
          }
        },  
        {
          path: '/perfil',
          name: 'perfil',
          component: PerfilView,
          meta: {
            title: 'Perfil | Neotech-Bol Bolivia',
            description: 'Gestiona tu cuenta en Neotech-Bol y disfruta de una experiencia personalizada.'
          }
        },
        {
          path: '/favoritos',
          name: 'favoritos',
          component: FavoriteView,
          meta: {
            title: 'Favoritos | Neotech-Bol Bolivia',
            description: 'Consulta tus productos tecnológicos favoritos en Neotech-Bol Bolivia.'
          }
        },
        {
          path: '/categorias',
          name: 'categorias',
          component: CategoriasViewPagina,
          meta: {
            title: 'Categorías | Neotech-Bol Bolivia',
            description: 'Explora categorías de productos electrónicos en Neotech-Bol: smartphones, laptops y más.'
          }
        },
        {
          path: '/productos',
          name: 'productos',
          component: ProductosHomeView,
          meta: {
            title: 'Productos | Neotech-Bol Bolivia',
            description: 'Descubre nuestra selección de tecnología y electrónica en Bolivia con Neotech-Bol.'
          }
        },
        {
          path: '/guia',
          name: 'guia',
          component: Guia,
          meta: {
            title: 'Guía de Compra | Neotech-Bol Bolivia',
            description: 'Aprende cómo comprar tecnología en Neotech-Bol Bolivia con nuestra guía fácil.'
          }
        },
        {
          path: '/faq',
          name: 'faq',
          component: Faq,
          meta: {
            title: 'FAQ | Neotech-Bol Bolivia',
            description: 'Resuelve tus dudas sobre compras en Neotech-Bol con nuestras preguntas frecuentes.'
          }
        },
        {
          path: 'catalogo-historial/:idCatalogoHistorial?',
          name: 'catalogo-historial',
          component: CatalogoHistorial,
          meta: {
            title: 'Catálogo Historial | Neotech-Bol Bolivia',
            description: 'Revisa catálogos pasados de tecnología y electrónica en Neotech-Bol Bolivia.'
          }
        },
        {
          path: 'catalogo-activo/:idCatalogoActivo?',
          name: 'catalogo-activo',
          component: CatalogoActivoView,
          meta: {
            title: 'Catálogo Activo | Neotech-Bol Bolivia',
            description: 'Explora el catálogo actual de Neotech-Bol con ofertas en tecnología en Bolivia.'
          }
        }
      ],
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: {
        title: 'Checkout | Neotech-Bol Bolivia',
        description: 'Finaliza tu compra de productos electrónicos en Neotech-Bol de forma rápida y segura.'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Iniciar Sesión | Neotech-Bol Bolivia',
        description: 'Accede a tu cuenta en Neotech-Bol para comprar tecnología en Bolivia.'
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        title: 'Registro | Neotech-Bol Bolivia',
        description: 'Regístrate en Neotech-Bol y disfruta de lo mejor en electrónica en Bolivia.'
      }
    },
    {
      path: '/admin-panel',
      component: LayoutAdmin,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/admin-panel',
          name: 'admin-panel',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: null
          },
          component: HomAdminView
        },
        {
          path: '/usuarios',
          name: 'usuarios',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: 'Gestionar Usuarios'
          },
          component: UsuariosView
        },
        {
          path: '/productos-admin',
          name: 'productos-admin',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: 'Gestionar Productos'
          },
          component: ProductosView
        },
        {
          path: '/catalogos',
          name: 'catalogos',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: 'Gestionar Catalogos'
          },
          component: CatalogosView
        },
        {
          path: '/categorias-panel',
          name: 'categorias-panel',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: 'Gestionar Categorias'
          },
          component: CategoriasView
        },
        {
          path: '/roles',
          name: 'roles',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: 'Gestionar Roles'
          },
          component: RolesView
        },
        {
          path: '/pedidos',
          name: 'pedidos',
          meta: { 
            requiredRole: 'super-admin',
            requiredPermission: 'Gestionar Pedidos'
          },
          component: PedidosView
        },
        {
          path: '/cupones',
          name: 'cupones',
          meta: { 
            requiredPermission: 'Gestionar Cupones'
          },
          component: CuponesView
        },
        {
          path: '/catalgos-historiales',
          name: 'catalogos historiales',
          meta: { 
            requiredPermission: 'Gestionar Catalogos'
          },
          component: CatalogosHistorialView
        },
        {
          path: '/contactanos-admin',
          name: 'contactanos-admin',
          meta: { 
            requiredPermission: 'Gestionar Usuarios'
          },
          component: ContactanosPanelView
        }
      ]
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: Unauthorized,
      meta: {
        title: 'No Autorizado | Neotech-Bol Bolivia',
        description: 'Acceso denegado a esta página en Neotech-Bol Bolivia.'
      }
    },
    {
      path: '/terminos-condiciones',
      name: 'terminos-condiciones',
      component: TerminosCondiciones,
      meta: {
        title: 'Términos y Condiciones | Neotech-Bol Bolivia',
        description: 'Consulta los términos y condiciones de uso de Neotech-Bol Bolivia.'
      }
    },
    {
      path: '/page401',
      name: 'page401',
      component: Page401,
      meta: {
        title: 'Error 401 | Neotech-Bol Bolivia',
        description: 'Página no encontrada en Neotech-Bol Bolivia. Revisa la URL.'
      }
    },
    {
      path: "/verificacion-pendiente",
      name: "VerificacionPendiente",
      component: () => import("@/views/VerificacionPendiente.vue"),
    },
    {
      path: "/email/verify/:id/:hash",
      name: "VerificarEmail",
      component: () => import("@/views/VerificarEmail.vue"),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/page401'
    }
  ],
})

// Inicializar la aplicación
fetchAuthenticatedUser().then(() => {
  // Configurar el guard de navegación
  router.beforeEach(async (to, from, next) => {
    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    // Obtener el rol y permiso requeridos para la ruta
    const requiredRole = to.meta.requiredRole;
    const requiredPermission = to.meta.requiredPermission;
    
    // Siempre verificar permisos en cada navegación para rutas protegidas
    if (requiresAuth || requiredRole || requiredPermission) {
      // Forzar actualización de permisos en cada navegación a rutas protegidas
      await fetchPermisosUser(true);
      const userRole = await getUserRole();
      
      // Si la ruta requiere autenticación y el usuario no está autenticado
      if (requiresAuth && !userRole) {
        console.log('Redirigiendo a login: usuario no autenticado');
        next({ path: '/login', query: { redirect: to.fullPath } });
        return;
      }
      
      // Verificar rol
      if (requiredRole && userRole !== requiredRole) {
        console.log(`Acceso denegado: Se requiere el rol "${requiredRole}"`);
        next({ path: '/unauthorized' });
        return;
      }
      
      // Verificar permiso
      if (requiredPermission) {
        const hasPermission = await tienePermiso(requiredPermission);
        if (!hasPermission) {
          console.log(`Acceso denegado: Se requiere el permiso "${requiredPermission}"`);
          next({ path: '/unauthorized' });
          return;
        }
      }
    }
    
    // Si todo está bien, permitir acceso a la ruta
    next();
  });
});

// Crear un bus de eventos para actualizar permisos
const permissionBus = {
  // Método para actualizar permisos después de cambios
  refreshPermissions: async () => {
    console.log('Actualizando permisos después de cambios...');
    await fetchPermisosUser(true);
    return authState.userPermisos;
  }
};

// Función para verificar si el usuario tiene acceso a una ruta específica
// Útil para mostrar/ocultar elementos en la interfaz
export async function tieneAccesoARuta(rutaNombre) {
  // Asegurarse de que los permisos estén actualizados
  await fetchPermisosUser();
  
  const ruta = router.options.routes.flatMap(r => 
    r.children ? r.children : [r]
  ).find(r => r.name === rutaNombre);
  
  if (!ruta) return false;
  
  // Verificar rol
  if (ruta.meta?.requiredRole) {
    const userRole = await getUserRole();
    if (userRole !== ruta.meta.requiredRole) {
      return false;
    }
  }
  
  // Verificar permiso
  if (ruta.meta?.requiredPermission) {
    const hasPermission = await tienePermiso(ruta.meta.requiredPermission);
    if (!hasPermission) {
      return false;
    }
  }
  
  return true;
}

// Exportar el bus de eventos junto con el router
export { permissionBus };
export default router;