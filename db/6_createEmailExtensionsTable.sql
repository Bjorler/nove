USE `noveve`;

-- Volcando estructura para tabla noveve.email_extensions
CREATE TABLE IF NOT EXISTS `email_extensions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `extension` varchar(150) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `modified_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;