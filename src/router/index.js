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
import { userAutenticado } from '@/Services/UsuarioService'
import FavoriteView from '@/views/FavoriteView.vue'
import CuponesView from '@/Admin/CuponesView.vue'
import TerminosCondiciones from '@/views/TerminosCondiciones.vue'
import Page401 from '@/views/page401.vue'
import Checkout2 from '@/views/Checkout2.vue'
import CategoriasViewPagina from '@/views/CategoriasViewPagina.vue'
import ProductosHomeView from '@/views/ProductosHomeView.vue'
import Guia from '@/views/Guia.vue'
import Faq from '@/views/faq.vue'
import CatalogosHistorialView from '@/Admin/CatalogosHistorialView.vue'
import CatalogoHistorial from '@/views/CatalogoHistorial.vue'
import CatalogoActivoView from '@/views/CatalogoActivoView.vue'
import ContactanosPanelView from '@/Admin/ContactanosPanelView.vue'

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
          path: '/checkout',
          name: 'checkout',
          component: CheckoutView,
          meta: {
            title: 'Checkout | Neotech-Bol Bolivia',
            description: 'Finaliza tu compra de productos electrónicos en Neotech-Bol de forma rápida y segura.'
          }
        },
        {
          path: '/checkout2',
          name: 'checkout2',
          component: Checkout2,
          meta: {
            title: 'Checkout Alternativo | Neotech-Bol Bolivia',
            description: 'Otra opción para completar tu compra de tecnología en Neotech-Bol Bolivia.'
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
      children: [
        {
          path: '/admin-panel',
          name: 'admin-panel',
          meta: { requiredRole: 'super-admin' },
          component: HomAdminView
        },
        {
          path: '/usuarios',
          name: 'usuarios',
          meta: { requiredRole: 'super-admin' },
          component: UsuariosView
        },
        {
          path: '/productos-admin',
          name: 'productos-admin',
          meta: { requiredRole: 'super-admin' },
          component: ProductosView
        },
        {
          path: '/catalogos',
          name: 'catalogos',
          meta: { requiredRole: 'super-admin' },
          component: CatalogosView
        },
        {
          path: '/categorias-panel',
          name: 'categorias-panel',
          meta: { requiredRole: 'super-admin' },
          component: CategoriasView
        },
        {
          path: '/roles',
          name: 'roles',
          meta: { requiredRole: 'super-admin' },
          component: RolesView
        },
        {
          path: '/pedidos',
          name: 'pedidos',
          meta: { requiredRole: 'super-admin' },
          component: PedidosView
        },
        {
          path: '/cupones',
          name: 'cupones',
          component: CuponesView
        },
        {
          path: '/catalgos-historiales',
          name: 'catalogos historiales',
          component: CatalogosHistorialView
        },
        {
          path: '/contactanos-admin',
          name: 'contactanos-admin',
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
      path: '/:pathMatch(.*)*',
      redirect: '/page401'
    }
  ],
})

let user = null;

const fetchAuthenticatedUser = async () => {
  try {
    const { data } = await userAutenticado();
    console.log('Datos del usuario autenticado:', data);
    if (data && data.datos && data.datos.roles && data.datos.roles.length > 0) {
      user = data.datos.roles[0].name;
      console.log(user);
    } else {
      console.error('No se encontraron roles en los datos del usuario.');
    }
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error);
  }
};

fetchAuthenticatedUser().then(() => {
  router.beforeEach((to, from, next) => {
    const requiredRole = to.meta.requiredRole;
    const userRole = getUserRole();

    if (requiredRole && userRole !== requiredRole) {
      next({ path: '/unauthorized' });
    } else {
      next();
    }
  });
});

function getUserRole() {
  return user;
}

export default router