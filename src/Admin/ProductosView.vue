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
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Buscar producto..." v-model="search"
              @input="filtrarProductos">
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
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in productosFiltrados" :key="item.id" class="text-center">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ formatearPrecio(item.precio) }}</td>
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

        <!-- Cards for mobile view -->
        <div class="d-md-none">
          <div v-for="item in productosFiltrados" :key="item.id" class="card mb-3 mx-3">
            <div class="card-body">
              <h5 class="card-title">{{ item.nombre }}</h5>
              <p class="card-text">
                <strong>Precio:</strong> {{ formatearPrecio(item.precio) }}<br>
                <strong>Categoría:</strong> {{ item.categoria?.nombre || 'N/A' }}<br>
                <strong>Stock:</strong> {{ item.cantidad || 'N/A' }}<br>
                <strong>Estado:</strong>
                <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                  {{ item.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="mostrarProducto(item.id)">
                  <i class="fas fa-edit me-1"></i>Editar
                </button>
                <button class="btn btn-sm btn-outline-info" @click="verDetalles(item)">
                  <i class="fas fa-info-circle me-1"></i>Detalles
                </button>
              </div>
            </div>
          </div>
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
                  <p class="mb-0">Los campos marcados con <span class="text-danger fw-bold">*</span> son obligatorios.</p>
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
                          <label for="nombre" class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-tag"></i></span>
                            <input 
                              type="text" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.nombre }" 
                              id="nombre"
                              v-model="formulario.nombre" 
                              placeholder="Ej: Motocicleta eléctrica"
                              required
                            >
                            <div class="invalid-feedback" v-if="errors.nombre">
                              {{ errors.nombre[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              El nombre del producto es obligatorio
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label for="precio" class="form-label fw-bold">Precio <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                            <input 
                              type="number" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.precio }" 
                              id="precio"
                              v-model="formulario.precio" 
                              placeholder="Ej: 2500.00"
                              min="0.01" 
                              step="0.01"
                              required
                            >
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
                            <input 
                              type="number" 
                              class="form-control" 
                              id="cantidad" 
                              v-model="formulario.cantidad"
                              min="0"
                              placeholder="Ej: 50"
                            >
                          </div>
                        </div>
                        <div class="col-12">
                          <label for="descripcion" class="form-label fw-bold">Descripción</label>
                          <textarea 
                            class="form-control" 
                            id="descripcion" 
                            v-model="formulario.descripcion" 
                            rows="3"
                            placeholder="Describa el producto..."
                          ></textarea>
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
                          <label for="cantidad_minima" class="form-label fw-bold">Cantidad Mínima <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-arrow-down"></i></span>
                            <input 
                              type="number" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.cantidad_minima }" 
                              id="cantidad_minima" 
                              v-model="formulario.cantidad_minima"
                              min="1"
                              placeholder="Ej: 10"
                              required
                            >
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
                          <label for="cantidad_maxima" class="form-label fw-bold">Cantidad Máxima <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-arrow-up"></i></span>
                            <input 
                              type="number" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.cantidad_maxima }" 
                              id="cantidad_maxima" 
                              v-model="formulario.cantidad_maxima"
                              min="1"
                              placeholder="Ej: 100"
                              required
                            >
                            <div class="invalid-feedback" v-if="errors.cantidad_maxima">
                              {{ errors.cantidad_maxima[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              La cantidad máxima es obligatoria
                            </div>
                          </div>
                          <small class="text-muted">Cantidad máxima que se puede comprar</small>
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
                          <label for="imagen_principal" class="form-label fw-bold">Seleccionar imagen <span class="text-danger">*</span></label>
                          <div class="input-group mb-3">
                            <span class="input-group-text"><i class="fas fa-upload"></i></span>
                            <input 
                              type="file" 
                              class="form-control" 
                              id="imagen_principal" 
                              @change="obtenerImagen($event)"
                              accept="image/*"
                              :class="{ 'is-invalid': !imagenPreview && !posicion }"
                              required
                            >
                            <div class="invalid-feedback">
                              La imagen principal es obligatoria
                            </div>
                          </div>
                          <small class="text-muted">Formatos recomendados: JPG, PNG. Tamaño máximo: 2MB</small>
                        </div>
                        <div class="col-md-4 text-center">
                          <div v-if="imagenPreview" class="border p-2 rounded bg-white">
                            <img :src="imagenPreview" alt="Vista previa" class="img-fluid" style="max-height: 150px;">
                          </div>
                          <div v-else class="border p-2 rounded bg-white d-flex align-items-center justify-content-center" style="height: 150px;">
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
                        <div v-if="formulario.caracteristicas.length === 0" class="text-center py-3 border rounded mb-3 bg-white">
                          <i class="fas fa-info-circle text-muted me-2"></i>
                          <span class="text-muted">No hay características agregadas. Haga clic en "Agregar" para añadir características.</span>
                        </div>
                        <div v-for="(caracteristica, index) in formulario.caracteristicas" :key="index" class="mb-2">
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-check"></i></span>
                            <input 
                              type="text" 
                              class="form-control" 
                              v-model="formulario.caracteristicas[index]"
                              placeholder="Ej: Batería de larga duración"
                              required
                            >
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
                        <i class="fas fa-cubes me-2"></i>Modelos <span class="text-danger">*</span>
                      </h5>
                      <button type="button" class="btn btn-sm btn-primary" @click="agregarModelo">
                        <i class="fas fa-plus me-1"></i>Agregar
                      </button>
                    </div>
                    <div class="card-body">
                      <div :class="{ 'is-invalid': errors.modelos && formulario.modelos.length === 0 }">
                        <div v-if="formulario.modelos.length === 0" class="text-center py-3 border rounded mb-3 bg-white">
                          <i class="fas fa-info-circle text-muted me-2"></i>
                          <span class="text-muted">No hay modelos agregados. Haga clic en "Agregar" para añadir modelos.</span>
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
                                <input 
                                  type="text" 
                                  class="form-control" 
                                  v-model="modelo.nombre"
                                  placeholder="Ej: Exclusive"
                                  required
                                >
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Precio <span class="text-danger">*</span></label>
                                <div class="input-group">
                                  <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                                  <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="modelo.precio" 
                                    placeholder="Ej: 3000.00"
                                    min="0.01"
                                    step="0.01"
                                    required
                                  >
                                </div>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Cantidad mínima <span class="text-danger">*</span></label>
                                <input 
                                  type="number" 
                                  class="form-control" 
                                  v-model="modelo.cantidad_minima"
                                  placeholder="Ej: 20"
                                  min="1"
                                  required
                                >
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">Cantidad máxima <span class="text-danger">*</span></label>
                                <input 
                                  type="number" 
                                  class="form-control" 
                                  v-model="modelo.cantidad_maxima"
                                  placeholder="Ej: 200"
                                  min="1"
                                  required
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="invalid-feedback d-block" v-if="errors.modelos">
                        {{ errors.modelos[0] }}
                      </div>
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
                        <div v-if="formulario.images.length === 0" class="text-center py-3 border rounded mb-3 bg-white">
                          <i class="fas fa-info-circle text-muted me-2"></i>
                          <span class="text-muted">No hay imágenes adicionales. Haga clic en "Agregar" para añadir imágenes.</span>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-4" v-for="(imagen, index) in formulario.images" :key="index">
                            <div class="card h-100 border">
                              <div class="card-header bg-white">
                                <h6 class="mb-0">Imagen {{ index + 1 }}</h6>
                              </div>
                              <div class="card-body">
                                <div class="mb-3">
                                  <label class="form-label">Archivo <span class="text-danger">*</span></label>
                                  <input 
                                    type="file" 
                                    class="form-control" 
                                    @change="(event) => handleFileUpload(event, index)"
                                    accept="image/*"
                                    :required="!imagen.preview"
                                  >
                                </div>
                                <div class="mb-3">
                                  <label :for="'color-' + index" class="form-label">Color <span class="text-danger">*</span></label>
                                  <div class="d-flex gap-2">
                                    <input 
                                      type="color" 
                                      class="form-control form-control-color" 
                                      :id="'color-' + index"
                                      v-model="imagen.color"
                                      required
                                    >
                                    <span class="form-control">{{ imagen.color }}</span>
                                  </div>
                                </div>
                                <div class="text-center mb-3">
                                  <div v-if="imagen.preview" class="border p-2 rounded bg-white">
                                    <img :src="imagen.preview" class="img-fluid rounded" alt="Preview" style="max-height: 120px;">
                                  </div>
                                  <div v-else class="border p-2 rounded bg-white d-flex align-items-center justify-content-center" style="height: 120px;">
                                    <span class="text-muted">Sin imagen</span>
                                  </div>
                                </div>
                                <button type="button" class="btn btn-outline-danger btn-sm w-100" @click="eliminarImagen(index)">
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
                      <small class="text-muted mt-2 d-block">Agregue imágenes adicionales del producto con sus respectivos colores</small>
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
                <button 
                  type="button" 
                  class="btn" 
                  :class="posicion ? 'btn-warning' : 'btn-primary'"
                  @click="validarYGuardar"
                >
                  <i class="fas" :class="posicion ? 'fa-save me-1' : 'fa-plus me-1'"></i>
                  {{ posicion ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del producto -->
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
                <img :src="productoSeleccionado.imagen_principal" alt="Imagen principal" class="img-fluid rounded mb-3">
              </div>
              <div class="col-md-6">
                <h4>{{ productoSeleccionado.nombre }}</h4>
                <p><strong>Precio:</strong> {{ formatearPrecio(productoSeleccionado.precio) }}</p>
                <p><strong>Categoría:</strong> {{ productoSeleccionado.categoria?.nombre || 'N/A' }}</p>
                <p><strong>Descripción:</strong> {{ productoSeleccionado.descripcion || 'N/A' }}</p>
                <p><strong>Cantidad Mínima:</strong> {{ productoSeleccionado.cantidad_minima }}</p>
                <p><strong>Cantidad Máxima:</strong> {{ productoSeleccionado.cantidad_maxima }}</p>
                <p><strong>Estado:</strong>
                  <span class="badge" :class="productoSeleccionado.estado ? 'bg-success' : 'bg-danger'">
                    {{ productoSeleccionado.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>
            </div>
            <h5 class="mt-4">Características</h5>
            <ul>
              <li v-for="(caracteristica, index) in productoSeleccionado.caracteristicas" :key="index">
                {{ caracteristica.caracteristica }}
              </li>
            </ul>
            <h5 class="mt-4">Modelos</h5>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Cantidad Mínima</th>
                    <th>Cantidad Máxima</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="modelo in productoSeleccionado.modelos" :key="modelo.id">
                    <td>{{ modelo.nombre }}</td>
                    <td>{{ formatearPrecio(modelo.precio) }}</td>
                    <td>{{ modelo.cantidad_minima }}</td>
                    <td>{{ modelo.cantidad_maxima }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h5 class="mt-4">Imágenes Adicionales</h5>
            <div class="row g-3">
              <div class="col-md-4" v-for="imagen in productoSeleccionado.images" :key="imagen.id">
                <div class="card">
                  <img :src="imagen.imagen" class="card-img-top" :alt="productoSeleccionado.nombre">
                  <div class="card-body">
                    <p class="card-text">Color: <span
                        :style="{ backgroundColor: imagen.color, width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle' }"></span>
                    </p>
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
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { indexProductos, showProducto, storeProducto, updateProducto, deleteImage } from '@/Services/ProductoService';
import { indexActivosCategorias } from '@/Services/CategoriaService';

const productos = ref([]);
const categorias = ref([]);
const search = ref('');
const posicion = ref('');
const formulario = ref({
  nombre: '',
  precio: '',
  categoria_id: '',
  descripcion: '',
  cantidad: '',
  cantidad_minima: '',
  cantidad_maxima: '',
  imagen_principal: '',
  caracteristicas: [],
  modelos: [],
  images: []
});
const errors = ref({});
const imagenPreview = ref('');
const productoSeleccionado = ref(null);
const formValidado = ref(false);

let productoModal = null;
let detallesModal = null;

onMounted(() => {
  productoModal = new Modal(document.getElementById('productoModal'));
  detallesModal = new Modal(document.getElementById('detallesModal'));
  listarProductos();
  listarCategorias();
});

const productosFiltrados = computed(() => {
  if (!search.value) return productos.value;
  return productos.value.filter(producto =>
    producto.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
    (producto.categoria?.nombre && producto.categoria.nombre.toLowerCase().includes(search.value.toLowerCase()))
  );
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
    imagenPreview.value = '';
  }
};

const abrirModal = () => {
  posicion.value = '';
  formulario.value = {
    nombre: '',
    precio: '',
    categoria_id: '',
    descripcion: '',
    cantidad: '',
    cantidad_minima: '',
    cantidad_maxima: '',
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
    const { data } = await indexProductos();
    productos.value = data.datos;
  } catch (error) {
    console.error('Error al cargar productos:', error);
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
  
  if (formulario.value.modelos.length === 0) {
    errors.value.modelos = ['El campo modelos es obligatorio.'];
    esValido = false;
  }
  
  if (formulario.value.images.length === 0 && !posicion.value) {
    errors.value.images = ['El campo images es obligatorio.'];
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
    Object.keys(formulario.value).forEach(key => {
      if (formulario.value[key] !== '' && key !== 'images' && key !== 'caracteristicas' && key !== 'modelos') {
        formData.append(key, formulario.value[key]);
      }
    });

    formulario.value.caracteristicas.forEach((caracteristica, index) => {
      formData.append(`caracteristicas[${index}]`, caracteristica);
    });

    formulario.value.modelos.forEach((modelo, index) => {
      Object.keys(modelo).forEach(key => {
        formData.append(`modelos[${index}][${key}]`, modelo[key]);
      });
    });

    formulario.value.images.forEach((imagen, index) => {
      if (imagen.file) {
        formData.append(`images[${index}]`, imagen.file);
        formData.append(`colors[${index}]`, imagen.color);
      }
    });

    if (posicion.value) {
      formData.append('_method', 'PUT');
      await updateProducto(posicion.value, formData);
    } else {
      await storeProducto(formData);
    }
    await listarProductos();
    productoModal.hide();
    
    // Mostrar mensaje de éxito
    alert(posicion.value ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
      
      // Scroll al primer error
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
    console.log(data);
    formulario.value = {
      nombre: data.dato.nombre,
      precio: data.dato.precio,
      categoria_id: data.dato.categoria_id,
      descripcion: data.dato.descripcion,
      cantidad: data.dato.cantidad,
      cantidad_minima: data.dato.cantidad_minima,
      cantidad_maxima: data.dato.cantidad_maxima,
      imagen_principal: data.dato.imagen_principal,
      caracteristicas: data.dato.caracteristicas.map(c => c.caracteristica),
      modelos: data.dato.modelos,
      images: data.dato.images.map(img => ({
        id: img.id,
        preview: img.imagen,
        color: img.color,
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

const verDetalles = async (productoIO) => {
  productoSeleccionado.value = productoIO;
  try {
    const { data } = await showProducto(productoIO);
    productoSeleccionado.value = data.dato;
    console.log(productoSeleccionado);
    detallesModal.show();
  } catch (error) {
    console.log(error);
    alert('Error al cargar los detalles del producto. Intente nuevamente.');
  }
};

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(precio);
};

const filtrarProductos = () => {
  // La función computed 'productosFiltrados' se encargará de filtrar automáticamente
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
    cantidad_minima: '',
    cantidad_maxima: ''
  });
};

const eliminarModelo = (index) => {
  formulario.value.modelos.splice(index, 1);
};

const agregarImagen = () => {
  formulario.value.images.push({
    file: null,
    preview: '',
    color: '#000000'
  });
};

const eliminarImagen = async (index) => {
  const imagen = formulario.value.images[index];
  if (imagen.id) {
    try {
      await deleteImage(posicion.value, imagen.id);
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
      estado: 1,
      cantidad: 0,
      imagen_principal: 'http://neotechbol.test/images/imagenes_principales/01a0cb6696e17c86fb70b669472b61f9.jpeg',
      cantidad_minima: 10,
      cantidad_maxima: 100,
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
        }
      ],
      modelos: [
        {
          id: 1,
          producto_id: 1,
          nombre: 'exclusive',
          precio: '3000.00',
          cantidad_minima: 20,
          cantidad_maxima: 200,
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ]
    }
  };

  productoSeleccionado.value = datosPrueba.dato;
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

@media (max-width: 767.98px) {
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-group .btn {
    width: 100%;
  }
}

/* Estilos para mejorar la UI */
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
</style>