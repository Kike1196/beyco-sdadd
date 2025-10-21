-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(50) NOT NULL,
  `Descripcion` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX (`Nombre` ASC) VISIBLE
);

-- -----------------------------------------------------
-- Table `usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `Num_Empleado` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NOT NULL,
  `Apellido_paterno` VARCHAR(25) NOT NULL,
  `Apellido_materno` VARCHAR(25) NOT NULL,
  `Correo` VARCHAR(100) NOT NULL,
  `Contrasena` VARCHAR(255) NOT NULL,
  `Id_Rol` INT NOT NULL,
  `Activo` TINYINT NULL DEFAULT TRUE,
  `Fecha_Ingreso` DATE NOT NULL,
  `Pregunta_recuperacion` VARCHAR(45) NOT NULL,
  `Respuesta_recuperacion` VARCHAR(45) NOT NULL,
  `Firma` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`Num_Empleado`),
  UNIQUE INDEX (`Correo` ASC) VISIBLE,
  INDEX (`Id_Rol` ASC) VISIBLE,
  UNIQUE INDEX `Firma_UNIQUE` (`Firma` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_roles`
    FOREIGN KEY (`Id_Rol`)
    REFERENCES `roles` (`id`)
);

-- -----------------------------------------------------
-- Table `empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empresas` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(75) NOT NULL,
  `Telefono` VARCHAR(20) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `Direccion` TEXT NOT NULL,
  `RFC` VARCHAR(20) NOT NULL,
  `Activo` TINYINT NOT NULL DEFAULT TRUE,
  `Contacto` VARCHAR(55) NOT NULL,
  `Logo` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE INDEX (`Nombre` ASC) VISIBLE,
  UNIQUE INDEX `Logo_UNIQUE` (`Logo` ASC) VISIBLE
);

-- -----------------------------------------------------
-- Table `alumnos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `alumnos` (
  `Curp` VARCHAR(18) NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `Apellido_paterno` VARCHAR(25) NOT NULL,
  `Apellido_materno` VARCHAR(25) NOT NULL,
  `Fecha_Nacimiento` DATE NOT NULL,
  `Puesto` VARCHAR(100) NOT NULL,
  `Estado_Nacimiento` VARCHAR(50) NOT NULL,
  `RFC` VARCHAR(18) NOT NULL,
  `Activo` TINYINT NOT NULL DEFAULT TRUE,
  `Fecha_Registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Curp`),
  UNIQUE INDEX (`RFC` ASC) VISIBLE
);

-- -----------------------------------------------------
-- Table `catalogo_cursos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `catalogo_cursos` (
  `Clave_STPS` VARCHAR(20) NOT NULL,
  `Nombre` VARCHAR(100) NOT NULL,
  `Precio` DECIMAL(10,2) NOT NULL,
  `Horas` INT NOT NULL,
  `Examen_practico` TINYINT NOT NULL,
  `Estatus` ENUM('activo', 'inactivo') NOT NULL,
  PRIMARY KEY (`Clave_STPS`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `cursos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cursos` (
  `Id_Curso` INT NOT NULL AUTO_INCREMENT,
  `Nombre_curso` VARCHAR(45) NOT NULL,
  `Fecha_Imparticion` DATE NOT NULL,
  `Lugar` VARCHAR(200) NOT NULL,
  `Empresa_Id` INT NOT NULL,
  `Instructor_Id` INT NOT NULL,
  `Clave_STPS` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`Id_Curso`),
  INDEX (`Empresa_Id` ASC) VISIBLE,
  INDEX `fk_cursos_usuarios1_idx` (`Instructor_Id` ASC) VISIBLE,
  INDEX `fk_cursos_catalogo_cursos1_idx` (`Clave_STPS` ASC) VISIBLE,
  CONSTRAINT `fk_cursos_empresas`
    FOREIGN KEY (`Empresa_Id`)
    REFERENCES `empresas` (`Id`),
  CONSTRAINT `fk_cursos_usuarios1`
    FOREIGN KEY (`Instructor_Id`)
    REFERENCES `usuarios` (`Num_Empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cursos_catalogo_cursos1`
    FOREIGN KEY (`Clave_STPS`)
    REFERENCES `catalogo_cursos` (`Clave_STPS`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `evaluaciones_cursos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `evaluaciones_cursos` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Curso_Id` INT NOT NULL,
  `Examen_Inicial` DECIMAL(5,2) NOT NULL,
  `Examen_Final` DECIMAL(5,2) NOT NULL,
  `Examen_Practico` DECIMAL(5,2) NOT NULL,
  `Resultado` ENUM('APTO', 'NO APTO', 'CONDICIONADO') NOT NULL,
  `Observaciones` TEXT NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`Curso_Id` ASC) VISIBLE,
  CONSTRAINT `fk_evaluaciones_cursos_cursos`
    FOREIGN KEY (`Curso_Id`)
    REFERENCES `cursos` (`Id_Curso`)
);

-- -----------------------------------------------------
-- Table `pagos_instructores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pagos_instructores` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Instructor_Id` INT NOT NULL,
  `Fecha_Pago` DATE NOT NULL,
  `Monto` DECIMAL(10,2) NOT NULL,
  `Horas_Impartidas` INT NOT NULL,
  `Estatus` ENUM('pendiente', 'pagado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  `Comprobante` VARCHAR(100) NOT NULL,
  `Observaciones` TEXT NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`Instructor_Id` ASC) VISIBLE,
  CONSTRAINT `fk_pagos_usuarios`
    FOREIGN KEY (`Instructor_Id`)
    REFERENCES `usuarios` (`Num_Empleado`)
);

-- -----------------------------------------------------
-- Table `evidencia_cursos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `evidencia_cursos` (
  `Id_Evidencia` INT NOT NULL AUTO_INCREMENT,
  `Tipo_Evidencia` ENUM('foto', 'video', 'documento', 'lista_asistencia') NOT NULL DEFAULT 'foto',
  `Descripcion` VARCHAR(200) NOT NULL,
  `Archivo_Ruta` VARCHAR(500) NOT NULL,
  `Fecha_Subida` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Estatus` ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
  `Observaciones` TEXT NOT NULL,
  `cursos_Id_Curso` INT NOT NULL,
  PRIMARY KEY (`Id_Evidencia`),
  INDEX `fk_evidencia_cursos_cursos1_idx` (`cursos_Id_Curso` ASC) VISIBLE,
  CONSTRAINT `fk_evidencia_cursos_cursos1`
    FOREIGN KEY (`cursos_Id_Curso`)
    REFERENCES `cursos` (`Id_Curso`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `formatos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `formatos` (
  `logos` VARCHAR(15) NOT NULL,
  UNIQUE INDEX `Firma_UNIQUE` (`logos` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `alumnos_has_cursos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `alumnos_has_cursos` (
  `alumnos_Curp` VARCHAR(18) NOT NULL,
  `cursos_Id_Curso` INT NOT NULL,
  PRIMARY KEY (`alumnos_Curp`, `cursos_Id_Curso`),
  INDEX `fk_alumnos_has_cursos_cursos1_idx` (`cursos_Id_Curso` ASC) VISIBLE,
  INDEX `fk_alumnos_has_cursos_alumnos1_idx` (`alumnos_Curp` ASC) VISIBLE,
  CONSTRAINT `fk_alumnos_has_cursos_alumnos1`
    FOREIGN KEY (`alumnos_Curp`)
    REFERENCES `alumnos` (`Curp`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_alumnos_has_cursos_cursos1`
    FOREIGN KEY (`cursos_Id_Curso`)
    REFERENCES `cursos` (`Id_Curso`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

