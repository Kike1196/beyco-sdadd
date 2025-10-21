-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`roles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`roles` ;

CREATE TABLE IF NOT EXISTS `mydb`.`roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(50) NOT NULL,
  `Descripcion` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX (`Nombre` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `mydb`.`usuarios`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`usuarios` ;

CREATE TABLE IF NOT EXISTS `mydb`.`usuarios` (
  `Num_Empleado` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NOT NULL,
  `Apellido_paterno` VARCHAR(25) NOT NULL,
  `Apellido_materno` VARCHAR(25) NOT NULL,
  `Correo` VARCHAR(100) NOT NULL,
  `Contraseña` VARCHAR(255) NOT NULL,
  `Id_Rol` INT NOT NULL,
  `Activo` TINYINT NULL DEFAULT TRUE,
  `Fecha_Ingreso` DATE NOT NULL,
  `Pregunta_recuperacion` VARCHAR(45) NOT NULL,
  `Respuesta_recuperacion` VARCHAR(45) NOT NULL,
  `Firma` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`Num_Empleado`),
  UNIQUE INDEX (`Correo` ASC) VISIBLE,
  INDEX (`Id_Rol` ASC) VISIBLE,
  UNIQUE INDEX `Firma_UNIQUE` (`Firma` ASC) VISIBLE,
  CONSTRAINT ``
    FOREIGN KEY (`Id_Rol`)
    REFERENCES `mydb`.`roles` (`id`));


-- -----------------------------------------------------
-- Table `mydb`.`empresas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`empresas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`empresas` (
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
  UNIQUE INDEX `Logo_UNIQUE` (`Logo` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `mydb`.`alumnos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`alumnos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`alumnos` (
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
  UNIQUE INDEX (`RFC` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `mydb`.`catalogo_cursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`catalogo_cursos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`catalogo_cursos` (
  `Clave_STPS` VARCHAR(20) NOT NULL,
  `Nombre` VARCHAR(100) NOT NULL,
  `Precio` DECIMAL(10,2) NOT NULL,
  `Horas` INT NOT NULL,
  `Examen_practico` TINYINT NOT NULL,
  PRIMARY KEY (`Clave_STPS`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`cursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`cursos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`cursos` (
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
  CONSTRAINT ``
    FOREIGN KEY (`Empresa_Id`)
    REFERENCES `mydb`.`empresas` (`Id`),
  CONSTRAINT `fk_cursos_usuarios1`
    FOREIGN KEY (`Instructor_Id`)
    REFERENCES `mydb`.`usuarios` (`Num_Empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cursos_catalogo_cursos1`
    FOREIGN KEY (`Clave_STPS`)
    REFERENCES `mydb`.`catalogo_cursos` (`Clave_STPS`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`evaluaciones_cursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`evaluaciones_cursos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`evaluaciones_cursos` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Curso_Id` INT NOT NULL,
  `Examen_Inicial` DECIMAL(5,2) NOT NULL,
  `Examen_Final` DECIMAL(5,2) NOT NULL,
  `Examen_Practico` DECIMAL(5,2) NOT NULL,
  `Promedio` DECIMAL(5,2) NOT NULL,
  `Resultado` ENUM('APTO', 'NO APTO', 'CONDICIONADO') NOT NULL,
  `Tipo_Resultado` ENUM('ACREDITADO_CON_LICENCIA', 'CONDICIONADO_CON_LICENCIA', 'NO_APTO') NOT NULL DEFAULT 'ACREDITADO_CON_LICENCIA',
  `Observaciones` TEXT NOT NULL,
  `Fecha_Evaluacion` DATE NOT NULL,
  `Fecha_Registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  INDEX (`Curso_Id` ASC) VISIBLE,
  CONSTRAINT ``
    FOREIGN KEY (`Curso_Id`)
    REFERENCES `mydb`.`cursos` (`Id_Curso`));


-- -----------------------------------------------------
-- Table `mydb`.`pagos_instructores`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`pagos_instructores` ;

CREATE TABLE IF NOT EXISTS `mydb`.`pagos_instructores` (
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
  CONSTRAINT ``
    FOREIGN KEY (`Instructor_Id`)
    REFERENCES `mydb`.`usuarios` (`Num_Empleado`));


-- -----------------------------------------------------
-- Table `mydb`.`evidencia_cursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`evidencia_cursos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`evidencia_cursos` (
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
    REFERENCES `mydb`.`cursos` (`Id_Curso`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `mydb`.`catalogo_ursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`catalogo_ursos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`catalogo_ursos` (
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`formatos_y_firmas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`formatos_y_firmas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`formatos_y_firmas` (
  `usuarios_Num_Empleado` INT NOT NULL,
  `Firma` VARCHAR(15) NOT NULL,
  INDEX `fk_formatos_y_firmas_usuarios1_idx` (`usuarios_Num_Empleado` ASC) VISIBLE,
  UNIQUE INDEX `Firma_UNIQUE` (`Firma` ASC) VISIBLE,
  CONSTRAINT `fk_formatos_y_firmas_usuarios1`
    FOREIGN KEY (`usuarios_Num_Empleado`)
    REFERENCES `mydb`.`usuarios` (`Num_Empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`registro_alumnos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`registro_alumnos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`registro_alumnos` (
  `alumnos_Curp` INT NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `Apellido_paterno` VARCHAR(25) NOT NULL,
  `Apellido_materno` VARCHAR(25) NOT NULL,
  `Estado_Nacimiento` VARCHAR(30) NOT NULL,
  `Puesto` VARCHAR(45) NOT NULL,
  `Fecha_Registro` DATE NOT NULL,
  PRIMARY KEY (`alumnos_Curp`),
  CONSTRAINT `fk_registro_alumnos_alumnos1`
    FOREIGN KEY (`alumnos_Curp`)
    REFERENCES `mydb`.`alumnos` (`Curp`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`registro_alumnos_has_cursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`registro_alumnos_has_cursos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`registro_alumnos_has_cursos` (
  `registro_alumnos_alumnos_Curp` INT NOT NULL,
  `cursos_Id` INT NOT NULL,
  PRIMARY KEY (`registro_alumnos_alumnos_Curp`, `cursos_Id`),
  INDEX `fk_registro_alumnos_has_cursos_cursos1_idx` (`cursos_Id` ASC) VISIBLE,
  INDEX `fk_registro_alumnos_has_cursos_registro_alumnos1_idx` (`registro_alumnos_alumnos_Curp` ASC) VISIBLE,
  CONSTRAINT `fk_registro_alumnos_has_cursos_registro_alumnos1`
    FOREIGN KEY (`registro_alumnos_alumnos_Curp`)
    REFERENCES `mydb`.`registro_alumnos` (`alumnos_Curp`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_registro_alumnos_has_cursos_cursos1`
    FOREIGN KEY (`cursos_Id`)
    REFERENCES `mydb`.`cursos` (`Id_Curso`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
