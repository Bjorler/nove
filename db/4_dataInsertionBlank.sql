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

-- Volcando datos para la tabla noveve_testing.attendees: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `attendees` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendees` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.data_upload: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `data_upload` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_upload` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.events: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.load_history: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `load_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `load_history` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.login_and_modifications: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `login_and_modifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_and_modifications` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.role: ~2 rows (aproximadamente)
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` (`id`, `name`, `permissions`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 'master', '{"users":"CRUD","events":"CRUD","attendees":"CRUD","database":"CRUD","database":"CRUD","graph":"CRUD"}', 1, 1, '2021-01-28 09:39:25', 0, '2021-01-28 09:39:33', 0),
	(2, 'admin', '{"events":"CR","database":"CRUD","attendees":"CRUD"}', 1, 1, '2021-01-28 09:45:04', 0, '2021-01-28 09:45:06', 0);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.temporal_attendees: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `temporal_attendees` DISABLE KEYS */;
/*!40000 ALTER TABLE `temporal_attendees` ENABLE KEYS */;

-- Volcando datos para la tabla noveve_testing.users: ~1 rows (aproximadamente)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `role_id`, `apellido_materno`, `apellido_paterno`, `name`, `email`, `password`, `salt`, `avatar`, `path`, `lastlogin`, `password_length`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(23, 1, 'Admin', 'Admin', 'Admin', 'admin@octopy.com', '$2b$10$s522TM0U/99iOwjdYtly9.DLhTxFnBeUaLxpcBc6JgzlYZzjHl1Ze', '10', '', '', '2021-02-18 10:45:15', 0, 0, 0, '2021-01-28 15:01:48', 0, '2021-02-18 10:45:15', 0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;