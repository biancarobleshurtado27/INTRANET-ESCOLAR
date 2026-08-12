(function () {
    'use strict';

    const U = window.IntranetEscolar.Utilidades;
    const Store = window.IntranetEscolar.Store;
    const CLAVE_SESION = 'intranet_escolar_sesion';

    function sesionGuardada() {
        try {
            return JSON.parse(sessionStorage.getItem(CLAVE_SESION));
        } catch (error) {
            return null;
        }
    }

    const Auth = {
        iniciarSesion(usuario, clave) {
            const persona = Store.filtrar('personas',
                (p) => U.normalizarTexto(p.usuario) === U.normalizarTexto(usuario))[0];

            if (!persona || !U.compararClave(clave, persona.clave)) {
                return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
            }

            sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
                personaId: persona.id,
                fecha: new Date().toISOString()
            }));
            return { ok: true, persona };
        },

        cerrarSesion() {
            sessionStorage.removeItem(CLAVE_SESION);
        },

        sesionActual() {
            return sesionGuardada();
        },

        personaActual() {
            const sesion = sesionGuardada();
            if (!sesion) return null;
            return Store.buscar('personas', sesion.personaId);
        }
    };

    window.IntranetEscolar = window.IntranetEscolar || {};
    window.IntranetEscolar.Auth = Auth;
})();
