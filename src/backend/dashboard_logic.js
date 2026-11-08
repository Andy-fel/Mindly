import { useState, useEffect } from 'react';

export const useDashboardLogic = () => {
    // Estado del menú lateral
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Estado para la navegación móvil inferior
    const [activeNavItem, setActiveNavItem] = useState('dashboard');

    // Estado para el hover del botón central
    const [isHoveringAise, setIsHoveringAise] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    // Efecto secundario: Bloquear scroll al abrir el sidebar
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    // Efecto secundario: Cambiar el color de fondo al hacer hover en el botón AISE
    useEffect(() => {
        // Añadimos una transición suave al body
        document.body.style.transition = 'background-color 0.8s ease';

        if (isHoveringAise) {
            document.body.style.backgroundColor = '#f7fdfd';
        } else {
            document.body.style.backgroundColor = '#fff8f9';
        }

        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.transition = '';
        };
    }, [isHoveringAise]);

    return {
        isSidebarOpen,
        toggleSidebar,
        activeNavItem,
        setActiveNavItem,
        setIsHoveringAise
    };
};