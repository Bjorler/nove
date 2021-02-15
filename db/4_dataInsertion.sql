
-- Volcando datos para la tabla noveve.role
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` (`id`, `name`, `permissions`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 'master', '{"users":"CRUD","events":"CRUD","attendees":"CRUD","database":"CRUD","database":"CRUD","graph":"CRUD"}', 1, 1, '2021-01-28 09:39:25', 0, '2021-01-28 09:39:33', 0),
	(2, 'admin', '{"events":"CR","database":"CRUD","attendees":"CRUD"}', 1, 1, '2021-01-28 09:45:04', 0, '2021-01-28 09:45:06', 0);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;



-- Volcando datos para la tabla noveve.users
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `role_id`, `apellido_materno`, `apellido_paterno`, `name`, `email`, `password`, `salt`, `avatar`, `path`, `lastlogin`, `password_length`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 1, 'Admin', 'Admin', 'Admin', 'admin@octopy.com', '$2b$10$s522TM0U/99iOwjdYtly9.DLhTxFnBeUaLxpcBc6JgzlYZzjHl1Ze', '10', '', '', '2021-02-09 12:42:32', 0, 0, 0, '2021-01-28 15:01:48', 0, '2021-02-09 12:42:31', 0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;


-- Volcando datos para la tabla noveve.events
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` (`id`, `name`, `address`, `description`, `event_date`, `hour_init`, `hour_end`, `image`, `path`, `assistants`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 'Clinica y herramientas diagnósticas en genética', 'CDMX, México', 'Evento con fines de educación continua y actualización de conocimientos en cardiología', '2020-02-23 18:00:00', '12:00:00', '13:00:00', '9f39713-1.jpg', '', 3, 0, 0, '2021-02-03 20:43:51', 1, '2021-02-03 20:43:51', 1),
	(2, 'Avances Tecnológicos en genética humana', 'Monterrey, México', 'Evento con fines de educación continua y actualización de conocimientos en cardiología', '2021-02-23 18:00:00', '12:00:00', '13:00:00', '9f39713-1.jpg', '', 3, 0, 0, '2021-02-03 20:45:16', 1, '2021-02-03 20:46:16', 1);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;



-- Volcando datos para la tabla noveve.attendees
/*!40000 ALTER TABLE `attendees` DISABLE KEYS */;
INSERT INTO `attendees` (`id`, `cedula`, `name`, `firstname`, `lastname`, `speciality`, `email`, `path`, `pdf_path`, `questions`, `idengage`, `register_type`, `event_id`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 11478770, 'ILSE ITZEL BAUTISTA CRUZ', 'ILSE ITZEL', 'BAUTISTA CRUZ', 'LICENCIATURA EN CIRUJANO DENTISTA', 'ilse.bautista@z.com', '', '', '{"question1":true,"question2":true,"typeOfInstitution":"Privada","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"José Manue Hernández Melendés, director área de cardiologia","authorization":true,"idengage":"12121sds"}', '12121sds', 'excel', 1, 0, 0, '2021-02-03 20:53:38', 1, '2021-02-08 16:06:23', 1),
	(2, 11478772, 'LEONEL RAMIREZ GONZALEZ', 'LEONEL', 'RAMIREZ GONZALEZ', 'LICENCIATURA EN INGENIERÍA INFORMÁTICA', 'leonel.ramirez@z.com', '', '', '{"question1":true,"question2":true,"typeOfInstitution":"Privada","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"José Manue Hernández Melendés, director área de cardiologia","authorization":true,"idengage":"7874378jkfkj"}', '7874378jkfkj', 'excel', 1, 0, 0, '2021-02-03 21:00:02', 1, '2021-02-08 16:06:23', 1),
	(3, 11478789, 'AIDA PIÑA PERUSQUIA', 'AIDA', 'PIÑA PERUSQUIA', 'LICENCIATURA COMO CONTADOR PÚBLICO', 'aida.pina@z.com', '', '', '{"question1":true,"question2":true,"typeOfInstitution":"Privada","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"José Manue Hernández Melendés, director área de cardiologia","authorization":true,"idengage":""}', '', 'internet', 1, 0, 0, '2021-02-03 20:58:21', 1, '2021-02-08 16:06:23', 1),
	(4, 11478789, 'AIDA PIÑA PERUSQUIA', 'AIDA', 'PIÑA PERUSQUIA', 'LICENCIATURA COMO CONTADOR PÚBLICO', 'aida.pina@z.com', '', '', '{"question1":true,"question2":true,"typeOfInstitution":"Privada","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"José Manue Hernández Melendés, director área de cardiologia","authorization":true,"idengage":""}', '', 'internet', 2, 0, 0, '2021-02-03 20:58:39', 1, '2021-02-08 16:06:23', 1),
	(5, 11478772, 'LEONEL RAMIREZ GONZALEZ', 'LEONEL', 'RAMIREZ GONZALEZ', 'LICENCIATURA EN INGENIERÍA INFORMÁTICA', 'leonel.ramirez@z.com', '', '', '{"question1":true,"question2":true,"typeOfInstitution":"Privada","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"José Manue Hernández Melendés, director área de cardiologia","authorization":true,"idengage":"7874378jkfkj"}', '7874378jkfkj', 'excel', 2, 0, 0, '2021-02-03 21:00:02', 1, '2021-02-08 16:06:23', 1),
	(6, 11478767, 'GERARDO RODRIGUEZ CUTIÑO', 'GERARDO', 'RODRIGUEZ CUTIÑO', 'MAESTRÍA EN INGENIERÍA DE PROCESOS', 'gerardo.rodrigues@z.com', '', '', '{"question1":true,"question2":true,"typeOfInstitution":"Privada","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"José Manue Hernández Melendés, director área de cardiologia","authorization":true,"idengage":""}', '', 'registered', 2, 0, 0, '2021-02-03 21:01:27', 1, '2021-02-11 13:41:27',1);
/*!40000 ALTER TABLE `attendees` ENABLE KEYS */;





