-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         5.7.28-log - MySQL Community Server (GPL)
-- SO del servidor:              Win64
-- HeidiSQL Versión:             11.1.0.6116
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para noveve
DROP DATABASE IF EXISTS `noveve`;
CREATE DATABASE IF NOT EXISTS `noveve` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `noveve`;


-- Volcando estructura para tabla noveve.events
CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `address` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `event_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hour_init` time NOT NULL,
  `hour_end` time NOT NULL,
  `image` varchar(100) DEFAULT '',
  `path` varchar(250) DEFAULT '',
  `assistants` int(11) DEFAULT '0',
  `sede` varchar(200) DEFAULT NULL,
  `brand` varchar(200) DEFAULT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) DEFAULT '0',
  `modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=331 DEFAULT CHARSET=latin1;

-- Volcando estructura para tabla noveve.attendees
CREATE TABLE IF NOT EXISTS `attendees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cedula` int(11) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `firstname` varchar(255) DEFAULT '',
  `lastname` varchar(255) DEFAULT '',
  `speciality` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `path` varchar(250) DEFAULT NULL,
  `pdf_path` varchar(250) DEFAULT NULL,
  `brand` varchar(250) DEFAULT NULL,
  `questions` text,
  `idengage` varchar(50) DEFAULT '""',
  `register_type` varchar(50) DEFAULT NULL,
  `event_id` int(11) NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) NOT NULL DEFAULT '0',
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) NOT NULL DEFAULT '0',
  `confirm_signature` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_attendees_events` (`event_id`),
  CONSTRAINT `FK_attendees_events` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.attendees_sign
CREATE TABLE IF NOT EXISTS `attendees_sign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attendees_id` int(11) NOT NULL DEFAULT '0',
  `path_sign` varchar(250) NOT NULL,
  `event_id` int(11) NOT NULL DEFAULT '0',
  `event_date` date DEFAULT NULL,
  `is_Active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) NOT NULL DEFAULT '0',
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_attendees_sign_attendees` (`attendees_id`),
  CONSTRAINT `FK_attendees_sign_attendees` FOREIGN KEY (`attendees_id`) REFERENCES `attendees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.data_upload
CREATE TABLE IF NOT EXISTS `data_upload` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idengage` varchar(50) DEFAULT '""',
  `cedula` int(11) NOT NULL,
  `cedula_2` int(11) DEFAULT NULL,
  `cedula_3` int(11) DEFAULT NULL,
  `name` varchar(250) NOT NULL,
  `firstname` varchar(250) NOT NULL DEFAULT '',
  `lastname` varchar(250) NOT NULL DEFAULT '',
  `speciality` varchar(250) DEFAULT '',
  `speciality_2` varchar(250) DEFAULT '',
  `email` varchar(250) DEFAULT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) NOT NULL DEFAULT '0',
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) NOT NULL DEFAULT '0',
  `brand` varchar(100) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24417 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.


-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.events_date
CREATE TABLE IF NOT EXISTS `events_date` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) NOT NULL DEFAULT '0',
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_events_date_events` (`event_id`),
  CONSTRAINT `FK_events_date_events` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.load_history
CREATE TABLE IF NOT EXISTS `load_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(100) NOT NULL,
  `file_path` varchar(250) NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) NOT NULL DEFAULT '0',
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.login_and_modifications
CREATE TABLE IF NOT EXISTS `login_and_modifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `new_change` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `element` int(11) DEFAULT NULL,
  `db_table` varchar(50) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=869 DEFAULT CHARSET=utf8;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.role
CREATE TABLE IF NOT EXISTS `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `permissions` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.temporal_attendees
CREATE TABLE IF NOT EXISTS `temporal_attendees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cedula` int(11) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `firstname` varchar(255) DEFAULT '',
  `lastname` varchar(255) DEFAULT '',
  `speciality` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `path` varchar(250) DEFAULT NULL,
  `brand` varchar(250) DEFAULT NULL,
  `pdf_path` varchar(250) DEFAULT NULL,
  `questions` text,
  `idengage` varchar(50) DEFAULT '""',
  `register_type` varchar(50) DEFAULT NULL,
  `event_id` int(11) NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` tinyint(4) NOT NULL DEFAULT '0',
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` tinyint(4) NOT NULL DEFAULT '0',
  `confirm_signature` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_temporal_attendees_events` (`event_id`) USING BTREE,
  CONSTRAINT `FK_temporal_attendees_events` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla noveve.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `apellido_materno` varchar(100) NOT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `name` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(150) NOT NULL,
  `salt` varchar(20) NOT NULL,
  `avatar` varchar(250) NOT NULL,
  `path` varchar(250) NOT NULL,
  `lastlogin` timestamp NULL DEFAULT NULL,
  `password_length` tinyint(4) DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `role_id` (`role_id`) USING BTREE,
  CONSTRAINT `FK_users_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8;

-- La exportación de datos fue deseleccionada.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
