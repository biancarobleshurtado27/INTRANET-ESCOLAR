(function () {
    'use strict';

    const Utilidades = {
        escaparHTML(valor) {
            return String(valor ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        generarId(entidad) {
            return entidad + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        },

        normalizarTexto(texto) {
            return String(texto ?? '').trim().toLowerCase();
        },

        hoyISO() {
            return new Date().toISOString().slice(0, 10);
        },

        fechaDesdeHoy(dias) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + dias);
            return fecha.toISOString().slice(0, 10);
        },

        formatearFecha(iso) {
            if (!iso) return '';
            const fecha = new Date(iso);
            if (Number.isNaN(fecha.getTime())) return iso;
            return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        },

        redondear(valor) {
            return Math.round(valor * 100) / 100;
        },

        // Codificación simple solo para la demo (no es criptografía real).
        codificarClave(clave) {
            return btoa(unescape(encodeURIComponent(clave)));
        },

        compararClave(clave, codificada) {
            return this.codificarClave(clave) === codificada;
        }
    };

    window.IntranetEscolar = window.IntranetEscolar || {};
    window.IntranetEscolar.Utilidades = Utilidades;
})();
