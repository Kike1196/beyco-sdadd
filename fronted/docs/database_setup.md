# Funcionamiento de la Base de Datos con Docker

Nuestra base de datos no está instalada directamente en el sistema operativo, sino que vive dentro de un **contenedor de Docker aislado y dedicado**. Este enfoque garantiza un entorno consistente y reproducible.

El proceso se divide en tres fases clave: Creación, Persistencia y Conexión.

---
### ## 1. Creación e Inicialización ✨

Esto es lo que sucede la **primera vez** que se ejecuta `docker-compose up`:

1.  **Descarga de la Imagen:** Docker utiliza la imagen oficial `mysql:8.0` como plantilla para nuestro contenedor `beyco-db`.
2.  **Ejecución del Script de Inicialización:** La configuración clave en `docker-compose.yml` es el volumen:
    ```yaml
    volumes:
      - ./db-init:/docker-entrypoint-initdb.d
    ```
    La imagen de MySQL está programada para que, al arrancar por primera vez, busque en la carpeta interna `/docker-entrypoint-initdb.d` y **ejecute cualquier script `.sql` que encuentre**. Gracias a nuestro volumen, nuestro archivo local `db-init/init.sql` se ejecuta, creando toda la estructura de tablas de la base de datos.

Este proceso de inicialización solo ocurre una vez en la vida del volumen de datos.

---
### ## 2. Persistencia de Datos 💾

Para asegurar que los datos no se pierdan al detener o eliminar el contenedor, usamos un **volumen persistente**:
```yaml
volumes:
  - mysql-data:/var/lib/mysql
```
Esta línea mapea la carpeta interna donde MySQL guarda sus datos (`/var/lib/mysql`) a un volumen gestionado por Docker en la máquina anfitriona llamado `mysql-data`.

Esto significa que toda la información (usuarios, cursos, etc.) se guarda de forma segura fuera del contenedor. Si el contenedor se destruye, el volumen de datos permanece intacto y se volverá a conectar la próxima vez que se inicie el servicio.

---
### ## 3. Conexión 🌐

#### **Conexión Interna (Aplicación -> Base de Datos)**
Docker Compose crea una red virtual privada. El contenedor de la aplicación (`beyco-app`) se conecta al contenedor de la base de datos utilizando el nombre del servicio, `db`, como si fuera un nombre de host. Esto se configura a través de la variable de entorno `DB_HOST: db`.

#### **Conexión Externa (Desarrollador -> Base de Datos)**
La configuración de puertos en `docker-compose.yml` crea un puente entre el contenedor y nuestra máquina:
```yaml
ports:
  - "3306:3306"
```
Esto nos permite usar herramientas como TablePlus o MySQL Workbench para conectarnos a `localhost:3306` y gestionar la base de datos directamente.