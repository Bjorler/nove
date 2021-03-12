/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` (`id`, `name`, `permissions`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 'master', '{"users":"CRUD","events":"CRUD","attendees":"CRUD","database":"CRUD","database":"CRUD","graph":"CRUD"}', 1, 1, '2021-01-28 09:39:25', 0, '2021-01-28 09:39:33', 0),
	(2, 'admin', '{"events":"CR","database":"CRUD","attendees":"CRUD"}', 1, 1, '2021-01-28 09:45:04', 0, '2021-01-28 09:45:06', 0);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `role_id`, `apellido_materno`, `apellido_paterno`, `name`, `email`, `password`, `salt`, `avatar`, `path`, `lastlogin`, `password_length`, `is_active`, `is_deleted`, `created_on`, `created_by`, `modified_on`, `modified_by`) VALUES
	(1, 1, 'Admin', 'Admin', 'Admin', 'admin@octopy.com', '$2b$10$s522TM0U/99iOwjdYtly9.DLhTxFnBeUaLxpcBc6JgzlYZzjHl1Ze', '10', '', '', '2021-03-10 17:14:44', 0, 0, 0, '2021-01-28 15:01:48', 0, '2021-03-10 17:14:43', 0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
