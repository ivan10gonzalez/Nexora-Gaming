# Nexora Gaming

Sitio corporativo en español para presentar servicios de desarrollo web, plataformas white label, paneles e integraciones. Diseño adaptable a celular y escritorio, sin dependencias de producción ni recursos externos.

## Contenido e interacciones

- Escultura tridimensional generada con WebGL, reactiva al puntero. Alternativa visual en CSS si WebGL no está disponible.
- Animaciones de entrada, controles para pausar movimiento y respeto por la preferencia de movimiento reducido del dispositivo.
- Brand Studio: nombre y color editables, vistas de experiencia, administración e identidad. Las vistas son demostraciones conceptuales, sin usuarios, datos o integraciones reales.
- Menú móvil, pestañas accesibles por teclado, preguntas desplegables y formulario modal.
- Formulario con validación, descarga de resumen y copia al portapapeles. Los datos permanecen en la página hasta que la persona decide descargarlos o abrir un canal de contacto.

## Desarrollo

Con Node.js 20 o posterior, sin instalar paquetes:

```sh
npm run dev
```

Abrir `http://127.0.0.1:4175`. El servidor es exclusivamente para previsualización local.

```sh
npm run check
npm run build
```

Publicar el contenido generado en `dist/` en cualquier alojamiento estático. En Render, crear un **Static Site** conectado a este repositorio: Build Command `npm run build`, Publish Directory `dist`. No requiere base de datos ni variables de entorno. La publicación debe configurarse en la cuenta de alojamiento; subir el código a GitHub por sí solo no crea ese servicio.

## Agregar contacto

Editar `config.js`:

```js
window.NEXORA_CONFIG = {
  email: '',
  whatsapp: '', // Código de país y número: solamente dígitos.
  contactUrl: '' // Enlace HTTPS a agenda, formulario o perfil comercial.
};
```

Al completar uno o más campos, el resumen de consulta ofrece los canales correspondientes. Correo y WhatsApp preparan el texto; el visitante confirma el envío en su aplicación. El enlace externo abre la dirección configurada. Si los campos están vacíos, se ofrecen solamente descarga y copia, indicando claramente que no se envió ningún mensaje.

El formulario no tiene backend ni guarda consultas. Si se necesita recibir mensajes directamente desde la web, hay que conectar un servicio de formularios o implementar un endpoint.

## Personalización

- `index.html`: contenido, secciones y textos.
- `styles.css`: colores, tipografía local, tamaños y adaptación por pantalla.
- `app.js`: demostración interactiva y comportamiento del formulario.
- `sculpture.js`: escultura 3D procedural, limitada a aproximadamente 30 cuadros por segundo, suspendida cuando no está visible.
- `assets/favicon.svg`: marca del sitio.

El alcance comercial es una presentación inicial. No incluye métricas, clientes, testimonios ni alianzas inventadas. Ajustar los textos de alcance y soporte a las prestaciones acordadas con cada cliente.
