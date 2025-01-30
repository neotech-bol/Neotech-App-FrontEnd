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
        }
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
      path: '/admin-panel',
      component: LayoutAdmin,
      children: [
        {
          path: '/admin-panel',
          name: 'admin-panel',
          component: HomAdminView
        },
        {
          path: '/usuarios',
          name: 'usuarios',
          component: UsuariosView
        },
        {
          path: '/productos',
          name: 'productos',
          component: ProductosView
        },
        {
          path: '/catalogos',
          name: 'catalogos',
          component: CatalogosView
        },
        {
          path: '/categorias',
          name: 'not-found',
          component: CategoriasView
        },
        {
          path: '/roles',
          name: 'roles',
          component: RolesView
        },
        {
          path: '/pedidos',
          name: 'pedidos',
          component: PedidosView
        }
      ]
    }
  ],
})

export default router
