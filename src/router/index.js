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
import Register2View from '@/views/Auth/Register2View.vue'
import Login2View from '@/views/Auth/Login2View.vue'
import Unauthorized from '@/views/Unauthorized.vue'
import { userAutenticado } from '@/Services/UsuarioService'

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
          component: HomeView
        },
        {
          path: '/nosotros',
          name: 'nosotros',
          component: NosotrosVire
        },
        {
          path: '/contacto',
          name: 'contacto',
          component: ContactoView
        },
        {
          path: "/producto/:idProducto?",
          name: 'producto',
          component: Producto
        },
        {
          path: '/checkout',
          name: 'checkout',
          component: CheckoutView
        },
        {
          path: '/carrito',
          name: 'carrito',
          component: CartView
        },  
        {
          path: '/perfil',
          name: 'perfil',
          component: PerfilView
        },
      ],

    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login2',
      name: 'login2',
      component: Login2View
    },
    {
      path: '/register2',
      name: 'register2',
      component: Register2View
    },
    {
      path: '/admin-panel',
      component: LayoutAdmin,
      children: [
        {
          path: '/admin-panel',
          name: 'admin-panel',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: HomAdminView
        },
        {
          path: '/usuarios',
          name: 'usuarios',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: UsuariosView
        },
        {
          path: '/productos',
          name: 'productos',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: ProductosView
        },
        {
          path: '/catalogos',
          name: 'catalogos',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: CatalogosView
        },
        {
          path: '/categorias',
          name: 'not-found',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: CategoriasView
        },
        {
          path: '/roles',
          name: 'roles',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: RolesView
        },
        {
          path: '/pedidos',
          name: 'pedidos',
          meta: { requiredRole: 'super-admin' }, // Solo accesible por usuarios con rol 'admin'
          component: PedidosView
        }
      ]
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: Unauthorized
    }
  ],
})
let user = null;
// Función para obtener el usuario autenticado
const fetchAuthenticatedUser  = async () => {
  try {
      const { data } = await userAutenticado();
      console.log('Datos del usuario autenticado:', data);
      
      // Asegúrate de que la estructura de data sea la esperada
      if (data && data.datos && data.datos.roles && data.datos.roles.length > 0) {
          user = data.datos.roles[0].name; // Asigna el nombre del rol a la variable user
          console.log(user);
      } else {
          console.error('No se encontraron roles en los datos del usuario.');
      }
  } catch (error) {
      console.error('Error al obtener el usuario autenticado:', error);
  }
};
// Llama a la función para obtener el usuario autenticado al cargar la aplicación
fetchAuthenticatedUser ();
function getUserRole() {
    return user; // Devuelve el rol del usuario o null si no está definido
}

// Guardia de navegación
router.beforeEach((to, from, next) => {
    const requiredRole = to.meta.requiredRole; // Rol requerido para la ruta
    const userRole = getUserRole(); // Obtener el rol del usuario

    if (requiredRole && userRole !== requiredRole) {
        // Si el usuario no tiene el rol requerido, redirigir a una página de acceso denegado o a la página de inicio
        next({ path: '/unauthorized' }); // Cambia '/unauthorized' a la ruta que desees
    } else {
        next(); // Permitir el acceso a la ruta
    }
});
export default router

