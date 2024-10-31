const pool = require('./db');

// Funciones para gestionar usuarios
const crearUsuario = async (fullname, password) => {
    const connection = await pool.getConnection();
    try {
        const query = 'CALL sp_crear_usuario(? , ?)';
        await connection.execute(query, [fullname,password]);
        return { status: true };
    } catch (error) {
        console.error('Error calling stored procedure:', error);
        return { status: false, error };
    } finally {
        connection.release();
    }
};

const loginUsuario = async (fullname, password) => {
    const connection = await pool.getConnection();
    try {
        const query = 'CALL sp_login(? , ?)';
        const result = await connection.execute(query, [fullname,password]);
        return { status: result?.id !== null ? true : false };//asesor de cadena confiable&&operador ternarios
    } catch (error) {
        console.error('Error calling stored procedure:', error);
        return { status: false, error };
    } finally {
        connection.release();
    }
}

const obtenerUsuarios = async () => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM usuarios');
        return rows;
    } finally {
        connection.release();
    }
};

async function eliminarUsuario(id) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        console.log(`Usuario con ID ${id} eliminado.`);
    } finally {
        connection.release();
    }
}

// Funciones para gestionar grupos de usuarios
async function crearGrupo(id, fullname) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('INSERT INTO grupos (id, fullname) VALUES (?, ?)', [id, fullname]);
        console.log(`Grupo ${fullname} creado.`);
    } finally {
        connection.release();
    }
}

async function eliminarGrupo(id) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('DELETE FROM grupos WHERE id = ?', [id]);
        console.log(`Grupo con ID ${id} eliminado.`);
    } finally {
        connection.release();
    }
}

async function agregarUsuarioAGrupo(idUsuario, idGrupo) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('INSERT INTO usuarios_grupos (id_usuario, id_grupo) VALUES (?, ?)', [idUsuario, idGrupo]);
        console.log(`Usuario con ID ${idUsuario} agregado al grupo con ID ${idGrupo}.`);
    } catch (err) {
        console.log(`Error al agregar usuario al grupo: ${err.message}`);
    } finally {
        connection.release();
    }
}

// Funciones para gestionar acciones del sistema
async function crearAccion(descripcion) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('INSERT INTO acciones ( descripcion) VALUES ( ?)', [ descripcion]);
        console.log(`Acción ${descripcion} creada.`);
    } finally {
        connection.release();
    }
}
async function obtenerAcciones(){
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM acciones');
        return rows;
    } finally {
        connection.release();
    }

}

async function eliminarAccion(id) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('DELETE FROM acciones WHERE id = ?', [id]);
        console.log(`Acción con ID ${id} eliminada.`);
    } finally {
        connection.release();
    }
}

// Funciones para gestionar las acciones que pueden realizar los grupos de usuarios
async function asignarAccionAGrupo(idAccion, idGrupo) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('INSERT INTO grupos_acciones (id_grupo, id_accion) VALUES (?, ?)', [idGrupo, idAccion]);
        console.log(`Acción con ID ${idAccion} asignada al grupo con ID ${idGrupo}.`);
    } catch (err) {
        console.log(`Error al asignar acción al grupo: ${err.message}`);
    } finally {
        connection.release();
    }
}

// Ejemplos de uso
(async () => {
  /*   await crearUsuario(1, "Juan");
    await crearUsuario(2, "Ana");

    await crearGrupo(1, "Administradores");
    await crearGrupo(2, "Usuarios");

    await agregarUsuarioAGrupo(1, 1);
    await agregarUsuarioAGrupo(2, 2);

    await crearAccion(1, "Crear");
    await crearAccion(2, "Eliminar");

    await asignarAccionAGrupo(1, 1);
    await asignarAccionAGrupo(2, 2);

    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    const [grupos] = await pool.query('SELECT * FROM grupos');
    const [acciones] = await pool.query('SELECT * FROM acciones');

    console.log(usuarios);
    console.log(grupos);
    console.log(acciones);

    pool.end(); */
})();

module.exports = {crearUsuario,loginUsuario,obtenerUsuarios,crearAccion,crearGrupo,eliminarUsuario,eliminarAccion,eliminarGrupo,obtenerAcciones};