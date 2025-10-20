-- Update associations with unique password codes
-- Each förening gets a unique code: FOR001, FOR002, etc.

USE kanban_booking;

UPDATE associations SET code_hash = '$2y$10$nhdc7VEqvZd0ILzjDDIyqe0QucYJx7G9V0OibPzF737yPYdA05F6K' WHERE id = 1; -- FOR001
UPDATE associations SET code_hash = '$2y$10$DQMfxtnOrJ.XzywKETqjtuwNFFAH.ZtpknUuCBc7oUJx3XPhx4aWS' WHERE id = 2; -- FOR002
UPDATE associations SET code_hash = '$2y$10$posgIVuyDOB758kOZd3ZuONn8luQIi7MQJ0IiET8arBWS5rSOojFm' WHERE id = 3; -- FOR003
UPDATE associations SET code_hash = '$2y$10$CjsYTJgdrSVFlOwCpB3.V.4ZZhddcZOa4NBxjsGx7b7/dS62OWAlm' WHERE id = 4; -- FOR004
UPDATE associations SET code_hash = '$2y$10$6L/aLBSVJjZsH58gJhLhUutCM8KDGKXtG6z9jogRuF89jp4CLnL8O' WHERE id = 5; -- FOR005
UPDATE associations SET code_hash = '$2y$10$8UmMEWPCZdGLAdUBzccwWeW9dTkNB/HfkC6ql5yv4cjsC9Fc7r0mS' WHERE id = 6; -- FOR006
UPDATE associations SET code_hash = '$2y$10$VcdjSxl81YzvBy19HVmVFOFckqgGKYG4Ykhzoe0oWEXysaUVaV5u2' WHERE id = 7; -- FOR007
UPDATE associations SET code_hash = '$2y$10$Wcov.XtOGLhYPKU9GSedvuvmZd5asTwh9.ZqXUDnRH8yy0xcdm2De' WHERE id = 8; -- FOR008

-- Show updated associations
SELECT id, name, 'FOR00' || id AS code FROM associations;
