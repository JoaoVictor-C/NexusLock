-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema db_nexuslock
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `db_nexuslock` ;

-- -----------------------------------------------------
-- Schema db_nexuslock
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_nexuslock` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `db_nexuslock` ;

-- -----------------------------------------------------
-- Table `db_nexuslock`.`employees`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`employees` (
  `employee_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(256) NOT NULL,
  `pin_code` CHAR(4) NOT NULL,
  `fingerprint_data` VARBINARY(255) NULL DEFAULT NULL,
  `fingerprint_data_base64` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE INDEX `UQ_pin_code` (`pin_code` ASC),
  UNIQUE INDEX `UQ_email` (`email` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `db_nexuslock`.`rooms`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`rooms` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`rooms` (
  `room_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `status` BOOLEAN NOT NULL DEFAULT FALSE,
  `image` LONGBLOB NULL DEFAULT NULL,
  `occupied_by_employee_id` INT NULL,
  PRIMARY KEY (`room_id`),
  FOREIGN KEY (`occupied_by_employee_id`) REFERENCES `employees`(`employee_id`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `db_nexuslock`.`accesslogs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`accesslogs` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`accesslogs` (
  `log_id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NULL DEFAULT NULL,
  `room_id` INT NULL DEFAULT NULL,
  `access_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `access_granted` TINYINT(1) NULL DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  INDEX `employee_id` (`employee_id` ASC) VISIBLE,
  INDEX `room_id` (`room_id` ASC) VISIBLE,
  CONSTRAINT `accesslogs_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `db_nexuslock`.`employees` (`employee_id`)
    ON DELETE CASCADE,
  CONSTRAINT `accesslogs_ibfk_2`
    FOREIGN KEY (`room_id`)
    REFERENCES `db_nexuslock`.`rooms` (`room_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `db_nexuslock`.`roles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`roles` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`roles` (
  `role_id` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`role_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `db_nexuslock`.`employeeroles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`employeeroles` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`employeeroles` (
  `employee_role_id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NULL DEFAULT NULL,
  `role_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`employee_role_id`),
  INDEX `employee_id` (`employee_id` ASC) VISIBLE,
  INDEX `role_id` (`role_id` ASC) VISIBLE,
  CONSTRAINT `employeeroles_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `db_nexuslock`.`employees` (`employee_id`)
    ON DELETE CASCADE,
  CONSTRAINT `employeeroles_ibfk_2`
    FOREIGN KEY (`role_id`)
    REFERENCES `db_nexuslock`.`roles` (`role_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `db_nexuslock`.`employeeroomaccess`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`employeeroomaccess` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`employeeroomaccess` (
  `access_id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NULL DEFAULT NULL,
  `room_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`access_id`),
  INDEX `employee_id` (`employee_id` ASC) VISIBLE,
  INDEX `room_id` (`room_id` ASC) VISIBLE,
  CONSTRAINT `employeeroomaccess_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `db_nexuslock`.`employees` (`employee_id`)
    ON DELETE CASCADE,
  CONSTRAINT `employeeroomaccess_ibfk_2`
    FOREIGN KEY (`room_id`)
    REFERENCES `db_nexuslock`.`rooms` (`room_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `db_nexuslock`.`permissions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`permissions` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`permissions` (
  `permission_id` INT NOT NULL AUTO_INCREMENT,
  `permission_key` VARCHAR(50) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`permission_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `db_nexuslock`.`rolepermissions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`rolepermissions` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`rolepermissions` (
  `role_permission_id` INT NOT NULL AUTO_INCREMENT,
  `role_id` INT NULL DEFAULT NULL,
  `permission_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`role_permission_id`),
  INDEX `role_id` (`role_id` ASC) VISIBLE,
  INDEX `permission_id` (`permission_id` ASC) VISIBLE,
  INDEX `idx_role_permission` (`role_id` ASC, `permission_id` ASC) VISIBLE,
  CONSTRAINT `rolepermissions_ibfk_1`
    FOREIGN KEY (`role_id`)
    REFERENCES `db_nexuslock`.`roles` (`role_id`)
    ON DELETE CASCADE,
  CONSTRAINT `rolepermissions_ibfk_2`
    FOREIGN KEY (`permission_id`)
    REFERENCES `db_nexuslock`.`permissions` (`permission_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;
p-09876

-- -----------------------------------------------------
-- Table `db_nexuslock`.`usertokens`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_nexuslock`.`usertokens` ;

CREATE TABLE IF NOT EXISTS `db_nexuslock`.`usertokens` (
  `token_id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `token` VARCHAR(1024) NOT NULL,
  `expiration` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_id`),
  INDEX `employee_id` (`employee_id` ASC) VISIBLE,
  INDEX `token` (`token`(191) ASC) VISIBLE,
  INDEX `expiration` (`expiration` ASC) VISIBLE,
  CONSTRAINT `usertokens_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `db_nexuslock`.`employees` (`employee_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 22
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;