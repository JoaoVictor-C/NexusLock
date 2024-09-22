-- Sample data for employees
INSERT INTO `db_nexuslock`.`employees` (`name`, `email`, `password_hash`, `pin_code`) VALUES
('John Doe', 'john.doe@example.com', '$2a$12$1234567890123456789012', '1234'),
('Jane Smith', 'jane.smith@example.com', '$2a$12$2345678901234567890123', '2345'),
('Mike Johnson', 'mike.johnson@example.com', '$2a$12$3456789012345678901234', '3456'),
('Emily Brown', 'emily.brown@example.com', '$2a$12$4567890123456789012345', '4567'),
('David Wilson', 'david.wilson@example.com', '$2a$12$5678901234567890123456', '5678');

-- Sample data for rooms
INSERT INTO `db_nexuslock`.`rooms` (`name`, `description`, `status`) VALUES
('Conference Room A', 'Large conference room with projector', 0),
('Office 101', 'Executive office', 0),
('Lab 1', 'Research laboratory', 0),
('Storage Room', 'General storage area', 0),
('Break Room', 'Employee break and relaxation area', 0);

-- Sample data for roles
INSERT INTO `db_nexuslock`.`roles` (`role_name`, `description`) VALUES
('Admin', 'Full system access'),
('Manager', 'Department management access'),
('Employee', 'Basic employee access'),
('Security', 'Security personnel access'),
('Maintenance', 'Maintenance staff access');

-- Sample data for permissions
INSERT INTO `db_nexuslock`.`permissions` (`permission_key`, `description`) VALUES
('AdminAccess', 'Full system access'),
('EDIT_USER', 'Edit existing user accounts'),
('DELETE_USER', 'Delete user accounts'),
('MANAGE_ROOMS', 'Manage room access and details'),
('VIEW_LOGS', 'View access logs');

-- Sample data for employeeroles
INSERT INTO `db_nexuslock`.`employeeroles` (`employee_id`, `role_id`) VALUES
(1, 1), -- John Doe as Admin
(2, 2), -- Jane Smith as Manager
(3, 3), -- Mike Johnson as Employee
(4, 4), -- Emily Brown as Security
(5, 5); -- David Wilson as Maintenance

-- Sample data for employeeroomaccess
INSERT INTO `db_nexuslock`.`employeeroomaccess` (`employee_id`, `room_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), -- Admin has access to all rooms
(2, 1), (2, 2), -- Manager has access to conference room and office
(3, 1), (3, 5), -- Employee has access to conference room and break room
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), -- Security has access to all rooms
(5, 3), (5, 4), (5, 5); -- Maintenance has access to lab, storage, and break room

-- Sample data for rolepermissions
INSERT INTO `db_nexuslock`.`rolepermissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), -- Admin has all permissions
(2, 2), (2, 4), (2, 5), -- Manager can edit users, manage rooms, and view logs
(3, 5), -- Employee can only view logs
(4, 4), (4, 5), -- Security can manage rooms and view logs
(5, 4), (5, 5); -- Maintenance can manage rooms and view logs

-- Sample data for accesslogs
INSERT INTO `db_nexuslock`.`accesslogs` (`employee_id`, `room_id`, `access_granted`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 1, 1),
(3, 3, 0),
(4, 4, 1),
(5, 5, 1);

-- Note: We're not inserting sample data for the usertokens table as tokens are typically generated dynamically during runtime.
