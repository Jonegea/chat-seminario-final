DELIMITER //

CREATE PROCEDURE sp_crear_usuario (
    IN p_nombre VARCHAR(255) , p_password VARCHAR(255)
)
BEGIN
    INSERT INTO usuarios(nombre, password) 
    VALUES (p_nombre, p_password);
END //

DELIMITER ;

CREATE PROCEDURE sp_login (
    IN p_nombre VARCHAR(255) , p_password VARCHAR(255)
)
BEGIN
    SELECT id FROM usuarios 
    WHERE usuarios.nombre = p_nombre AND usuarios.password = p_password;