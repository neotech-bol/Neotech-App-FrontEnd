<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div
        class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">Gestión de Productos</h2>
        <div>
          <button class="btn btn-primary me-2" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Producto
          </button>
          <button class="btn btn-info" @click="mostrarDatosPrueba()">
            <i class="fas fa-eye me-2"></i>Ver Datos de Prueba
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="row g-2">
            <div class="col-md-8">
              <div class="input-group mb-3">
                <span class="input-group-text bg-light">
                  <i class="fas fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Buscar producto..." v-model="search"
                  @input="filtrarProductos">
              </div>
            </div>
            <div class="col-md-4">
              <div class="input-group mb-3">
                <span class="input-group-text bg-light">
                  <i class="fas fa-filter"></i>
                </span>
                <select class="form-select" v-model="categoriaSeleccionada" @change="filtrarPorCategoria">
                  <option value="">Todas las categorías</option>
                  <option :value="item.id" v-for="item in categorias" :key="item.id">
                    {{ item.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Table for larger screens -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr class="text-center">
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Precio Preventa</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in productos" :key="item.id" class="text-center">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ formatearPrecio(item.precio) }}</td>
                <td>{{ item.precio_preventa ? formatearPrecio(item.precio_preventa) : 'N/A' }}</td>
                <td>{{ item.categoria?.nombre || 'N/A' }}</td>
                <td>{{ item.cantidad || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="mostrarProducto(item.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="verDetalles(item.id)">
                      <i class="fas fa-info-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards for mobile view - Enhanced with better responsive design -->
        <div class="d-md-none">
          <div v-for="item in productos" :key="item.id" class="card product-card mb-3 mx-3">
            <div class="card-body">
              <h5 class="card-title text-truncate">{{ item.nombre }}</h5>
              <div class="product-info">
                <div class="product-detail">
                  <strong>Precio:</strong> {{ formatearPrecio(item.precio) }}
                </div>
                <div class="product-detail">
                  <strong>Precio Preventa:</strong> {{ item.precio_preventa ? formatearPrecio(item.precio_preventa) : 'N/A' }}
                </div>
                <div class="product-detail">
                  <strong>Categoría:</strong> {{ item.categoria?.nombre || 'N/A' }}
                </div>
                <div class="product-detail">
                  <strong>Stock:</strong> {{ item.cantidad || 'N/A' }}
                </div>
                <div class="product-detail">
                  <strong>Estado:</strong>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-sm btn-outline-primary action-btn" @click="mostrarProducto(item.id)">
                  <i class="fas fa-edit me-1"></i>Editar
                </button>
                <button class="btn btn-sm btn-outline-info action-btn" @click="verDetalles(item.id)">
                  <i class="fas fa-info-circle me-1"></i>Detalles
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination - Enhanced with better responsive design -->
        <div class="d-flex justify-content-center my-4" v-if="pagination && pagination.last_page > 1">
          <nav aria-label="Navegación de productos" class="pagination-container">
            <ul class="pagination pagination-sm flex-wrap">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" href="#" @click.prevent="cambiarPagina(1)" aria-label="Primera página">
                  <i class="fas fa-angle-double-left"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" href="#" @click.prevent="cambiarPagina(pagination.current_page - 1)" aria-label="Página anterior">
                  <i class="fas fa-angle-left"></i>
                </a>
              </li>
              
              <li class="page-item" v-for="page in paginationRange" :key="page" 
                  :class="{ active: pagination.current_page === page }">
                <a class="page-link" href="#" @click.prevent="cambiarPagina(page)">{{ page }}</a>
              </li>
              
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="cambiarPagina(pagination.current_page + 1)" aria-label="Página siguiente">
                  <i class="fas fa-angle-right"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="cambiarPagina(pagination.last_page)" aria-label="Última página">
                  <i class="fas fa-angle-double-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar producto -->
    <div class="modal fade" id="productoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title">{{ posicion ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Alerta de campos requeridos -->
            <div class="alert alert-info mb-4" role="alert">
              <div class="d-flex">
                <div class="me-3">
                  <i class="fas fa-info-circle fa-2x"></i>
                </div>
                <div>
                  <h5 class="alert-heading">Información importante</h5>
                  <p class="mb-0">Los campos marcados con <span class="text-danger fw-bold">*</span> son obligatorios.
                  </p>
                </div>
              </div>
            </div>

            <form @submit.prevent="guardarProducto" id="productoForm" class="needs-validation" novalidate>
              <div class="row g-3">
                <!-- Información básica -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10">
                      <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i>Información básica
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label for="nombre" class="form-label fw-bold">Nombre <span
                              class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-tag"></i></span>
                            <input type="text" class="form-control" :class="{ 'is-invalid': errors.nombre }" id="nombre"
                              v-model="formulario.nombre" placeholder="Ej: Motocicleta eléctrica" required>
                            <div class="invalid-feedback" v-if="errors.nombre">
                              {{ errors.nombre[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              El nombre del producto es obligatorio
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label for="precio" class="form-label fw-bold">Precio <span
                              class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                            <input type="number" class="form-control" :class="{ 'is-invalid': errors.precio }"
                              id="precio" v-model="formulario.precio" placeholder="Ej: 2500.00" min="0.01" step="0.01"
                              required>
                            <div class="invalid-feedback" v-if="errors.precio">
                              {{ errors.precio[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              El precio del producto es obligatorio
                            </div>
                          </div>
                          <small class="text-muted">Ingrese el precio en bolivianos (BOB)</small>
                        </div>
                        <div class="col-md-6">
                          <label for="precio_preventa" class="form-label fw-bold">Precio Preventa</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                            <input type="number" class="form-control" :class="{ 'is-invalid': errors.precio_preventa }"
                              id="precio_preventa" v-model="formulario.precio_preventa" placeholder="Ej: 2000.00" min="0.01" step="0.01">
                            <div class="invalid-feedback" v-if="errors.precio_preventa">
                              {{ errors.precio_preventa[0] }}
                            </div>
                          </div>
                          <small class="text-muted">Ingrese el precio de preventa en bolivianos (BOB)</small>
                        </div>
                        <div class="col-md-6">
                          <label for="categoria" class="form-label fw-bold">Categoría</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-folder"></i></span>
                            <select class="form-select" id="categoria" v-model="formulario.categoria_id">
                              <option value="">Seleccione una categoría</option>
                              <option :value="item.id" v-for="item in categorias" :key="item.id">
                                {{ item.nombre }}
                              </option>
                            </select>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label for="cantidad" class="form-label fw-bold">Cantidad</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-boxes"></i></span>
                            <input type="number" class="form-control" id="cantidad" v-model="formulario.cantidad"
                              min="0" placeholder="Ej: 50">
                          </div>
                        </div>
                        <div class="col-12">
                          <label for="descripcion" class="form-label fw-bold">Descripción</label>
                          <textarea class="form-control" id="descripcion" v-model="formulario.descripcion" rows="3"
                            placeholder="Describa el producto..."></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cantidades -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10">
                      <h5 class="mb-0">
                        <i class="fas fa-sort-numeric-up-alt me-2"></i>Cantidades
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label for="cantidad_minima" class="form-label fw-bold">Cantidad Mínima <span
                              class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-arrow-down"></i></span>
                            <input type="number" class="form-control" :class="{ 'is-invalid': errors.cantidad_minima }"
                              id="cantidad_minima" v-model="formulario.cantidad_minima" min="1" placeholder="Ej: 10"
                              required>
                            <div class="invalid-feedback" v-if="errors.cantidad_minima">
                              {{ errors.cantidad_minima[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              La cantidad mínima es obligatoria
                            </div>
                          </div>
                          <small class="text-muted">Cantidad mínima que se puede comprar</small>
                        </div>
                        <div class="col-md-6">
                          <label for="cantidad_maxima" class="form-label fw-bold">Cantidad Máxima <span
                              class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-arrow-up"></i></span>
                            <input type="number" class="form-control" :class="{ 'is-invalid': errors.cantidad_maxima }"
                              id="cantidad_maxima" v-model="formulario.cantidad_maxima" min="1" placeholder="Ej: 100"
                              required>
                            <div class="invalid-feedback" v-if="errors.cantidad_maxima">
                              {{ errors.cantidad_maxima[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              La cantidad máxima es obligatoria
                            </div>
                          </div>
                          <small class="text-muted">Cantidad máxima que se puede comprar</small>
                        </div>
                        <div class="col-md-6">
                          <label for="cantidad_minima_preventa" class="form-label fw-bold">Cantidad Mínima Preventa</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-arrow-down"></i></span>
                            <input type="number" class="form-control" :class="{ 'is-invalid': errors.cantidad_minima_preventa }"
                              id="cantidad_minima_preventa" v-model="formulario.cantidad_minima_preventa" min="1" placeholder="Ej: 5">
                            <div class="invalid-feedback" v-if="errors.cantidad_minima_preventa">
                              {{ errors.cantidad_minima_preventa[0] }}
                            </div>
                          </div>
                          <small class="text-muted">Cantidad mínima para precio de preventa</small>
                        </div>
                        <div class="col-md-6">
                          <label for="cantidad_maxima_preventa" class="form-label fw-bold">Cantidad Máxima Preventa</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-arrow-up"></i></span>
                            <input type="number" class="form-control" :class="{ 'is-invalid': errors.cantidad_maxima_preventa }"
                              id="cantidad_maxima_preventa" v-model="formulario.cantidad_maxima_preventa" min="1" placeholder="Ej: 50">
                            <div class="invalid-feedback" v-if="errors.cantidad_maxima_preventa">
                              {{ errors.cantidad_maxima_preventa[0] }}
                            </div>
                          </div>
                          <small class="text-muted">Cantidad máxima para precio de preventa</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Imagen principal -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10">
                      <h5 class="mb-0">
                        <i class="fas fa-image me-2"></i>Imagen Principal
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-8">
                          <label for="imagen_principal" class="form-label fw-bold">
                            Seleccionar imagen 
                            <span class="text-danger" v-if="!posicion">*</span>
                            <small v-if="posicion" class="text-muted">(Opcional para edición)</small>
                          </label>
                          <div class="input-group mb-3">
                            <span class="input-group-text"><i class="fas fa-upload"></i></span>
                            <input type="file" class="form-control" id="imagen_principal"
                              @change="obtenerImagen($event)" accept="image/*"
                              :class="{ 'is-invalid': errors.imagen_principal }"
                              :required="!posicion">
                            <div class="invalid-feedback" v-if="errors.imagen_principal">
                              {{ errors.imagen_principal[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              La imagen principal es obligatoria
                            </div>
                          </div>
                          <small class="text-muted">Formatos recomendados: JPG, PNG. Tamaño máximo: 2MB</small>
                        </div>
                        <div class="col-md-4 text-center">
                          <div v-if="imagenPreview" class="border p-2 rounded bg-white">
                            <img :src="imagenPreview" alt="Vista previa" class="img-fluid" style="max-height: 150px;">
                          </div>
                          <div v-else
                            class="border p-2 rounded bg-white d-flex align-items-center justify-content-center"
                            style="height: 150px;">
                            <span class="text-muted">Vista previa no disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Características -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">
                        <i class="fas fa-list-ul me-2"></i>Características <span class="text-danger">*</span>
                      </h5>
                      <button type="button" class="btn btn-sm btn-primary" @click="agregarCaracteristica">
                        <i class="fas fa-plus me-1"></i>Agregar
                      </button>
                    </div>
                    <div class="card-body">
                      <div :class="{ 'is-invalid': errors.caracteristicas && formulario.caracteristicas.length === 0 }">
                        <div v-if="formulario.caracteristicas.length === 0"
                          class="text-center py-3 border rounded mb-3 bg-white">
                          <i class="fas fa-info-circle text-muted me-2"></i>
                          <span class="text-muted">No hay características agregadas. Haga clic en "Agregar" para añadir
                            características.</span>
                        </div>
                        <div v-for="(caracteristica, index) in formulario.caracteristicas" :key="index" class="mb-2">
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-check"></i></span>
                            <input type="text" class="form-control" v-model="formulario.caracteristicas[index]"
                              placeholder="Ej: Batería de larga duración" required>
                            <button type="button" class="btn btn-outline-danger" @click="eliminarCaracteristica(index)">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="invalid-feedback d-block" v-if="errors.caracteristicas">
                        {{ errors.caracteristicas[0] }}
                      </div>
                      <small class="text-muted">Agregue las características principales del producto</small>
                    </div>
                  </div>
                </div>

                <!-- Modelos -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">
                        <i class="fas fa-cubes me-2"></i>Modelos
                      </h5>
                      <button type="button" class="btn btn-sm btn-primary" @click="agregarModelo">
                        <i class="fas fa-plus me-1"></i>Agregar
                      </button>
                    </div>
                    <div class="card-body">
                     <!--  <div :class="{ 'is-invalid': errors.modelos && formulario.modelos.length === 0 }"> -->
                        <div v-if="formulario.modelos.length === 0"
                          class="text-center py-3 border rounded mb-3 bg-white">
                          <i class="fas fa-info-circle text-muted me-2"></i>
                          <span class="text-muted">No hay modelos agregados. Haga clic en "Agregar" para añadir
                            modelos.</span>
                        </div>
                        <div v-for="(modelo, index) in formulario.modelos" :key="index" class="card mb-3 border">
                          <div class="card-header bg-white d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">Modelo {{ index + 1 }}</h6>
                            <button type="button" class="btn btn-sm btn-outline-danger" @click="eliminarModelo(index)">
                              <i class="fas fa-trash-alt me-1"></i>Eliminar
                            </button>
                          </div>
                          <div class="card-body">
                            <div class="row g-2">
                              <div class="col-md-6">
                                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" v-model="modelo.nombre"
                                  placeholder="Ej: Exclusive" required>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Precio <span class="text-danger">*</span></label>
                                <div class="input-group">
                                  <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                                  <input type="number" class="form-control" v-model="modelo.precio"
                                    placeholder="Ej: 3000.00" min="0.01" step="0.01" required>
                                </div>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Precio Preventa</label>
                                <div class="input-group">
                                  <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                                  <input type="number" class="form-control" v-model="modelo.precio_preventa"
                                    placeholder="Ej: 2500.00" min="0.01" step="0.01">
                                </div>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Cantidad mínima <span class="text-danger">*</span></label>
                                <input type="number" class="form-control" v-model="modelo.cantidad_minima"
                                  placeholder="Ej: 20" min="1" required>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Cantidad máxima <span class="text-danger">*</span></label>
                                <input type="number" class="form-control" v-model="modelo.cantidad_maxima"
                                  placeholder="Ej: 200" min="1" required>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Cantidad mínima preventa</label>
                                <input type="number" class="form-control" v-model="modelo.cantidad_minima_preventa"
                                  placeholder="Ej: 10" min="1">
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Cantidad máxima preventa</label>
                                <input type="number" class="form-control" v-model="modelo.cantidad_maxima_preventa"
                                  placeholder="Ej: 100" min="1">
                              </div>
                            </div>
                          </div>
                        </div>
                      <!-- </div> -->
                    <!--   <div class="invalid-feedback d-block" v-if="errors.modelos">
                        {{ errors.modelos[0] }}
                      </div> -->
                      <small class="text-muted">Agregue los diferentes modelos o variantes del producto</small>
                    </div>
                  </div>
                </div>

                <!-- Imágenes Adicionales -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">
                        <i class="fas fa-images me-2"></i>Imágenes Adicionales <span class="text-danger">*</span>
                      </h5>
                      <button type="button" class="btn btn-sm btn-primary" @click="agregarImagen">
                        <i class="fas fa-plus me-1"></i>Agregar
                      </button>
                    </div>
                    <div class="card-body">
                      <div :class="{ 'is-invalid': errors.images && formulario.images.length === 0 }">
                        <div v-if="formulario.images.length === 0"
                          class="text-center py-3 border rounded mb-3 bg-white">
                          <i class="fas fa-info-circle text-muted me-2"></i>
                          <span class="text-muted">No hay imágenes adicionales. Haga clic en "Agregar" para añadir
                            imágenes.</span>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-4 col-sm-6" v-for="(imagen, index) in formulario.images" :key="index">
                            <div class="card h-100 border">
                              <div class="card-header bg-white">
                                <h6 class="mb-0">Imagen {{ index + 1 }}</h6>
                              </div>
                              <div class="card-body">
                                <div class="mb-3">
                                  <label class="form-label">
                                    Archivo 
                                    <span class="text-danger" v-if="!imagen.id">*</span>
                                    <small v-if="imagen.id" class="text-muted">(Opcional para edición)</small>
                                  </label>
                                  <input type="file" class="form-control"
                                    @change="(event) => handleFileUpload(event, index)" accept="image/*"
                                    :required="!imagen.preview && !imagen.id">
                                </div>
                                <div class="mb-3">
                                  <!-- Color field is optional -->
                                  <label :for="'color-' + index" class="form-label">Color</label>
                                  <div class="d-flex gap-2">
                                    <input type="color" class="form-control form-control-color" :id="'color-' + index"
                                      v-model="imagen.color">
                                    <span class="form-control">{{ imagen.color || 'Sin color' }}</span>
                                  </div>
                                </div>
                                <div class="text-center mb-3">
                                  <div v-if="imagen.preview" class="border p-2 rounded bg-white">
                                    <img :src="imagen.preview" class="img-fluid rounded" alt="Preview"
                                      style="max-height: 120px;">
                                  </div>
                                  <div v-else
                                    class="border p-2 rounded bg-white d-flex align-items-center justify-content-center"
                                    style="height: 120px;">
                                    <span class="text-muted">Sin imagen</span>
                                  </div>
                                </div>
                                <button type="button" class="btn btn-outline-danger btn-sm w-100"
                                  @click="eliminarImagen(index)">
                                  <i class="fas fa-trash-alt me-1"></i> Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="invalid-feedback d-block" v-if="errors.images">
                        {{ errors.images[0] }}
                      </div>
                      <small class="text-muted mt-2 d-block">Agregue imágenes adicionales del producto. El color es opcional.</small>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <div class="d-flex justify-content-between w-100">
              <div>
                <span v-if="Object.keys(errors).length > 0" class="text-danger">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  Por favor, corrija los errores en el formulario
                </span>
              </div>
              <div>
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                  <i class="fas fa-times me-1"></i>Cancelar
                </button>
                <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'"
                  @click="validarYGuardar">
                  <i class="fas" :class="posicion ? 'fa-save me-1' : 'fa-plus me-1'"></i>
                  {{ posicion ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del producto - Mejorado con diseño responsive para productos similares -->
    <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info bg-opacity-10">
            <h5 class="modal-title">Detalles del Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="productoSeleccionado">
            <div class="row">
              <div class="col-md-6">
                <img :src="productoSeleccionado.imagen_principal" alt="Imagen principal" class="img-fluid rounded mb-3 product-main-image">
              </div>
              <div class="col-md-6">
                <h4 class="product-title">{{ productoSeleccionado.nombre }}</h4>
                <p><strong>Precio:</strong> {{ formatearPrecio(productoSeleccionado.precio) }}</p>
                <p v-if="productoSeleccionado.precio_preventa"><strong>Precio Preventa:</strong> {{ formatearPrecio(productoSeleccionado.precio_preventa) }}</p>
                <p><strong>Categoría:</strong> {{ productoSeleccionado.categoria?.nombre || 'N/A' }}</p>
                <p><strong>Descripción:</strong> {{ productoSeleccionado.descripcion || 'N/A' }}</p>
                <p><strong>Cantidad Mínima:</strong> {{ productoSeleccionado.cantidad_minima }}</p>
                <p><strong>Cantidad Máxima:</strong> {{ productoSeleccionado.cantidad_maxima }}</p>
                <p v-if="productoSeleccionado.cantidad_minima_preventa"><strong>Cantidad Mínima Preventa:</strong> {{ productoSeleccionado.cantidad_minima_preventa }}</p>
                <p v-if="productoSeleccionado.cantidad_maxima_preventa"><strong>Cantidad Máxima Preventa:</strong> {{ productoSeleccionado.cantidad_maxima_preventa }}</p>
                <p><strong>Estado:</strong>
                  <span class="badge" :class="productoSeleccionado.estado ? 'bg-success' : 'bg-danger'">
                    {{ productoSeleccionado.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>
            </div>
            
            <!-- Características con opción de "Ver más" -->
            <div class="features-section mt-4">
              <h5 class="section-title">Características</h5>
              <ul class="features-list">
                <li v-for="(caracteristica, index) in visibleCaracteristicas" :key="index" class="feature-item">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  {{ caracteristica.caracteristica }}
                </li>
              </ul>
              <button v-if="productoSeleccionado.caracteristicas && productoSeleccionado.caracteristicas.length > 5" 
                      @click="toggleCaracteristicas" 
                      class="btn btn-sm btn-outline-primary mt-2">
                <i class="fas" :class="mostrarTodasCaracteristicas ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                {{ mostrarTodasCaracteristicas ? 'Ver menos' : 'Ver más' }}
              </button>
            </div>
            
            <h5 class="section-title mt-4">Modelos</h5>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Precio Preventa</th>
                    <th>Cantidad Mínima</th>
                    <th>Cantidad Máxima</th>
                    <th>Mín. Preventa</th>
                    <th>Máx. Preventa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="modelo in productoSeleccionado.modelos" :key="modelo.id">
                    <td>{{ modelo.nombre }}</td>
                    <td>{{ formatearPrecio(modelo.precio) }}</td>
                    <td>{{ modelo.precio_preventa ? formatearPrecio(modelo.precio_preventa) : 'N/A' }}</td>
                    <td>{{ modelo.cantidad_minima }}</td>
                    <td>{{ modelo.cantidad_maxima }}</td>
                    <td>{{ modelo.cantidad_minima_preventa || 'N/A' }}</td>
                    <td>{{ modelo.cantidad_maxima_preventa || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Productos Similares - Sección mejorada con diseño responsive -->
            <h5 class="section-title mt-4">Imágenes Adicionales</h5>
            <div class="similar-products-container">
              <div class="row g-3">
                <div class="col-6 col-sm-4 col-md-4 col-lg-3" v-for="imagen in productoSeleccionado.images" :key="imagen.id">
                  <div class="similar-product-card">
                    <div class="similar-product-image">
                      <img :src="imagen.imagen" class="img-fluid rounded" :alt="productoSeleccionado.nombre">
                    </div>
                    <div class="similar-product-info">
                      <p class="similar-product-color" v-if="imagen.color">
                        <span class="color-dot" :style="{ backgroundColor: imagen.color }"></span>
                        {{ imagen.color }}
                      </p>
                      <p class="similar-product-color" v-else>Sin color especificado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { indexProductos, indexProductosFiltrados, showProducto, storeProducto, updateProducto, deleteImage } from '@/Services/ProductoService';
import { indexActivosCategorias } from '@/Services/CategoriaService';

const productos = ref([]);
const categorias = ref([]);
const search = ref('');
const categoriaSeleccionada = ref('');
const posicion = ref('');
const formulario = ref({
  nombre: '',
  precio: '',
  precio_preventa: '',
  categoria_id: '',
  descripcion: '',
  cantidad: '',
  cantidad_minima: '',
  cantidad_maxima: '',
  cantidad_minima_preventa: '',
  cantidad_maxima_preventa: '',
  imagen_principal: '',
  caracteristicas: [],
  modelos: [],
  images: []
});
const errors = ref({});
const imagenPreview = ref('');
const productoSeleccionado = ref(null);
const formValidado = ref(false);
const currentPage = ref(1);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
});

// Variables para la funcionalidad "Ver más" en características
const mostrarTodasCaracteristicas = ref(false);

let productoModal = null;
let detallesModal = null;

onMounted(() => {
  productoModal = new Modal(document.getElementById('productoModal'));
  detallesModal = new Modal(document.getElementById('detallesModal'));
  listarProductos();
  listarCategorias();
});

// Computed para mostrar características limitadas o todas
const visibleCaracteristicas = computed(() => {
  if (!productoSeleccionado.value || !productoSeleccionado.value.caracteristicas) {
    return [];
  }
  
  if (mostrarTodasCaracteristicas.value) {
    return productoSeleccionado.value.caracteristicas;
  } else {
    return productoSeleccionado.value.caracteristicas.slice(0, 5);
  }
});

// Función para alternar la visualización de características
const toggleCaracteristicas = () => {
  mostrarTodasCaracteristicas.value = !mostrarTodasCaracteristicas.value;
};

const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  const startPage = Math.max(1, pagination.value.current_page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(pagination.value.last_page, startPage + maxVisiblePages - 1);
  
  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }
  
  return range;
});

const obtenerImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    formulario.value.imagen_principal = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagenPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    // Si no hay archivo seleccionado y estamos en modo edición, mantener la imagen existente
    if (!posicion.value) {
      imagenPreview.value = '';
    }
  }
};

const abrirModal = () => {
  posicion.value = '';
  formulario.value = {
    nombre: '',
    precio: '',
    precio_preventa: '',
    categoria_id: '',
    descripcion: '',
    cantidad: '',
    cantidad_minima: '',
    cantidad_maxima: '',
    cantidad_minima_preventa: '',
    cantidad_maxima_preventa: '',
    imagen_principal: '',
    caracteristicas: [],
    modelos: [],
    images: []
  };
  imagenPreview.value = '';
  errors.value = {};
  formValidado.value = false;
  productoModal.show();
};

const listarProductos = async () => {
  try {
    const response = await indexProductos(currentPage.value);
    if (response && response.data) {
      productos.value = response.data.datos || [];
      // Check if pagination data exists before assigning
      if (response.data.pagination) {
        pagination.value = response.data.pagination;
      } else {
        console.warn('Pagination data not found in API response');
      }
    }
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
};

const cambiarPagina = async (page) => {
  if (page < 1 || page > pagination.value.last_page) return;
  
  currentPage.value = page;
  
  try {
    if (search.value.length >= 2 || categoriaSeleccionada.value) {
      const response = await indexProductosFiltrados(categoriaSeleccionada.value, search.value, page);
      if (response && response.data) {
        productos.value = response.data.datos || [];
        if (response.data.pagination) {
          pagination.value = response.data.pagination;
        }
      }
    } else {
      await listarProductos();
    }
  } catch (error) {
    console.error('Error al cambiar de página:', error);
  }
};

const listarCategorias = async () => {
  try {
    const { data } = await indexActivosCategorias();
    categorias.value = data.datos;
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

const filtrarProductos = async () => {
  try {
    // Si el término de búsqueda tiene al menos 2 caracteres, buscar en el servidor
    if (search.value.length >= 2 || categoriaSeleccionada.value) {
      currentPage.value = 1; // Resetear a la primera página al filtrar
      const response = await indexProductosFiltrados(categoriaSeleccionada.value, search.value, currentPage.value);
      if (response && response.data) {
        productos.value = response.data.datos || [];
        // Check if pagination data exists before assigning
        if (response.data.pagination) {
          pagination.value = response.data.pagination;
        }
      }
    } else if (search.value.length === 0 && !categoriaSeleccionada.value) {
      // Si se borró la búsqueda y no hay categoría seleccionada, volver a cargar todos los productos
      currentPage.value = 1;
      await listarProductos();
    }
  } catch (error) {
    console.error('Error al filtrar productos:', error);
  }
};

const filtrarPorCategoria = async () => {
  try {
    currentPage.value = 1; // Resetear a la primera página al cambiar categoría
    await filtrarProductos();
  } catch (error) {
    console.error('Error al filtrar por categoría:', error);
  }
};

const validarFormulario = () => {
  // Validar campos requeridos
  const form = document.getElementById('productoForm');
  formValidado.value = true;

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }

  // Validaciones adicionales
  let esValido = true;
  errors.value = {};

  if (!formulario.value.nombre) {
    errors.value.nombre = ['El campo nombre es obligatorio.'];
    esValido = false;
  }

  if (!formulario.value.precio) {
    errors.value.precio = ['El campo precio es obligatorio.'];
    esValido = false;
  }

  if (!formulario.value.cantidad_minima) {
    errors.value.cantidad_minima = ['El campo cantidad minima es obligatorio.'];
    esValido = false;
  }

  if (!formulario.value.cantidad_maxima) {
    errors.value.cantidad_maxima = ['El campo cantidad maxima es obligatorio.'];
    esValido = false;
  }

  if (formulario.value.caracteristicas.length === 0) {
    errors.value.caracteristicas = ['El campo caracteristicas es obligatorio.'];
    esValido = false;
  }

/*   if (formulario.value.modelos.length === 0) {
    errors.value.modelos = ['El campo modelos es obligatorio.'];
    esValido = false;
  }  */

  if (formulario.value.images.length === 0 && !posicion.value) {
    errors.value.images = ['El campo images es obligatorio.'];
    esValido = false;
  }

  // Validar imagen principal solo para nuevos productos
  if (!posicion.value && !formulario.value.imagen_principal) {
    errors.value.imagen_principal = ['La imagen principal es obligatoria para nuevos productos.'];
    esValido = false;
  }

  return esValido;
};

const validarYGuardar = () => {
  if (validarFormulario()) {
    guardarProducto();
  } else {
    // Scroll al primer error
    setTimeout(() => {
      const primerError = document.querySelector('.is-invalid');
      if (primerError) {
        primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
};

const guardarProducto = async () => {
  try {
    const formData = new FormData();
    
    // Agregar campos básicos (mantener igual)
    Object.keys(formulario.value).forEach(key => {
      if (formulario.value[key] !== '' && key !== 'images' && key !== 'caracteristicas' && key !== 'modelos') {
        formData.append(key, formulario.value[key]);
      }
    });

    // Agregar características (mantener igual)
    formulario.value.caracteristicas.forEach((caracteristica, index) => {
      formData.append(`caracteristicas[${index}]`, caracteristica);
    });

    // Agregar modelos (mantener igual)
    formulario.value.modelos.forEach((modelo, index) => {
      Object.keys(modelo).forEach(key => {
        formData.append(`modelos[${index}][${key}]`, modelo[key]);
      });
    });

    // PARTE MODIFICADA: Manejo de imágenes existentes y nuevas
    let hasNewImages = false;
    
    // Primero procesar imágenes existentes
    formulario.value.images.forEach((imagen, index) => {
      if (imagen.id) {
        // Esta es una imagen existente
        formData.append(`existing_images[${imagen.id}]`, imagen.id);
        if (imagen.color) {
          formData.append(`existing_colors[${imagen.id}]`, imagen.color);
        }
        
        // Si hay un nuevo archivo para esta imagen existente
        if (imagen.file) {
          formData.append(`existing_images_files[${imagen.id}]`, imagen.file);
        }
      } else if (imagen.file) {
        // Esta es una imagen nueva
        hasNewImages = true;
        formData.append(`images[${index}]`, imagen.file);
        if (imagen.color) {
          formData.append(`colors[${index}]`, imagen.color);
        }
      }
    });

    // Si estamos en modo edición pero no hay imágenes nuevas
    if (posicion.value && !hasNewImages && formulario.value.images.length > 0) {
      formData.append('has_existing_images', 'true');
    }

    // Manejar imagen principal (mantener igual)
    if (posicion.value && typeof formulario.value.imagen_principal === 'string' && formulario.value.imagen_principal.startsWith('http')) {
      formData.append('mantener_imagen_principal', 'true');
      const nombreArchivo = formulario.value.imagen_principal.split('/').pop();
      formData.append('imagen_principal_actual', nombreArchivo);
    }

    // Resto del código igual...
    if (posicion.value) {
      formData.append('_method', 'PUT');
      await updateProducto(posicion.value, formData);
    } else {
      await storeProducto(formData);
    }
    
    await listarProductos();
    productoModal.hide();
    alert(posicion.value ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
  } catch (error) {
    // Manejo de errores (mantener igual)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
      setTimeout(() => {
        const primerError = document.querySelector('.is-invalid');
        if (primerError) {
          primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto. Intente nuevamente.');
    }
  }
};

const mostrarProducto = async (id) => {
  try {
    const { data } = await showProducto(id);
    console.log('Datos del producto:', data);
    
    formulario.value = {
      nombre: data.dato.nombre,
      precio: data.dato.precio,
      precio_preventa: data.dato.precio_preventa,
      categoria_id: data.dato.categoria_id,
      descripcion: data.dato.descripcion,
      cantidad: data.dato.cantidad,
      cantidad_minima: data.dato.cantidad_minima,
      cantidad_maxima: data.dato.cantidad_maxima,
      cantidad_minima_preventa: data.dato.cantidad_minima_preventa,
      cantidad_maxima_preventa: data.dato.cantidad_maxima_preventa,
      imagen_principal: data.dato.imagen_principal, // Guardar la URL completa
      caracteristicas: data.dato.caracteristicas.map(c => c.caracteristica),
      modelos: data.dato.modelos.map(m => ({
        ...m,
        precio_preventa: m.precio_preventa || '',
        cantidad_minima_preventa: m.cantidad_minima_preventa || '',
        cantidad_maxima_preventa: m.cantidad_maxima_preventa || ''
      })),
      images: data.dato.images.map(img => ({
        id: img.id,
        preview: img.imagen,
        color: img.color || '',
        file: null
      }))
    };
    
    imagenPreview.value = data.dato.imagen_principal;
    posicion.value = id;
    errors.value = {};
    formValidado.value = false;
    productoModal.show();
  } catch (error) {
    console.error('Error al obtener producto:', error);
    alert('Error al cargar el producto. Intente nuevamente.');
  }
};

const verDetalles = async (id) => {
  try {
    const { data } = await showProducto(id);
    productoSeleccionado.value = data.dato;
    mostrarTodasCaracteristicas.value = false; // Resetear el estado de "Ver más"
    console.log('Detalles del producto:', productoSeleccionado.value);
    detallesModal.show();
  } catch (error) {
    console.log(error);
    alert('Error al cargar los detalles del producto. Intente nuevamente.');
  }
};

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(precio);
};

const agregarCaracteristica = () => {
  formulario.value.caracteristicas.push('');
};

const eliminarCaracteristica = (index) => {
  formulario.value.caracteristicas.splice(index, 1);
};

const agregarModelo = () => {
  formulario.value.modelos.push({
    nombre: '',
    precio: '',
    precio_preventa: '',
    cantidad_minima: '',
    cantidad_maxima: '',
    cantidad_minima_preventa: '',
    cantidad_maxima_preventa: ''
  });
};

const eliminarModelo = (index) => {
  formulario.value.modelos.splice(index, 1);
};

const agregarImagen = () => {
  formulario.value.images.push({
    file: null,
    preview: '',
    color: '' // Inicializado como cadena vacía para que sea opcional
  });
};

const eliminarImagen = async (index) => {
  const imagen = formulario.value.images[index];
  if (imagen.id && posicion.value) {
    try {
      await deleteImage(posicion.value, imagen.id);
      console.log(`Imagen ${imagen.id} eliminada correctamente`);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  }
  formulario.value.images.splice(index, 1);
};

const handleFileUpload = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    formulario.value.images[index].file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      formulario.value.images[index].preview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const mostrarDatosPrueba = () => {
  const datosPrueba = {
    mensaje: 'Producto cargado correctamente',
    dato: {
      id: 1,
      categoria_id: 1,
      user_id: 1,
      nombre: 'Motocicleta electrica',
      descripcion: null,
      precio: '2500.00',
      precio_preventa: '2000.00',
      estado: 1,
      cantidad: 0,
      imagen_principal: 'http://neotechbol.test/images/imagenes_principales/01a0cb6696e17c86fb70b669472b61f9.jpeg',
      cantidad_minima: 10,
      cantidad_maxima: 100,
      cantidad_minima_preventa: 5,
      cantidad_maxima_preventa: 50,
      created_at: '2025-02-28T06:40:55.000000Z',
      updated_at: '2025-02-28T06:40:55.000000Z',
      images: [
        {
          id: 1,
          producto_id: 1,
          imagen: 'http://neotechbol.test/images/productos/5a090581d2954ab1e3c1c1f64f0bc37a.jpeg',
          color: '#497e25',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ],
      categoria: {
        id: 1,
        catalogo_id: 1,
        nombre: 'Motocicletas',
        banner: '67c79fd30a2d910b6e39d5cbd5637c2f.webp',
        titulo: 'Movilidad Inteligente',
        subtitulo: 'Velocidad, diseño y tecnología en cada modelo.',
        descripcion: 'ninguna',
        estado: 1,
        created_at: '2025-02-28T06:38:29.000000Z',
        updated_at: '2025-02-28T06:39:27.000000Z'
      },
      user: {
        id: 1,
        nombre: 'Super Admin',
        apellido: 'Administrador',
        ci: '4254192123',
        nit: '4254192123',
        direccion: 'Calle del super Admin',
        telefono: '60792059',
        edad: 19,
        genero: 'M',
        email: 'superadmin@gmail.com',
        email_verified_at: null,
        departamento: 'cochabamba',
        estado: 1,
        created_at: '2025-02-28T06:36:25.000000Z',
        updated_at: '2025-03-04T05:52:30.000000Z'
      },
      caracteristicas: [
        {
          id: 1,
          producto_id: 1,
          caracteristica: 'Características 1',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 2,
          producto_id: 1,
          caracteristica: 'Características 2',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 3,
          producto_id: 1,
          caracteristica: 'Características 3',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 4,
          producto_id: 1,
          caracteristica: 'Características 4',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 5,
          producto_id: 1,
          caracteristica: 'Características 5',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 6,
          producto_id: 1,
          caracteristica: 'Características 6',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 7,
          producto_id: 1,
          caracteristica: 'Características 7',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ],
      modelos: [
        {
          id: 1,
          producto_id: 1,
          nombre: 'exclusive',
          precio: '3000.00',
          precio_preventa: '2500.00',
          cantidad_minima: 20,
          cantidad_maxima: 200,
          cantidad_minima_preventa: 10,
          cantidad_maxima_preventa: 100,
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ]
    }
  };

  productoSeleccionado.value = datosPrueba.dato;
  mostrarTodasCaracteristicas.value = false; // Resetear el estado de "Ver más"
  detallesModal.show();
};
</script>

<style scoped>
.card {
  transition: box-shadow 0.3s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header,
.modal-footer {
  padding: 1rem;
}

.modal-body {
  padding: 1.5rem;
}

/* Estilos mejorados para productos en vista móvil */
.product-card {
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.product-card:hover {
  border-left-color: #0d6efd;
  transform: translateX(5px);
}

.product-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.product-detail {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* Estilos para la paginación responsive */
.pagination-container {
  overflow-x: auto;
  padding: 0.5rem 0;
}

.pagination {
  flex-wrap: nowrap;
  min-width: max-content;
}

/* Estilos para productos similares */
.similar-products-container {
  margin-top: 1rem;
  overflow: hidden;
}

.similar-product-card {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.similar-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.similar-product-image {
  position: relative;
  padding-top: 75%;
  overflow: hidden;
}

.similar-product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.similar-product-card:hover .similar-product-image img {
  transform: scale(1.05);
}

.similar-product-info {
  padding: 0.75rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.similar-product-color {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.875rem;
}

.color-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Estilos para la sección de características */
.section-title {
  position: relative;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(to right, #0d6efd, #0dcaf0);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background-color: #e9ecef;
  transform: translateX(5px);
}

/* Estilos para la imagen principal del producto */
.product-main-image {
  border-radius: 0.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.product-main-image:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.product-title {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

/* Estilos para formularios */
.form-label {
  font-size: 0.9rem;
}

.input-group-text {
  background-color: #f8f9fa;
}

.card-header {
  padding: 0.75rem 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-control-color {
  width: 3rem;
}

/* Animaciones */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Validación de formulario */
.was-validated .form-control:invalid,
.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Estilos para paginación */
.pagination {
  margin-bottom: 0;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-link {
  color: #0d6efd;
}

.page-link:hover {
  color: #0a58ca;
  background-color: #e9ecef;
}

/* Media queries para mejorar la responsividad */
@media (max-width: 767.98px) {
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-group .btn {
    width: 100%;
  }
  
  .similar-product-card {
    margin-bottom: 1rem;
  }
  
  .product-info {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  .similar-product-card {
    height: calc(100% - 1rem);
  }
}

/* Animaciones para productos similares */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.similar-product-card {
  animation: fadeIn 0.5s ease-out;
}
</style>